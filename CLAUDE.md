# PayWindow landing site

Static site (`index.html`, `style.css`, `assets/`), hosted on Vercel (project `paywindow-landing`), connected to GitHub `pinawebservices/paywindow-site`. **Pushing to `main` deploys to production.**

## Validating changes

Every change gets these checks before it's pushed to `main`:

1. **Local:** serve the folder (`python3 -m http.server 8765 --bind 127.0.0.1`) and check it at desktop width and at a 390px mobile width, with no sideways scroll. Local browsers cache `style.css`, so force a fresh copy when checking CSS changes.
2. **Vercel preview:** run `vercel deploy` (**never `--prod`**) and check the preview URL. Previews are behind Vercel login, so use a signed-in browser rather than curl. Confirm the page renders and the response headers look right: `/assets/*` should return `Cache-Control: public, max-age=604800, stale-while-revalidate=86400`.
3. Only then commit and push to `main`.

## /worksheet (free printable worksheet page)

- **Files:** `worksheet/index.html`, `worksheet/download.html`, `worksheet.css` and `worksheet.js`. The PDF is at `downloads/paywindow-budget-worksheet.pdf`, a stable public URL served inline with a filename via `vercel.json`. The homepage doesn't load any of these files.
- **Bio links:** `/worksheet/ig` and `/worksheet/tt` are rewrites to the same page, so Vercel pageviews split by source on the Hobby plan. Canonical is always `/worksheet`.
- **Download tracking:** the CTA goes to `/worksheet/download[/ig|/tt]`. That hop page records a pageview, then uses `location.replace` to open the PDF. The hop exists because Hobby has no custom events.
- **App Store tracking:** links carry `ct=worksheet[-ig|-tt]`, which shows up in App Store Connect → App Analytics → Campaigns.
- **Email:** Mailchimp's JSONP endpoint, with `MC_TAG_ID` in `worksheet.js` tagging signups "worksheet". Don't launch form changes without a live test signup that shows up in Mailchimp.
- Rewrites only work on Vercel. Locally, open `/worksheet/` and `/worksheet/download.html` directly.

## Images

- Screenshot originals are in `assets/screenshots/src/` (1284×2778, **iPhone 14 Plus** simulator). They're kept out of the deploy by `.vercelignore`.
- Run `./scripts/optimize-images.sh` to rebuild the served WebP screenshots (540w/800w) and the icon sizes.
- When replacing screenshots, bump `VERSION` in the script and the `-vN` filenames in `index.html`. Assets are cached for 7 days, so they need new names to show up.
- Keep phone screenshots untilted: rotating them with CSS makes the small text jagged.
