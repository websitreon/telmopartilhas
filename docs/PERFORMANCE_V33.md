# Performance V33

- Public state: browser local-first cache + background refresh.
- Public `/api/state`: short public cache with stale-while-revalidate; never exposes Admin-only reviews.
- New images: compressed to WebP in the Admin and stored in R2 via `media`.
- Existing D1 photos remain readable for backwards compatibility.
- Hero video: loaded after the initial page work, skipped on reduced-motion/data-saver/small screens.
- Below-fold media: `loading="lazy"`, async decoding and `content-visibility:auto`.
- Static JS/CSS/assets receive long browser cache lifetimes with versioned URLs.
- Public forms and Admin login have lightweight request throttling.
