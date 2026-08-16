# Trupeer.ai — Bug Report (Part 1)

**Tester:** Exploratory testing as a real user (signup → record → explore editor/features)
**Browser:** Google Chrome
**OS:** Windows 11
**App:** app.trupeer.ai

---

## Bug 1: Recording extension shows "Microphone access blocked" instead of triggering Chrome's native permission prompt

**Severity:** High

**Browser / OS:** Google Chrome, Windows 11

**Steps to Reproduce:**
1. On a fresh account with the Trupeer extension not yet installed, click "Start recording" from the Home page.
2. This redirects to the Chrome Web Store listing for the Trupeer extension; click "Add to Chrome" and install it.
3. Return to app.trupeer.ai and click "Start recording" again (first attempt with the extension actually installed).
4. Observe the extension's "What should we capture today?" panel and its Microphone section. (Chrome's site permission for the extension is at its default "Ask" state at this point — confirmed separately via `chrome://extensions` → Trupeer → Site permissions.)

**Expected Behaviour:** Since Chrome's permission is at its default "Ask" state, opening the recording panel should trigger Chrome's native microphone permission prompt near the address bar.

**Actual Behaviour:** Chrome's native prompt never appears. The extension immediately shows a red "Microphone access blocked" error — even though Chrome itself was never asked and had never blocked anything — forcing the user into "Fix it in Chrome settings," manually toggling the OS/browser mic permission, then clicking "Try again" back in the extension panel before recording will work. This happens specifically on the first recording attempt after installing the extension / logging in; once resolved manually, it does not recur for the rest of that session.

**Reproduction confirmed independently on two separate accounts**, following the identical sequence both times (Start recording → extension install redirect → Start recording again → blocked-mic panel → manual Chrome-settings fix required), which rules out this being a one-off account-specific fluke.

---

## Bug 2: "Forgot password" shows a false success message for Google SSO accounts; no reset email is ever sent

**Severity:** High

**Browser / OS:** Google Chrome, Windows 11

**Steps to Reproduce:**
1. Sign up for a new account using "Continue with Google."
2. Log out and go to the Login page.
3. Click "Forgot password?" and enter the same Google-associated email.
4. Submit, then check that account's inbox.

**Expected Behaviour:** The system should either send a reset link that lets the user set a local password, or show an informative message such as "This account uses Google Login — please log in using Google."

**Actual Behaviour:** The form shows a green checkmark and "Please check your inbox for the reset link" with no error at any point — but no email of any kind arrives. Verified end-to-end with a real Google account created for this test; the account owner confirmed 0 emails received.

---

## Bug 3: Analytics quick-view displays data inflated by ~1000x compared to the full analytics page

**Severity:** High

**Browser / OS:** Google Chrome, Windows 11

**Steps to Reproduce:**
1. Open a published video with accumulated views in the editor.
2. Click the Analytics icon to open the quick-view dropdown; note "Avg watch time" and "Avg time on page."
3. Click "View full analytics" and compare the same two metrics on the full page for the same video.

**Expected Behaviour:** The quick-view dropdown should show the same figures as the full analytics dashboard for the same video.

**Actual Behaviour:** For a video that is 2:31 long, the quick-view dropdown showed "Avg watch time: 4h 47m" and "Avg time on page: 12h 39m." The full analytics page for the exact same video (Total views matched at 14 on both) showed "Avg watch time: 17s" and "Avg time on page: 46s" — the only plausible figures for a 2.5-minute video. The discrepancy is roughly three orders of magnitude and directly undermines trust in the analytics feature.

---

## Bug 4: Knowledge Base URL field accepts invalid characters and silently rewrites them without telling the user

**Severity:** Medium

**Browser / OS:** Google Chrome, Windows 11

**Steps to Reproduce:**
1. Navigate to Knowledge Base → "Create knowledge base."
2. In the "Knowledgebase URL" field, type a value with invalid subdomain characters, e.g. `zz@@##xx!!`.
3. Observe the availability message, then click "Create knowledge base."
4. Open the created KB's Configure tab and compare the URL field / live preview to what was typed.

