# Authentication Implementation

This document outlines the authentication system implemented for the admin login functionality.

## Features

- ✅ **Form Validation**: Uses Zod for client-side validation with proper error messages
- ✅ **Toast Notifications**: Sonner integration for user feedback (success/error messages)
- ✅ **Type Safety**: TypeScript interfaces and types for all auth-related data
- ✅ **Error Handling**: Proper error handling with meaningful user messages
- ✅ **Token Management**: Automatic token storage and inclusion in API requests
- ✅ **Auto Logout**: Automatic redirect to login on token expiration

## Structure

```
src/
├── types/
│   ├── auth.types.ts          # Authentication interfaces
│   ├── validation.types.ts    # Zod schemas and validation types
│   └── index.ts              # Type exports
├── services/
│   └── auth.service.ts       # Authentication API service
├── hooks/
│   └── use-auth.ts          # Authentication hook for state management
├── components/
│   └── login-form.tsx       # Login form component with validation
└── lib/
    └── utils.ts             # Axios instance with auth interceptors
```

## API Integration

**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Success Response** (200):
```json
{
  "email": "admin@example.com",
  "name": "Admin User",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response** (401):
```json
{
  "message": "Email and password are required",
  "error": "Unauthorized",
  "statusCode": 401
}
```

## Usage

### Login Form
The login form automatically handles:
- Email and password validation
- API calls to the backend
- Token storage in localStorage
- Success/error toast notifications
- Redirect to dashboard on success

### Auth Hook
Use the `useAuth` hook to manage authentication state:

```tsx
import { useAuth } from "@/hooks/use-auth";

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      Welcome, {user?.name}!
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protected Routes
The axios instance automatically includes the authorization header and handles token expiration.

## Validation Rules

- **Email**: Must be a valid email format
- **Password**: Minimum 6 characters, required

## Security Features

- Automatic token inclusion in API requests
- Token expiration handling with automatic logout
- Secure token storage in localStorage
- Proper error handling without exposing sensitive information

## Toast Notifications

- **Success**: Login successful with welcome message
- **Error**: Login failed with specific error message
- **Session Expired**: Automatic notification when token expires
- **Logout**: Confirmation when user logs out
