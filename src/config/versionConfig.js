// Version configuration for update checking
export const LOCAL_VERSION = "1.0.0";
export const REMOTE_VERSION = "1.0.0"; // Can be updated to trigger update banner

export function shouldShowUpdateBanner() {
  return REMOTE_VERSION > LOCAL_VERSION;
}
