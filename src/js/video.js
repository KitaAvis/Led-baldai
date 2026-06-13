/**
 * Hero video setup.
 *
 * Playback position is always owned by scroll (scroll.js) — the video
 * never autoplays. Desktop uses the scrub-optimized file; mobile uses a
 * lighter file. Reduced motion swaps the video for the final still.
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

  video.autoplay = false;
  // iOS needs these set as attributes (not just props) to allow inline,
  // gesture-free playback that primes the decoder for scrubbing.
  video.muted = true;
  video.defaultMuted = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.setAttribute('preload', 'auto');
  video.src = mobile ? '/video/hero-mobile.mp4' : '/video/hero.mp4';

  if (mobile) {
    // iOS won't paint a frame from a video that has never been played, so
    // scrubbing (setting currentTime) shows nothing until the decoder is
    // primed by a real play(). Autoplay-prime works on Android and some
    // iOS; for the rest, the FIRST user gesture (touch/scroll) is honored
    // by iOS and primes it reliably.
    // Prime on the first touch only. We must not prime on load with a
    // bare play(): play() advances currentTime and fights the scrubber.
    // On the first touch we play one beat, snap back to the scroll's
    // target, and hand control back — after that, iOS repaints on seek.
    let primed = false;
    const prime = () => {
      if (primed) return;
      primed = true;
      const p = video.play();
      const settle = () => {
        video.pause();
        // Undo the tiny advance from priming; the scrubber takes over.
        video.currentTime = 0;
      };
      if (p && p.then) p.then(settle).catch(() => { primed = false; });
      else settle();
    };

    const events = ['touchstart', 'pointerdown'];
    const detach = () =>
      events.forEach((ev) => window.removeEventListener(ev, gesturePrime));
    const gesturePrime = () => {
      prime();
      if (primed) detach();
    };
    events.forEach((ev) =>
      window.addEventListener(ev, gesturePrime, { passive: true })
    );
  } else {
    video.pause();
  }

  return video;
}
