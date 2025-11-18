// src/utils/imagePreloader.js
import assets from '../assets/assets';

const preloadedImages = new Set();

export function preloadImage(src) {
  return new Promise((resolve, reject) => {
    if (preloadedImages.has(src)) {
      resolve(src);
      return;
    }

    const img = new Image();
    img.onload = () => {
      preloadedImages.add(src);
      resolve(src);
    };
    img.onerror = reject;
    img.src = src;
  });
}

export function preloadImages(srcArray) {
  return Promise.all(srcArray.map(src => preloadImage(src)));
}

export async function preloadCriticalAssets() {
  const criticalAssets = [
    // UI Icons (most frequently used)
    assets.ui.ui_coin,
    assets.ui.ui_xp,
    assets.ui.ui_streak,
    assets.ui.ui_shield,

    // Critical Mascots (home, quiz, rewards)
    assets.mascots.mascot_zayd_happy,
    assets.mascots.mascot_zayd_teaching,
    assets.mascots.mascot_zayd_thinking,
    assets.mascots.mascot_zayd_cheer,
    assets.mascots.mascot_zayd_default,
    assets.mascots.mascot_zayd_challenge,

    // All avatars (needed for profile, friends, avatar selection)
    ...Object.values(assets.avatars),
  ];

  try {
    await preloadImages(criticalAssets);
    console.log('✅ Critical assets preloaded');
  } catch (error) {
    console.warn('⚠️ Some assets failed to preload:', error);
  }
}

export async function preloadAllMascots() {
  const mascots = Object.values(assets.mascots);
  try {
    await preloadImages(mascots);
    console.log('✅ All mascots preloaded');
  } catch (error) {
    console.warn('⚠️ Some mascots failed to preload:', error);
  }
}

export async function preloadAllCertificates() {
  const certificates = Object.values(assets.certificates);
  try {
    await preloadImages(certificates);
    console.log('✅ All certificates preloaded');
  } catch (error) {
    console.warn('⚠️ Some certificates failed to preload:', error);
  }
}

export function isPreloaded(src) {
  return preloadedImages.has(src);
}
