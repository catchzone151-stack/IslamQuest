export async function safeCall(fn, fallback = null) {
  try {
    const res = await fn();
    if (res?.error) throw res.error;
    return res;
  } catch (e) {
    console.warn("[safeCall] failed:", e.message);
    return fallback;
  }
}
