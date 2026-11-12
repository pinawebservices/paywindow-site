# PayWindow landing site

Static site (`index.html`, `style.css`, `assets/`), hosted on Vercel (project `paywindow-landing`), connected to GitHub `pinawebservices/paywindow-site`. **Pushing to `main` deploys to production.**

## Validating changes

Every change gets these checks before it's pushed to `main`:

1. **Local:** serve the folder (`python3 -m http.server 8765 --bind 127.0.0.1`) and check it at desktop width and at a 390px mobile width, with no sideways scroll. Local browsers cache `style.css`, so force a fresh copy when checking CSS changes.
2. **Vercel preview:** run `vercel deploy` (**never `--prod`**) and check the preview URL. Previews are behind Vercel login, so use a signed-in browser rather than curl. Confirm the page renders and the response headers look right: `/assets/*` should return `Cache-Control: public, max-age=604800, stale-while-revalidate=86400`.
3. Only then commit and push to `main`.

## Images

- Screenshot originals are in `assets/screenshots/src/` (1284×2778, **iPhone 14 Plus** simulator). They're kept out of the deploy by `.vercelignore`.
- Run `./scripts/optimize-images.sh` to rebuild the served WebP screenshots (540w/800w) and the icon sizes.
- When replacing screenshots, bump `VERSION` in the script and the `-vN` filenames in `index.html`. Assets are cached for 7 days, so they need new names to show up.
- Keep phone screenshots untilted: rotating them with CSS makes the small text jagged.
