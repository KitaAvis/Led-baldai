import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

// Don't tear down and rebuild triggers when the mobile browser toolbar
// shows/hides (which changes innerHeight). Keeps scrubbing smooth on iOS.
ScrollTrigger.config({ ignoreMobileResize: true });

/* ── The motion language ──────────────────────────────────────
   One easing, one rhythm, everywhere. Headlines rise out of a
   mask. Body text drifts up a few millimetres. Groups arrive in
   quiet succession. Everything is reversible: scroll back up and
   the page settles, scroll down again and it plays again. */
const EASE = 'power3.out';
const RISE_TEXT = 16; // body copy drift, px
const RISE_BLOCK = 24; // larger blocks, px
const DUR = 0.85;
const TOGGLE = 'play none none reverse'; // forward on enter, reverse on leave-back

export function initScroll({ video, reduced, mobile }) {
  if (reduced) {
    // Everything readable, nothing moves.
    gsap.set(
      '.reveal, .services__row, .statement__fact, .contact__lead, .contact__phone, .contact__actions, .footer__inner, .hero__caption-line',
      { opacity: 1 }
    );
    gsap.set('.reveal-img', { clipPath: 'none' });
    return;
  }

  introReveal();
  headingReveals();
  textReveals();
  groupReveals();
  contactSequence();
  footerFade();

  if (video) {
    // Desktop: the hero pins and scrubs. Mobile: the hero stays in
    // flow with a native sticky stage that scrubs as the page moves,
    // so it never feels locked and never janks on iOS.
    if (mobile) mobileStory(video);
    else pinnedStory(video);
  }
}

/* Page-load reveal: headline lines rise, then support content follows. */
function introReveal() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.from('.hero__line > span', {
    yPercent: 115,
    duration: 1.1,
    stagger: 0.12,
    delay: 0.15,
  })
    .from('.hero__sub', { autoAlpha: 0, y: 16, duration: 0.7 }, 0.6)
    .from('.hero__cta', { autoAlpha: 0, y: 16, duration: 0.7 }, 0.72)
    .from('.nav__inner', { autoAlpha: 0, duration: 0.9 }, 0.8);
}

/* Shared scrubber: drive video.currentTime toward the scroll target on
   the ticker. `minInterval` rate-limits seeks (mobile decoders can't keep
   up with a seek every frame during a fast flick); the `seeking` guard
   stops requests from piling up while the decoder is busy. */
function attachScrub(video, getTarget, opts = {}) {
  const minInterval = opts.minInterval || 0; // ms between seeks; 0 = every frame
  const threshold = opts.threshold || 1 / 30; // seconds of drift worth a seek
  let last = 0;
  const tick = () => {
    if (!video.duration || video.seeking) return;
    const target = getTarget();
    if (Math.abs(video.currentTime - target) <= threshold) return;
    if (minInterval) {
      const now = performance.now();
      if (now - last < minInterval) return;
      last = now;
    }
    video.currentTime = target;
  };
  gsap.ticker.add(tick);
}

/* DESKTOP — the pinned hero story. The hero pins while the user scrolls
   ~3 viewport heights; scroll drives the video and the closing slogan. */
function pinnedStory(video) {
  let targetTime = 0;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: '+=320%',
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
    defaults: { ease: 'none' },
  });

  tl.to({}, { duration: 1 }, 100); // hold pin to a clean 100-beat length

  const timeProxy = { p: 0 };
  tl.to(
    timeProxy,
    {
      p: 1,
      duration: 100,
      onUpdate() {
        if (video.duration) targetTime = timeProxy.p * Math.max(video.duration - 0.06, 0);
      },
    },
    0
  );

  tl.to('.hero__intro', { autoAlpha: 0, y: -36, duration: 9, ease: 'power1.in' }, 4);

  // Closing slogan: the final 20% of the story. The kitchen has settled;
  // each line breathes in with a soft fade and a 14px rise, gently
  // staggered. Scroll-linked, so it reverses cleanly on the way back.
  tl.fromTo(
    '.hero__caption-line',
    { autoAlpha: 0, y: 14 },
    { autoAlpha: 1, y: 0, duration: 7, stagger: 3.5, ease: 'power2.out' },
    80
  );

  tl.fromTo('.hero__progress-fill', { scaleY: 0 }, { scaleY: 1, duration: 100 }, 0);

  attachScrub(video, () => targetTime);
}

/* MOBILE — unpinned scroll narrative. The hero is a tall section in
   normal flow; a native sticky stage holds the cinematic frame while
   the page scrolls through, scrubbing the story. No GSAP pin, no lock:
   the page keeps moving and the stage releases naturally into Services. */