**Expected Behaviour:** The field should reject or strip invalid characters as the user types (with a visible corrected preview), or at minimum show the actual slug that will be used before the user confirms creation.

**Actual Behaviour:** The field accepts special characters with no client-side validation — the availability check even returns "This URL is available." for the literal string `zz@@##xx!!`, and the create button is fully enabled. On submit, the backend silently strips the invalid characters and collapses the value to `zz-xx`, a materially different string than what the user typed, saw marked "available," and approved.

---

## Bug 5: Closed Captions (CC) toggle in the video editor is not wired to any control

**Severity:** Medium

**Browser / OS:** Google Chrome, Windows 11

**Steps to Reproduce:**
1. Open a video in the Trupeer editor with a populated Script panel.
2. Locate the "CC" icon in the playback toolbar below the video preview.
3. Click it, and inspect the underlying DOM element rather than relying on appearance alone.

**Expected Behaviour:** Clicking CC should toggle caption/subtitle rendering in the preview. If some prerequisite is missing, it should at least be a real disabled button with an explanatory tooltip.

**Actual Behaviour:** Clicking produces no visible change at all — no captions appear, no toggled state. A DOM-level inspection confirmed why: at the CC icon's exact position there is no button, no `role="button"`, and no click handler — just a static SVG icon. Its neighboring controls (crop tool, aspect-ratio selector) ARE real interactive elements at the same toolbar row. Unlike a disabled button, it carries no greyed-out styling either, so there's no visual cue it doesn't work.

---

## Bug 6: Background swatch selector's `aria-checked` state never updates

**Severity:** Low

**Browser / OS:** Google Chrome, Windows 11

**Steps to Reproduce:**
1. Open a video in the editor and go to the Visuals > Background tab.
2. Inspect the background swatch grid — it's marked up as an ARIA `radiogroup` with `role="radio"` items.
3. Click a swatch that is not currently selected.
4. Check the `aria-checked` attribute on the swatches before and after the click.

**Expected Behaviour:** After clicking a swatch, that swatch's `aria-checked` should become "true" and the previously selected swatch's should become "false," matching the visual checkmark indicator.

**Actual Behaviour:** `aria-checked` reads "false" on every swatch both before and after clicking, regardless of which one is visually selected (indicated only by a green checkmark badge). Verified directly by dumping all swatches' `aria-checked` values before and after a click — none change. Real accessibility defect: screen reader users have no way to determine which background is actually selected.

---

## Bug 7: "Rewrite with AI" accepts an empty prompt with no validation

**Severity:** Low

**Browser / OS:** Google Chrome, Windows 11

**Steps to Reproduce:**
1. In the Script panel, click the "Rewrite script again with AI" (wand) icon to open the "Rewrite with AI" popover.
2. Leave the prompt textarea empty.
3. Click "Rewrite script."

**Expected Behaviour:** The button should be disabled with an empty prompt, or clicking it should show a validation message asking the user to enter instructions.

**Actual Behaviour:** The button remains enabled and clickable. Submitting fires a real request to the rewrite API with no prompt text, and the app performs a generic rewrite of the script anyway, silently replacing the existing script text with no indication to the user that no instructions were given. No data-loss risk since this only rewrites AI-suggested script content, but it wastes an AI generation call and could surprise a user who clicked before typing.

---

## Bug 8: AI Voiceover mispronounces the technical acronym "npm" as "num"

**Severity:** Low

**Browser / OS:** Google Chrome, Windows 11

**Steps to Reproduce:**
1. Navigate to the Script tab in the Trupeer editor.
2. Enter a sentence containing the Node Package Manager acronym, such as: "run npm init Playwright test."
3. Generate the AI voiceover for that specific scene.
4. Play back the audio and listen to the pronunciation of "npm."

**Expected Behaviour:** The TTS engine should recognize "npm" as a standard technical acronym and pronounce it as individual letters ("N-P-M").

**Actual Behaviour:** The TTS engine phonetically pronounces the acronym as the word "num," resulting in inaccurate and confusing audio instructions — a speech/pronunciation-level defect rather than a text or logic bug.