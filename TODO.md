# TODO: Add User Endpoint in Express

## Tasks

- [x] Add POST /api/users endpoint in server.js
  - [x] Implement authentication middleware (authenticateToken)
  - [x] Validate input: username and password required
  - [x] Check if username already exists
  - [x] Hash password using crypto (SHA-256 with salt) to match existing database format
  - [x] Save new user to MongoDB 'users' collection with \_id, password, salt, roles (matching existing schema)
  - [x] Return success response
- [x] Update login verification to use crypto instead of bcrypt
- [x] Update password update in PUT endpoint to use crypto
- [ ] Test the endpoint (optional: run server and make a test request)

## Notes

- Endpoint will be protected with JWT authentication
- Password will be hashed using crypto.pbkdf2Sync with SHA-256 and salt to match existing user format
- Ensure MongoDB connection is available
- New users get default role "user"
- Schema matches existing database: \_id, roles, password, salt
