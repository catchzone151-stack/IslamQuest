import { Capacitor } from "@capacitor/core";
import { NativeMarket } from "@capacitor-community/native-market";

const IOS_APP_STORE_ID = "6745142588";
const ANDROID_PACKAGE = "com.islamquest.app";

export const openAppStore = async () => {
  const platform = Capacitor.isNativePlatform() ? Capacitor.getPlatform() : "web";
  
  console.log("[AppStore] Opening store for platform:", platform);
  
  try {
    if (platform === "android") {
      console.log("[AppStore] Using NativeMarket for Android:", ANDROID_PACKAGE);
      await NativeMarket.openStoreListing({ appId: ANDROID_PACKAGE });
      console.log("[AppStore] NativeMarket.openStoreListing succeeded");
      return { success: true, method: "native_market", platform };
    }
    
    if (platform === "ios") {
      console.log("[AppStore] Using NativeMarket for iOS:", IOS_APP_STORE_ID);
      await NativeMarket.openStoreListing({ appId: `id${IOS_APP_STORE_ID}` });
      console.log("[AppStore] NativeMarket.openStoreListing succeeded");
      return { success: true, method: "native_market", platform };
    }
    
    console.log("[AppStore] Web platform - opening URL in new tab");
    const userAgent = navigator.userAgent || "";
    const isIOSBrowser = /iPad|iPhone|iPod/.test(userAgent);
    
    if (isIOSBrowser) {
      window.open(`https://apps.apple.com/app/id${IOS_APP_STORE_ID}`, "_blank");
    } else {
      window.open(`https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`, "_blank");
    }
    
    return { success: true, method: "web", platform };
  } catch (error) {
    console.error("[AppStore] NativeMarket failed, trying fallback:", error);
    
    try {
      const userAgent = navigator.userAgent || "";
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      
      if (isIOS) {
        window.open(`https://apps.apple.com/app/id${IOS_APP_STORE_ID}`, "_blank");
      } else {
        window.open(`https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`, "_blank");
      }
      
      return { success: true, method: "web_fallback", platform };
    } catch (fallbackError) {
      console.error("[AppStore] All methods failed:", fallbackError);
      return { success: false, error: fallbackError.message, platform };
    }
  }
};

export const forceOpenStore = async () => {
  console.log("[AppStore] FORCE opening store - this MUST trigger a visible action");
  const result = await openAppStore();
  console.log("[AppStore] Force open result:", result);
  return result;
};
