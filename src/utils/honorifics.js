const HONORIFIC = '\uFDFA'; // ﷺ (U+FDFA)

/**
 * Normalises Islamic honorific placement in any text string.
 *
 * Rules:
 *  - ﷺ must appear only once, directly after "Muhammad"
 *  - ﷺ must NOT appear after "Prophet" alone
 *  - Idempotent — safe to call multiple times on the same string
 *
 * Strategy: strip all existing ﷺ, then re-insert after every "Muhammad".
 * This automatically handles misplacements, duplicates, and missing instances.
 */
export function applyHonorifics(text) {
  if (!text || typeof text !== 'string') return text;
  // 1. Remove every existing ﷺ (with any leading space)
  let result = text.replace(/\s*\uFDFA/g, '');
  // 2. Add exactly one ﷺ after each occurrence of "Muhammad"
  result = result.replace(/\bMuhammad\b/g, `Muhammad ${HONORIFIC}`);
  return result;
}