function mobileStory(video) {
  const STORY = 0.82; // story completes before the stage releases
  let targetTime = 0;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      invalidateOnRefresh: true,
    },
    defaults: { ease: 'none' },
  });

  const timeProxy = { p: 0 };
  tl.to(
    timeProxy,
    {
      p: 1,
      duration: 100 * STORY,
      onUpdate() {
        if (video.duration) targetTime = timeProxy.p * Math.max(video.duration - 0.06, 0);
      },
    },
    0
  );

  // Intro stays put on mobile (its row must not empty). Only the slogan
  // reveals over the finished kitchen — the final 20% of the story, each
  // line breathing in with a soft staggered fade + 14px rise.
  tl.fromTo(
    '.hero__caption-line',
    { autoAlpha: 0, y: 14 },
    { autoAlpha: 1, y: 0, duration: 7, stagger: 3.5, ease: 'power2.out' },
    80
  );
  tl.to({}, { duration: 100 }, 0); // anchor timeline length to 100 beats

  // Rate-limit seeks to ~14fps so the mobile decoder never falls behind.
  attachScrub(video, () => targetTime, { minInterval: 70, threshold: 0.06 });
}

/* Display headings rise out of a line mask. Reversible. */
function headingReveals() {
  document.querySelectorAll('[data-animate="lines"]').forEach((el) => {
    const split = SplitText.create(el, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 115,
      duration: 1,
      ease: EASE,
      stagger: 0.09,
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: TOGGLE },
    });
  });
}

/* Body copy drifts up gently. Reversible. */
function textReveals() {
  gsap.utils.toArray('.reveal').forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: RISE_TEXT },
      {
        autoAlpha: 1,
        y: 0,
        duration: DUR,
        ease: EASE,
        scrollTrigger: { trigger: el, start: 'top 86%', toggleActions: TOGGLE },
      }
    );
  });

  // Featured photo: the frame wipes open, the canvas settles from a
  // slight zoom (both reversible), then keeps a gentle parallax drift.
  const media = document.querySelector('.reveal-img');
  if (media) {
    gsap.fromTo(
      media,
      { clipPath: 'inset(0 0 100% 0)' },
      {
        clipPath: 'inset(0 0 0% 0)',
        duration: 1.3,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: media, start: 'top 82%', toggleActions: TOGGLE },
      }
    );

    const canvas = media.querySelector('.services__featured-canvas');
    if (canvas) {
      gsap.fromTo(
        canvas,
        { scale: 1.07 },
        {
          scale: 1,
          duration: 1.6,
          ease: 'power3.out',
          scrollTrigger: { trigger: media, start: 'top 82%', toggleActions: TOGGLE },
        }
      );

      gsap.fromTo(
        canvas,
        { yPercent: -3.5 },
        {
          yPercent: 3.5,
          ease: 'none',
          scrollTrigger: {
            trigger: media,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }
  }
}

/* Lists arrive in quiet succession, and retreat the same way on the
   way back up. */
function groupReveals() {
  const groups = [
    { sel: '.services__row', y: RISE_BLOCK, stagger: 0.09 },
    { sel: '.statement__fact', y: RISE_TEXT, stagger: 0.12 },
  ];

  groups.forEach(({ sel, y, stagger }) => {
    gsap.set(sel, { autoAlpha: 0, y });
    ScrollTrigger.batch(sel, {
      start: 'top 88%',
      onEnter: (batch) =>
        gsap.to(batch, { autoAlpha: 1, y: 0, duration: DUR, ease: EASE, stagger, overwrite: true }),
      onLeaveBack: (batch) =>
        gsap.to(batch, {
          autoAlpha: 0,
          y,
          duration: DUR * 0.6,
          ease: 'power2.in',
          stagger: { each: 0.04, from: 'end' },
          overwrite: true,
        }),
    });
  });
}

/* Contact arrives as one composed sequence; reverses as a whole. */
function contactSequence() {
  const tl = gsap.timeline({
    defaults: { ease: EASE },
    scrollTrigger: { trigger: '.contact', start: 'top 78%', toggleActions: TOGGLE },
  });

  tl.fromTo('.contact__lead', { autoAlpha: 0, y: RISE_TEXT }, { autoAlpha: 1, y: 0, duration: DUR }, 0.12)
    .fromTo('.contact__phone', { autoAlpha: 0, y: RISE_BLOCK }, { autoAlpha: 1, y: 0, duration: 0.95 }, 0.26)
    .fromTo('.contact__actions', { autoAlpha: 0, y: RISE_TEXT }, { autoAlpha: 1, y: 0, duration: DUR }, 0.42);
}

/* The footer breathes in, and out. */
function footerFade() {
  gsap.fromTo(
    '.footer__inner',
    { autoAlpha: 0 },
    {
      autoAlpha: 1,
      duration: 1.1,
      ease: 'power1.out',
      scrollTrigger: { trigger: '.footer', start: 'top 96%', toggleActions: TOGGLE },
    }
  );
}
