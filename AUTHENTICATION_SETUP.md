# Authentication & Route Protection Setup

## Issues Fixed

### ✅ 1. Added Logout Button
- Added logout button in the top navigation bar (Shell component)
- Logout button appears next to the user icon
- Shows confirmation dialog before logging out
- Displays user name/email in the header

### ✅ 2. Protected Routes
- All dashboard routes now require authentication
- Unauthenticated users are redirected to `/login`
- Login/Register pages redirect to `/dashboard` if already authenticated

### ✅ 3. Fixed 401 Errors
- Added axios interceptor to handle 401 responses
- Automatically redirects to login on authentication failure
- Prevents error toasts from showing repeatedly

## New Files Created

### 1. `client-react/src/contexts/AuthContext.jsx`
- Manages global authentication state
- Provides `useAuth()` hook for components
- Handles login, logout, and auth checking
- Automatically checks authentication on app load

### 2. `client-react/src/components/ProtectedRoute.jsx`
- Wrapper component for protected routes
- Checks authentication before rendering
- Redirects to login if not authenticated
- Shows loading state during auth check

### 3. `client-react/src/components/PublicRoute.jsx`
- Wrapper for public routes (login/register)
- Redirects to dashboard if already authenticated
- Prevents logged-in users from accessing auth pages

## Modified Files

### 1. `client-react/src/App.jsx`
- Wrapped app with `AuthProvider`
- All protected routes now use `<ProtectedRoute>`
- Login/Register use `<PublicRoute>`

### 2. `client-react/src/components/layout/Shell.jsx`
- Added logout button with LogOut icon
- Shows user name/email in header
- Integrated with AuthContext

### 3. `client-react/src/pages/auth/LoginPage.jsx`
- Integrated with AuthContext
- Updates auth state on successful login
- Redirects if already authenticated

### 4. `client-react/src/services/api.js`
- Added axios response interceptor
- Handles 401 errors globally
- Automatically redirects to login on auth failure

### 5. `client-react/src/main.jsx`
- Removed duplicate ToastProvider (now in App.jsx)

## How It Works

### Authentication Flow

```
1. User visits app
   ↓
2. AuthContext checks authentication via /api/dashboard
   ↓
3. If authenticated:
   - User state is set
   - Protected routes are accessible
   ↓
4. If not authenticated:
   - User state is null
   - Protected routes redirect to /login
```

### Login Flow

```
1. User submits login form
   ↓
2. Backend validates credentials
   ↓
3. On success:
   - Cookie is set (httpOnly)
   - AuthContext updates user state
   - User is redirected based on role
   ↓
4. On failure:
   - Error toast is shown
   - User stays on login page
```

### Logout Flow

```
1. User clicks logout button
   ↓
2. Confirmation dialog appears
   ↓
3. On confirm:
   - Backend logout endpoint is called
   - Cookie is cleared
   - AuthContext clears user state
   - User is redirected to /login
```

### 401 Error Handling

```
1. API request fails with 401
   ↓
2. Axios interceptor catches error
   ↓
3. AuthContext is notified (auth:logout event)
   ↓
4. User state is cleared
   ↓
5. User is redirected to /login
```

## Usage Examples

### Using Auth in Components

```jsx
import { useAuth } from '../contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth()

  if (!isAuthenticated) {
    return <div>Please login</div>
  }

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### Protected Route

```jsx
<Route path="/dashboard" element={
  <ProtectedRoute>
    <DashboardPage />
  </ProtectedRoute>
} />
```

### Public Route (Login/Register)

```jsx
<Route path="/login" element={
  <PublicRoute>
    <LoginPage />
  </PublicRoute>
} />
```

## Testing

1. **Test Protected Routes:**
   - Try accessing `/dashboard` without logging in
   - Should redirect to `/login`

2. **Test Login:**
   - Login with valid credentials
   - Should redirect to appropriate dashboard
   - Should see user name in header

3. **Test Logout:**
   - Click logout button
   - Confirm logout
   - Should redirect to `/login`
   - Should not be able to access protected routes

4. **Test 401 Handling:**
   - Login successfully
   - Manually delete/expire cookie
   - Try to access protected route
   - Should automatically redirect to login

## Environment Variables

Make sure these are set in your `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Or the default will be used: `http://localhost:5000/api`

## Notes

- All API requests include `withCredentials: true` to send cookies
- Cookies are httpOnly and secure (in production)
- Auth state persists across page refreshes (via cookie)
- 401 errors are handled globally to prevent error spam

