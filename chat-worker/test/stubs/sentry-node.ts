// Offline stand-in for @sentry/node so the backup handler bundles in tests.
export function init() {}
export function setTag() {}
export function captureMessage() {}
export function captureException() {}
export function withScope(callback: (scope: Record<string, () => void>) => void) {
  callback({ setTag() {}, setExtra() {}, setExtras() {}, setLevel() {}, setFingerprint() {}, setContext() {} });
}
export async function flush() {
  return true;
}
