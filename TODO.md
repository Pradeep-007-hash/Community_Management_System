# TODO: Add OAuth to Project

## Backend Changes
- [ ] Install OAuth dependencies: passport, passport-google-oauth20, express-session
- [ ] Configure Passport.js with Google OAuth strategy in server.js
- [ ] Add OAuth routes: /auth/google, /auth/google/callback
- [ ] Handle OAuth user creation/storage in database
- [ ] Integrate OAuth with existing session management

## Frontend Changes
- [x] Update Auth.jsx Login component to initiate real Google OAuth
- [x] Remove mock OTP flow from Google auth
- [x] Integrate OAuth success/failure with AuthContext
- [x] Update API calls to handle OAuth responses

## Configuration
- [ ] Obtain Google OAuth Client ID and Secret from Google Console
- [ ] Set environment variables for OAuth credentials

## Testing
- [ ] Test OAuth login flow
- [ ] Verify user creation and authentication
- [ ] Ensure existing login methods still work
