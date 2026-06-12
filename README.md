# LED BALDAI

Premium one-page website for LED BALDAI, a furniture assembly and installation
service in Klaipėda, Lithuania.

## Stack

- Vite + vanilla JS (ES modules)
- GSAP (ScrollTrigger, SplitText) for the pinned scroll-driven video story
- CSS custom properties design system (no framework)
- Self-hosted variable fonts: Archivo (display, width axis) + Hanken Grotesk (body)

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Video pipeline

Source video lives outside the repo. Encoded variants in `public/video/`:

- `hero.mp4` - desktop scrub version (dense keyframes, `-g 12`, CRF 26, 900p)
- `hero-mobile.mp4` - mobile autoplay version (720p, CRF 28)
- `poster.jpg` - first frame poster

Re-encode with ffmpeg if the source changes:

```bash
ffmpeg -i video.mp4 -vf "scale=-2:900" -c:v libx264 -preset slow -crf 26 \
  -g 12 -keyint_min 12 -pix_fmt yuv420p -an -movflags +faststart hero.mp4
```

## Deploy

Push to GitHub, import the repo in Vercel. Framework preset: Vite.
Build command `npm run build`, output directory `dist`. No env vars needed.
