/**
 * Reads a required environment variable, failing fast with a clear error
 * if it's missing instead of letting a test fail later with `undefined`.
 */
export function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. Check your .env file.`);
  }
  return value;
}
