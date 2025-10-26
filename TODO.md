# TODO: Fix server.js for Development and Add User CRUD

- [x] Install bcrypt for password hashing
- [x] Remove static file serving from server.js (since Vite handles frontend in dev mode)
- [x] Add JWT authentication middleware for protected user endpoints
- [x] Improve POST /api/login to use bcrypt for password verification
- [x] Add POST /api/logout endpoint (client-side token removal)
- [x] Add PUT /api/users/:username endpoint (update user, hash password if provided)
- [x] Add GET /api/users endpoint (list all users, protected)
- [x] Add DELETE /api/users/:username endpoint (delete user, protected)
- [x] Ensure user endpoints are handled before proxy to NBI
- [x] Test the server with user CRUD and proxy functionality
