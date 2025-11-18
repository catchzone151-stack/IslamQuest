// src/utils/imagePreloader.js
// Comprehensive image preloader using Vite's import.meta.glob to automatically
// capture ALL images in the project for instant Duolingo-style loading

const preloadedImages = new Set();

// Automatically import ALL images from assets directory
const allImages = import.meta.glob('../assets/**/*.{webp,png,jpg,jpeg}', { 
  eager: true,
  import: 'default'
});

// Extract all image URLs from the glob import
const allImageUrls = Object.values(allImages);

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

// Preload EVERYTHING immediately - all 81+ images
export async function preloadAllAssets() {
  console.log(`🚀 Preloading ${allImageUrls.length} images for instant rendering...`);
  const startTime = performance.now();
  
  await preloadImages(allImageUrls);
  
  const endTime = performance.now();
  console.log(`✅ All ${allImageUrls.length} images preloaded in ${(endTime - startTime).toFixed(0)}ms`);
}

export function isPreloaded(src) {
  return preloadedImages.has(src);
}

export function getPreloadedCount() {
  return preloadedImages.size;
}

export function getAllImageUrls() {
  return allImageUrls;
}
