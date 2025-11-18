// src/utils/imagePreloader.js
import assets from '../assets/assets';

const preloadedImages = new Set();

export function preloadImage(src) {
  return new Promise((resolve) => {
    if (preloadedImages.has(src)) {
      resolve(src);
      return;
    }

    const img = new Image();
    img.onload = () => {
      preloadedImages.add(src);
      resolve(src);
    };
    img.onerror = () => {
      // Resolve anyway to avoid breaking the promise chain
      resolve(src);
    };
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

  await preloadImages(criticalAssets);
}

export async function preloadAllMascots() {
  const mascots = Object.values(assets.mascots);
  await preloadImages(mascots);
}

export async function preloadAllCertificates() {
  const certificates = Object.values(assets.certificates);
  await preloadImages(certificates);
}

export function isPreloaded(src) {
  return preloadedImages.has(src);
}
