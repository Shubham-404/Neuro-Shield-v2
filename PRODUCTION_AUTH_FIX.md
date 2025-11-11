# Production Authentication Fix

## Problem
In production, after login:
- Token error toast appears
- Redirects to /staff dashboard
- Unable to fetch data
- Logs out after a few seconds

This works fine in localhost but fails in production.

## Root Cause
The issue was caused by **cookie `sameSite` settings** being too restrictive for cross-origin requests in production.

### Issues Found:
1. **Cookie `sameSite: 'strict'`** - Too restrictive for cross-origin requests (Netlify frontend → separate backend)
2. **CORS configuration** - Could be improved for production
3. **Cookie handling** - Needed better cross-origin support

## Fixes Applied

### 1. Cookie Configuration (`controllers/user.controller.js`)
- Changed `sameSite` from `'strict'` to `'lax'` in production
- Added automatic detection: if frontend and backend are on different domains, uses `sameSite: 'none'` with `secure: true`
- Added logging to help debug cookie issues

### 2. CORS Configuration (`app.js`)
- Improved CORS with dynamic origin checking
- Better handling of production vs development
- Added proper headers for cookie support

### 3. Frontend API Configuration (`client-react/src/services/api.js`)
- Increased timeout to 30 seconds for production
- Ensured `withCredentials: true` is set (critical for cookies)
- Added request logging in development

### 4. Login Page (`client-react/src/pages/auth/LoginPage.jsx`)
- Switched from `fetch` to `axios` for better cookie handling
- Ensured `withCredentials: true` is set

### 5. Error Handling
- Added detailed logging in production for debugging
- Better error messages for cookie-related issues

## Required Environment Variables

Make sure these are set in your production environment:

```env
# Backend (.env)
NODE_ENV=production
FRONTEND_ORIGIN=https://neuro-shield.netlify.app
BACKEND_URL=https://your-backend-url.com
JWT_SECRET=your-secret-key
PORT=5000

# Frontend (Netlify Environment Variables)
VITE_ENV=production
VITE_BACKEND_URL=https://your-backend-url.com
```

## How It Works Now

1. **Same Domain**: If frontend and backend are on the same domain → uses `sameSite: 'lax'`
2. **Different Domains**: If frontend (Netlify) and backend are on different domains → automatically uses `sameSite: 'none'` with `secure: true`

## Testing in Production

After deploying, check:
1. Browser DevTools → Application → Cookies
   - Should see `neuroShieldToken` cookie
   - Check `SameSite` attribute (should be `None` if cross-origin)
   - Check `Secure` flag (should be true in production)

2. Network Tab → Login Request
   - Check `Set-Cookie` header in response
   - Verify cookie options match expected values

3. Console Logs
   - Backend will log cookie configuration on login
   - Frontend will log auth errors if they occur

## Important Notes

- **HTTPS Required**: When using `sameSite: 'none'`, the `secure` flag must be `true`, which requires HTTPS
- **CORS**: Make sure `FRONTEND_ORIGIN` in backend matches your actual frontend URL exactly
- **Cookie Domain**: The code automatically handles domain differences, but ensure both frontend and backend URLs are correctly set

## If Issues Persist

1. Check backend logs for cookie configuration messages
2. Check browser console for CORS or cookie errors
3. Verify environment variables are set correctly
4. Ensure backend is using HTTPS (required for `sameSite: 'none'`)
5. Check that `FRONTEND_ORIGIN` in backend matches the exact frontend URL (including protocol)

