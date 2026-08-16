import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import { getEnvVar } from '../part2/utils/env';

const Criterion = z.object({
  pass: z.boolean(),
  reason: z.string().describe('One-sentence explanation for this verdict.'),
});

// The model judges each criterion independently. Whether the overall
// response passes is a plain "all five passed" check done in code afterward
// (see validate.ts) rather than asking the model to compute it — that's
// arithmetic, not judgment.
export const JudgmentSchema = z.object({
  intentMatch: Criterion,
  coherenceAndGrammar: Criterion,
  informationPreservation: Criterion,
  meaningfulTransformation: Criterion,
  lengthScopeSanity: Criterion,
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('Overall confidence in these judgments, from 0 to 1.'),
});

export type Judgment = z.infer<typeof JudgmentSchema>;

function getClient(): Anthropic {
  const provider = getEnvVar('LLM_PROVIDER');
  if (provider !== 'claude') {
    throw new Error(
      `Unsupported LLM_PROVIDER "${provider}" — only "claude" is currently implemented.`
    );
  }
  return new Anthropic({ apiKey: getEnvVar('LLM_API_KEY') });
}

const SYSTEM_PROMPT = `You are a QA judge evaluating an AI script-rewrite feature in a video editing app. You are given the original script, the user's prompt describing the requested change, and the script that resulted from applying that prompt. Judge the result against five independent criteria and explain your reasoning for each.`;

function buildUserPrompt(originalScript: string, prompt: string, modifiedScript: string): string {
  return `Original script:
"""
${originalScript}
"""

User's prompt to the AI rewrite feature:
"${prompt}"

Resulting script after the AI rewrite:
"""
${modifiedScript}
"""

Evaluate the resulting script against these five criteria:
1. Intent match — does it reflect the intent of the user's prompt? (e.g. if asked to "add a call to action," is one actually present?)
2. Coherence & grammar — is it coherent, grammatically correct, and free of broken/garbled text?
3. Information preservation — does it preserve the core information/message from the original script, unless the prompt explicitly asked to remove or change it?
4. Meaningful transformation — is it meaningfully different from the original, not just a trivial rewording or near-identical copy?
5. Length/scope sanity — is it a reasonable length relative to the original (not truncated mid-sentence, not wildly longer/shorter than the prompt would justify)?

For each criterion, give a pass/fail verdict and a one-sentence reason grounded in the actual text above.`;
}

export async function judgeScriptModification(params: {
  originalScript: string;
  prompt: string;
  modifiedScript: string;
}): Promise<Judgment> {
  const client = getClient();

  const response = await client.messages.parse({
    model: 'claude-sonnet-5',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: buildUserPrompt(params.originalScript, params.prompt, params.modifiedScript) },
    ],
    // This is a straightforward classification task, not deep reasoning —
    // low effort is enough and keeps four judge calls fast and cheap.
    output_config: {
      effort: 'low',
      format: zodOutputFormat(JudgmentSchema),
    },
  });

  if (!response.parsed_output) {
    throw new Error('LLM judge response did not match the expected JSON shape.');
  }
  return response.parsed_output;
}
