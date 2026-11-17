# Fate Sage Web

The Fate Sage Telegram Mini App frontend. The existing `src/` tree is retained,
including the SCSS foundation and reusable JavaScript components and utilities.

## Local development

```sh
npm ci
npm run dev
```

For local API-backed development, copy `.env.example` to `.env.local` and set
`VITE_FATE_API_URL` to the Railway service's HTTPS origin. The app can also
show demo data when opened outside Telegram in Vite development mode.

The theme follows the operating system's day/night preference on each page
load. Press **Alt+T** to switch themes temporarily, or **Alt+S** to resume
following the system preference. System theme changes are applied immediately
while system-following is active.

## Build

```sh
npm run build
npm run preview
```

Vite writes the static site to `dist/`. Locale files, the custom-domain file,
and Pages metadata are copied from `public/`.

## GitHub Pages deployment

The workflow in `.github/workflows/gh-pages.yml` builds and deploys `dist/` on
pushes to `main` or when run manually. Configure the repository's Pages source
as **GitHub Actions**, and add this Actions repository variable:

| Variable | Value |
|----------|-------|
| `FATE_API_URL` | The public HTTPS origin of the Fate Sage Railway API |

`public/CNAME` configures the site for `fate.clareon.live`; point that
subdomain's DNS at GitHub Pages and configure the same custom domain in the
repository's Pages settings. Set the Telegram Mini App URL to
`https://fate.clareon.live`.

The frontend is static; profile and leaderboard data require the Railway API.
The API must allow `https://fate.clareon.live` in `FATE_WEB_ORIGINS`.
