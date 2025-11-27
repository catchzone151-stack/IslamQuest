const DEVICE_ID_KEY = "iq_device_id";
const DEVICE_HASH_KEY = "iq_device_hash";

export const generateDeviceId = () => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);
  
  let fingerprint = "";
  if (typeof window !== "undefined") {
    fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + "x" + screen.height,
      new Date().getTimezoneOffset()
    ].join("|").substring(0, 20);
  }
  
  return `${timestamp}-${randomPart}-${randomPart2}-${btoa(fingerprint).substring(0, 8)}`;
};

export const getDeviceId = async () => {
  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    
    if (!deviceId) {
      deviceId = generateDeviceId();
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error("[DeviceService] Error getting device ID:", error);
    return generateDeviceId();
  }
};

export const hashDeviceId = async (deviceId) => {
  try {
    const cached = localStorage.getItem(DEVICE_HASH_KEY);
    const cachedData = cached ? JSON.parse(cached) : null;
    
    if (cachedData && cachedData.deviceId === deviceId) {
      return cachedData.hash;
    }
    
    const encoder = new TextEncoder();
    const data = encoder.encode(deviceId + "_iq_salt_2024");
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    
    localStorage.setItem(DEVICE_HASH_KEY, JSON.stringify({
      deviceId: deviceId,
      hash: hashHex
    }));
    
    return hashHex;
  } catch (error) {
    console.error("[DeviceService] Error hashing device ID:", error);
    return btoa(deviceId).replace(/[^a-zA-Z0-9]/g, "");
  }
};

export const clearDeviceId = () => {
  localStorage.removeItem(DEVICE_ID_KEY);
  localStorage.removeItem(DEVICE_HASH_KEY);
};

export default {
  getDeviceId,
  hashDeviceId,
  generateDeviceId,
  clearDeviceId
};
