/**
 * Hero video setup.
 *
 * Desktop: scrub-optimized file, playback position driven by scroll (scroll.js).
 * Mobile:  lighter file, plays once and rests on the finished-kitchen frame.
 * Reduced motion: video swapped for the final still image.
 */
export function initHeroVideo({ reduced, mobile }) {
  const video = document.querySelector('.hero__video');
  if (!video) return null;

  if (reduced) {
    const img = document.createElement('img');
    img.className = 'hero__still';
    img.src = '/img/kitchen-final.jpg';
    img.alt = '';
    video.replaceWith(img);
    return null;
  }

  video.src = mobile ? '/video/hero-mobile.mp4' : '/video/hero.mp4';

  if (mobile) {
    const tryPlay = () => video.play().catch(() => {});
    if (video.readyState >= 2) tryPlay();
    else video.addEventListener('canplay', tryPlay, { once: true });
    // Story plays once; the warm finished kitchen stays as the resting frame.
  } else {
    // Desktop: playback position is owned by scroll. Never autoplays.
    video.autoplay = false;
    video.pause();
  }

  return video;
}
