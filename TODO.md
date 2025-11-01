# TODO: Merge Cache Settings into Main Settings Page

## Tasks to Complete

- [x] Update `src/pages/Settings.tsx` to include cache settings (cacheEnabled and cacheExpiryMinutes) alongside companyName:

  - Add Switch component for cacheEnabled.
  - Add Input component for cacheExpiryMinutes.
  - Update state to include cacheEnabled and cacheExpiryMinutes.
  - Adjust load/save logic to handle all config fields from /api/config.

- [x] Update `src/App.tsx` to remove the `/settings/cache` route and its import of CacheSettings.

- [x] Delete `src/pages/settings/Cache.tsx` file.

- [x] Test the merged settings page for functionality (load/save cache settings).

- [x] Verify no broken navigation (ensure /settings still works and no links to /settings/cache).
