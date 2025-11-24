export function getDeviceFingerprint() {
  let fp = localStorage.getItem("iq_device_fp");
  if (!fp) {
    fp = crypto.randomUUID();
    localStorage.setItem("iq_device_fp", fp);
  }
  return fp;
}
