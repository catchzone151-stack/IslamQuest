const IOS_APP_STORE_ID = "6745142588";
const ANDROID_PACKAGE = "com.islamquest.app";

export const openAppStore = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
  const isAndroid = /android/i.test(userAgent);

  if (isIOS) {
    const url = `itms-apps://itunes.apple.com/app/id${IOS_APP_STORE_ID}`;
    const webUrl = `https://apps.apple.com/app/id${IOS_APP_STORE_ID}`;
    
    try {
      window.location.href = url;
      setTimeout(() => {
        window.open(webUrl, "_blank");
      }, 1000);
    } catch {
      window.open(webUrl, "_blank");
    }
  } else if (isAndroid) {
    const url = `market://details?id=${ANDROID_PACKAGE}`;
    const webUrl = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
    
    try {
      window.location.href = url;
      setTimeout(() => {
        window.open(webUrl, "_blank");
      }, 1000);
    } catch {
      window.open(webUrl, "_blank");
    }
  } else {
    window.open(`https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`, "_blank");
  }
};
