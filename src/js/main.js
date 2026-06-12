import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/archivo/wdth-italic.css';
import '@fontsource-variable/hanken-grotesk';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/cormorant-garamond/600-italic.css';
import '../css/main.css';

import { initHeroVideo } from './video.js';
import { initScroll } from './scroll.js';

document.documentElement.classList.add('js');

const media = {
  reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  mobile: window.matchMedia('(max-width: 768px)').matches,
};

const video = initHeroVideo(media);
initScroll({ video, ...media });
