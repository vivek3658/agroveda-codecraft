# API Response Format Guide

## Cookie Storage Implementation ✅

The auth system now **automatically stores JWT token, role, and email in cookies** when authentication succeeds.

---

## Expected Login API Response Format

Your backend login endpoint should return:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "farmer@example.com",
    "role": "Farmer"
  }
}
```

### Alternative Formats (Also Supported)
The system supports flexible response structures:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "farmer@example.com",
  "role": "Farmer"
}
```

---

## What Gets Stored in Cookies

After successful login/registration, these cookies are automatically created:

| Cookie Name | Value | Expiry |
|------------|-------|--------|
| `token` | JWT Token from API | From token's `exp` claim (or 24 hours default) |
| `role` | User's role (e.g., "Farmer", "Admin") | Same as token |
| `user_email` | User's email address | Same as token |

---

## Cookie Configuration

Cookies are set with these security options:

- **SameSite**: `Strict` - Prevents CSRF attacks
- **Secure**: Enabled in production - Only sent over HTTPS
- **Expires**: Based on JWT token expiry time

---

## JWT Token Requirements

The JWT token must include:

```json
{
  "email": "farmer@example.com",
  "role": "Farmer",
  "exp": 1712282400,  // Unix timestamp of expiry
  "iat": 1712182400,  // Unix timestamp of issue
  "/* other claims */": "..."
}
```

The system automatically:
✅ Validates token format  
✅ Checks token expiry  
✅ Sets cookie expiry based on token expiry  
✅ Clears expired tokens automatically  

---

## Usage in Components

### Check if user is authenticated:
```javascript
import { useAuth } from "../context/AuthContext";

const MyComponent = () => {
  const { session, isAuthenticated } = useAuth();
  
  if (isAuthenticated()) {
    console.log("User:", session.email);
    console.log("Role:", session.role);
  }
};
```

### Access stored credentials:
```javascript
import Cookies from "js-cookie";

const token = Cookies.get("token");
const role = Cookies.get("role");
const email = Cookies.get("user_email");
```

### Force logout:
```javascript
const { logout } = useAuth();
logout(); // Clears cookies and redirects to /auth
```

---

## Backend Integration Checklist

- [ ] Login endpoint returns `token` (valid JWT) + user details
- [ ] JWT includes `exp` (expiry timestamp in seconds)
- [ ] JWT includes `email` and `role` claims
- [ ] Registration endpoint also returns token after signup
- [ ] Google OAuth returns valid JWT token
- [ ] Token validation happens on the server side

---

## Environment Variables

No additional configuration needed! The system automatically:
- Uses production-safe cookies in `npm run build`
- Uses development cookies in `npm run dev`

