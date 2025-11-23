# Frontend Architecture & Memory File

## 🧠 Core Concepts

**NeuroShield Frontend** is a React 18 application built with Vite and Tailwind CSS. It serves as the user interface for Patients, Doctors, and Admins, interacting with the Node.js backend via a centralized API service.

### 1. Architecture Overview

*   **Framework:** React 18 + Vite
*   **Routing:** `react-router-dom` v6
*   **Styling:** Tailwind CSS + `clsx`/`tailwind-merge` (shadcn/ui style)
*   **State Management:** React Context (`AuthContext`) + Local State
*   **Data Fetching:** Axios (`services/api.js`)
*   **Charts:** Recharts

### 2. Directory Structure

```
client-react/src/
├── components/
│   ├── layout/         # Shell, Sidebar, Topbar
│   ├── ui/             # Reusable UI components (Button, Card, etc.)
│   ├── ProtectedRoute.jsx # RBAC Wrapper
│   └── PublicRoute.jsx    # Auth Wrapper
├── contexts/
│   └── AuthContext.jsx # User session & Auth logic
├── pages/
│   ├── auth/           # Login, Register
│   ├── patients/       # Patient-specific features (Logs, Metrics)
│   ├── doctors/        # Doctor-specific features
│   └── ...             # Dashboard, Prediction, etc.
├── services/
│   └── api.js          # Centralized Axios instance & endpoints
├── lib/
│   └── utils.js        # CN helper (clsx + tailwind-merge)
└── App.jsx             # Route definitions
```

### 3. Key Workflows

#### Authentication
*   **Context:** `AuthContext` manages `user` state and `loading` status.
*   **Persistance:** Checks `/api/dashboard` on mount to validate session cookie.
*   **Protection:** `ProtectedRoute` checks `user.role` against `allowedRoles`. Redirects unauthorized access.

#### Data Flow
*   **API Layer:** `services/api.js` exports objects (`Auth`, `Patients`, `Predictions`) that map to backend endpoints.
*   **Interceptors:**
    *   **Request:** Logs requests in dev.
    *   **Response:** Handles 401 errors (auto-redirect to login).

#### Role-Based Access Control (RBAC)
*   **Routes:** Defined in `App.jsx` using `ProtectedRoute`.
*   **Navigation:** `Shell.jsx` filters sidebar items based on `user.role`.
*   **UI:** Pages like `DashboardPage` conditionally render content based on role.

### 4. Observations & Improvements

#### Complexity / Technical Debt
*   **`DashboardPage.jsx`**: Large file mixing data fetching, role-based logic, and UI rendering.
    *   *Recommendation:* Split into `PatientDashboard`, `DoctorDashboard`, and extract charts to `components/charts/`.
*   **`Shell.jsx`**: Navigation config is hardcoded inside the component.
    *   *Recommendation:* Extract navigation config to `config/navigation.js`.
*   **Unused Dependencies**: `gsap` is used in `LandingPage.jsx`, so it is NOT unused.

#### Performance
*   **Bundle Size:** Recharts is large; ensure tree-shaking is working (Vite usually handles this).
*   **Rendering:** `AuthContext` triggers re-renders on auth check; optimized with `useCallback`.

### 5. Backend Integration
*   **Base URL:** Dynamic based on `VITE_ENV` (localhost vs production).
*   **Cookies:** `withCredentials: true` ensures HTTP-only cookies are sent.

---

## 🛠️ Tech Stack
*   **Core:** React, Vite
*   **UI:** Tailwind CSS, Lucide React
*   **Data:** Axios, Recharts
*   **Utils:** clsx, tailwind-merge
