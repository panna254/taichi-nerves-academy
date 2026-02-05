# API Documentation for Backend Integration

This document outlines the API endpoints and data structures required for the Taichi Nerves Academy authentication system.

## Base URL Configuration

The frontend expects the API base URL to be configured via environment variable:
- **Development**: `VITE_API_BASE_URL=http://localhost:3000/api`
- **Production**: `VITE_API_BASE_URL=https://api.taichinerves.com/api`

## Authentication Endpoints

### 1. User Login

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "userpassword123"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "membershipStatus": "active",
    "membershipExpiresAt": "2025-03-05T00:00:00Z",
    "createdAt": "2025-01-05T00:00:00Z"
  },
  "expiresIn": 3600
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request format
- `401 Unauthorized`: Invalid email or password
- `500 Internal Server Error`: Server error

---

### 2. User Signup

**Endpoint**: `POST /auth/signup`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response** (201 Created):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "membershipStatus": "active",
    "membershipExpiresAt": "2025-03-05T00:00:00Z",
    "createdAt": "2025-02-05T00:00:00Z"
  },
  "expiresIn": 3600
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors
  ```json
  {
    "message": "Validation failed",
    "errors": {
      "email": ["Email is already taken"],
      "password": ["Password must be at least 8 characters"]
    }
  }
  ```
- `409 Conflict`: Email already exists
- `500 Internal Server Error`: Server error

---

### 3. Get Current User

**Endpoint**: `GET /auth/me`

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "membershipStatus": "active",
    "membershipExpiresAt": "2025-03-05T00:00:00Z",
    "createdAt": "2025-01-05T00:00:00Z"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or expired token
- `500 Internal Server Error`: Server error

---

## Database Schema Requirements

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL, -- bcrypt/argon2 hash
  avatar VARCHAR(500),
  membership_status VARCHAR(50) DEFAULT 'active',
  membership_expires_at TIMESTAMP,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_membership_status ON users(membership_status);
```

### Password Security

**CRITICAL**: Never store plain text passwords!

1. **Hash passwords** using bcrypt (recommended) or argon2:
   ```javascript
   // Example with bcrypt
   const bcrypt = require('bcrypt');
   const saltRounds = 10;
   const passwordHash = await bcrypt.hash(password, saltRounds);
   ```

2. **Verify passwords** on login:
   ```javascript
   const isValid = await bcrypt.compare(plainPassword, storedHash);
   ```

3. **Never log or return passwords** in API responses

---

## JWT Token Requirements

### Token Structure

The backend should issue JWT tokens with the following claims:

```json
{
  "sub": "user-uuid",           // User ID
  "email": "user@example.com",   // User email
  "iat": 1704508800,            // Issued at
  "exp": 1704512400             // Expiration (1 hour recommended)
}
```

### Token Security

1. **Use strong secret key** (minimum 256 bits)
2. **Set appropriate expiration** (1-24 hours for access tokens)
3. **Use HTTPS** in production
4. **Implement refresh tokens** for long-lived sessions (optional but recommended)

---

## Security Best Practices

### 1. Password Requirements
- Minimum 8 characters
- Consider requiring: uppercase, lowercase, numbers, special characters
- Validate on both frontend and backend

### 2. Rate Limiting
- Implement rate limiting on login endpoints (e.g., 5 attempts per 15 minutes)
- Return `429 Too Many Requests` when limit exceeded

### 3. CORS Configuration
- Configure CORS to only allow your frontend domain
- Include credentials if using cookies

### 4. Input Validation
- Validate email format
- Sanitize all inputs
- Use parameterized queries to prevent SQL injection

### 5. Error Handling
- Don't reveal if email exists in error messages (security through obscurity)
- Use generic error: "Invalid email or password" for login failures
- Log detailed errors server-side only

---

## Example Backend Implementation (Node.js/Express)

```javascript
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Login endpoint
router.post('/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  // Find user in database
  const user = await db.users.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Generate JWT token
  const token = jwt.sign(
    { sub: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Return token and user data (without password hash)
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      membershipStatus: user.membership_status,
      membershipExpiresAt: user.membership_expires_at,
      createdAt: user.created_at
    },
    expiresIn: 3600
  });
});

// Signup endpoint
router.post('/auth/signup', [
  body('name').trim().isLength({ min: 2, max: 255 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await db.users.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  const user = await db.users.create({
    name,
    email,
    password_hash: passwordHash,
    membership_status: 'active',
    membership_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  });

  // Generate token
  const token = jwt.sign(
    { sub: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      membershipStatus: user.membership_status,
      membershipExpiresAt: user.membership_expires_at,
      createdAt: user.created_at
    },
    expiresIn: 3600
  });
});

// Get current user endpoint
router.get('/auth/me', authenticateToken, async (req, res) => {
  const user = await db.users.findById(req.user.sub);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      membershipStatus: user.membership_status,
      membershipExpiresAt: user.membership_expires_at,
      createdAt: user.created_at
    }
  });
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

module.exports = router;
```

---

## Environment Variables

Create a `.env` file in your backend:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/taichinerves_db

# JWT Secret (use a strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-minimum-256-bits

# Server
PORT=3000
NODE_ENV=production

# Email (for verification/reset emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## Testing

Use these test credentials with the mock API:

- **Email**: `john@example.com`
- **Password**: `password123`

- **Email**: `jane@example.com`
- **Password**: `password123`

---

## Migration Checklist

When connecting to a real backend:

- [ ] Set `VITE_API_BASE_URL` in `.env` file
- [ ] Ensure backend implements all required endpoints
- [ ] Test login endpoint with valid credentials
- [ ] Test signup endpoint with new user
- [ ] Test authentication token validation
- [ ] Verify password hashing is implemented
- [ ] Test error handling for invalid credentials
- [ ] Test rate limiting (if implemented)
- [ ] Verify CORS is configured correctly
- [ ] Test token expiration handling
