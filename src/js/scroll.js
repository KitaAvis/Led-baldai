import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

/* ── The motion language ──────────────────────────────────────
   One easing, one rhythm, everywhere. Headlines rise out of a
   mask. Body text drifts up a few millimetres. Groups arrive in
   quiet succession. Nothing bounces, nothing zooms, nothing asks
   to be noticed. */
const EASE = 'power3.out';
const RISE_TEXT = 16; // body copy drift, px
const RISE_BLOCK = 24; // larger blocks, px
const DUR = 0.85;

export function initScroll({ video, reduced, mobile }) {
  if (reduced) {
    // Everything readable, nothing moves.
    gsap.set(
      '.reveal, .services__row, .statement__fact, .contact__lead, .contact__phone, .contact__actions, .footer__inner',
      { opacity: 1 }
    );
    gsap.set('.reveal-img', { clipPath: 'none' });
    return;
  }

  introReveal();
  navState();
  headingReveals();
  textReveals();
  groupReveals();
  contactSequence();
  statementReveal();
  footerFade();

  if (!mobile && video) {
    pinnedStory(video);
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
    .from('.hero__eyebrow', { autoAlpha: 0, y: 12, duration: 0.7 }, 0.45)
    .from('.hero__sub', { autoAlpha: 0, y: 16, duration: 0.7 }, 0.6)
    .from('.hero__cta', { autoAlpha: 0, y: 16, duration: 0.7 }, 0.72)
    .from('.nav__inner', { autoAlpha: 0, duration: 0.9 }, 0.8);
}

/* Nav gains a solid backdrop once the page is in motion. */
function navState() {
  ScrollTrigger.create({
    start: 90,
    end: 'max',
    onToggle: (self) =>
      document.querySelector('.nav').classList.toggle('nav--solid', self.isActive),
  });
}

/* The pinned hero story (the original variant): the hero pins while
   the user scrolls ~3 viewport heights, scroll drives the video
   story and its captions, then the page continues into Services. */
function pinnedStory(video) {
  const captions = gsap.utils.toArray('.hero__caption');
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

  // Timeline positions are story beats (0–100).
  tl.to({}, { duration: 1 }, 100); // hold pin to a clean 100-beat length

  // Video time follows the same smoothed clock as the captions.
  const timeProxy = { p: 0 };
  tl.to(
    timeProxy,
    {
      p: 1,
      duration: 100,
      onUpdate() {
        if (video.duration) {
          targetTime = timeProxy.p * Math.max(video.duration - 0.06, 0);
        }
      },
    },
    0
  );

  tl.to('.hero__intro', { autoAlpha: 0, y: -36, duration: 9, ease: 'power1.in' }, 4);

  // Single caption: the slogan lands as the kitchen assembles.
  tl.fromTo(
    captions[0],
    { autoAlpha: 0, y: 28 },
    { autoAlpha: 1, y: 0, duration: 8, ease: 'power2.out' },
    66
  );

  // Story progress hairline fills across the whole pinned story.
  tl.fromTo('.hero__progress-fill', { scaleY: 0 }, { scaleY: 1, duration: 100 }, 0);

  // Video scrubbing: retarget the seek to the live target every tick.
  // Browsers coalesce seeks, so the decoder always works toward the
  // newest position; scrub smoothing provides the visual easing.
  const scrubTick = () => {
    if (!video.duration) return;
    if (Math.abs(video.currentTime - targetTime) > 1 / 30) {
      video.currentTime = targetTime;
    }
  };
  gsap.ticker.add(scrubTick);
}

/* Display headings rise out of a line mask, the same gesture as
   the hero headline. One voice across the whole page. */
function headingReveals() {
  document.querySelectorAll('[data-animate="lines"]').forEach((el) => {
    const split = SplitText.create(el, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 115,
      duration: 1,
      ease: EASE,
      stagger: 0.09,
      scrollTrigger: { trigger: el, start: 'top 82%', once: true },
    });
  });
}

/* Body copy drifts up gently. Small distance, no spectacle. */
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
        scrollTrigger: { trigger: el, start: 'top 84%', once: true },
      }
    );
  });

  // Featured photo: the frame unveils once, the canvas settles from a
  // slight zoom, then keeps drifting gently against the scroll for as
  // long as it is on screen. Editorial parallax, a few percent only.
  const media = document.querySelector('.reveal-img');
  if (media) {
    gsap.fromTo(
      media,
      { clipPath: 'inset(0 0 100% 0)' },
      {
        clipPath: 'inset(0 0 0% 0)',
        duration: 1.3,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: media, start: 'top 78%', once: true },
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
          scrollTrigger: { trigger: media, start: 'top 78%', once: true },
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

/* Lists arrive in quiet succession instead of one by one. */
function groupReveals() {
  const groups = [
    { sel: '.services__row', y: RISE_BLOCK, stagger: 0.09 },
    { sel: '.statement__fact', y: RISE_TEXT, stagger: 0.12 },
  ];

  groups.forEach(({ sel, y, stagger }) => {
    gsap.set(sel, { autoAlpha: 0, y });
    ScrollTrigger.batch(sel, {
      start: 'top 86%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, { autoAlpha: 1, y: 0, duration: DUR, ease: EASE, stagger }),
    });
  });
}

/* Contact arrives as one composed sequence: invitation, then the
   number itself, then the ways to reach it. */
function contactSequence() {
  const tl = gsap.timeline({
    defaults: { ease: EASE },
    scrollTrigger: { trigger: '.contact', start: 'top 74%', once: true },
  });

  tl.fromTo('.contact__lead', { autoAlpha: 0, y: RISE_TEXT }, { autoAlpha: 1, y: 0, duration: DUR }, 0.12)
    .fromTo('.contact__phone', { autoAlpha: 0, y: RISE_BLOCK }, { autoAlpha: 1, y: 0, duration: 0.95 }, 0.26)
    .fromTo('.contact__actions', { autoAlpha: 0, y: RISE_TEXT }, { autoAlpha: 1, y: 0, duration: DUR }, 0.42);
}

/* The footer simply breathes in. */
function footerFade() {
  gsap.fromTo(
    '.footer__inner',
    { autoAlpha: 0 },
    {
      autoAlpha: 1,
      duration: 1.1,
      ease: 'power1.out',
      scrollTrigger: { trigger: '.footer', start: 'top 96%', once: true },
    }
  );
}

/* The craft statement assembles word by word, like the furniture. */
function statementReveal() {
  const line = document.querySelector('[data-split]');
  if (!line) return;

  const split = SplitText.create(line, { type: 'words', mask: 'words' });

  gsap.from(split.words, {
    yPercent: 110,
    duration: 0.85,
    stagger: 0.05,
    ease: 'power3.out',
    scrollTrigger: { trigger: line, start: 'top 78%', once: true },
  });
}
