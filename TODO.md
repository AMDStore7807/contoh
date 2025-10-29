# TODO: Implement Local Storage for Device Data Pagination

## Tasks

- [x] Modify `src/pages/Devices.tsx` to add local storage caching for device data
- [x] Extract data transformation logic into a reusable function
- [x] Update `fetchDevices` to check cache before API calls and accumulate data
- [x] Implement automatic cache expiration after 5 minutes
- [x] Handle page size changes by invalidating cache when necessary
- [x] Test the implementation to ensure load-more behavior works correctly

## Details

- Use localStorage with key 'devicesCache'
- Cache structure: { pageSize, allDevices, lastFetchedPage, timestamp }
- Accumulate data across pages without refetching previous pages
- Expire cache after 5 minutes (300000 ms)
- On page size change, reset and fetch from scratch
