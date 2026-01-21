# Authentication System

This document describes the authentication and authorization system implemented in the PUMVA API.

## Overview

The PUMVA API uses JWT (JSON Web Token) based authentication with role-based access control (RBAC). The system is adapted from the simva project and provides:

- JWT token validation with multiple issuer support
- Keycloak public key verification  
- Role-based route authorization
- OpenAPI specification-based route mapping
- Automatic user creation/updates from Keycloak tokens

## Components

### 1. Authentication Middleware (`src/middlewares/auth.middleware.ts`)

The main authentication middleware that:
- Validates JWT tokens from Authorization headers or query parameters
- Loads user data from the database
- Maps API routes to user roles based on OpenAPI specification
- Provides role-based access control

### 2. KeycloakKeyManager (`src/lib/keycloakKeyManager.ts`)

Handles Keycloak public key management:
- Fetches and caches Keycloak public keys
- Verifies Keycloak-issued JWT tokens
- Manages key rotation and reload
- Provides fallback mechanisms for key validation

### 3. Enhanced User Service (`src/services/user.service.ts`)

Extended user service with comprehensive authentication:
- Multi-issuer JWT validation (Keycloak + internal)
- Automatic user creation from Keycloak tokens
- Role mapping from Keycloak realm_access claims
- Backward compatibility with simple tokens

### 4. Configuration (`src/lib/config.ts`)

Authentication configuration including:
- JWT secret key for internal tokens
- Keycloak server URL and realm settings
- Token expiration settings

## Usage

### Basic Setup

1. **Install dependencies** (already done):
   ```bash
   npm install jsonwebtoken yaml @types/jsonwebtoken
   ```

2. **Configure environment variables** (copy `.env.template` to `.env`):
   ```bash
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=24h
   KEYCLOAK_URL=http://localhost:8080
   KEYCLOAK_REALM=simva
   KEYCLOAK_CLIENT_ID=pumva
   ```

3. **The middleware is automatically applied** to all routes except `/health`

### Authentication Flow

1. Client sends request with JWT token in Authorization header:
   ```
   Authorization: Bearer <jwt-token>
   ```

2. Middleware validates the token and loads user data

3. Role-based authorization checks if user can access the requested route

4. Request proceeds to route handler if authorized

### Role-Based Access Control

Routes are automatically mapped to roles based on OpenAPI specification tags:

- **Users**: Routes tagged with "Users" → accessible by "user" role
- **Games**: Routes tagged with "Games" → accessible by "game" role  
- **Technologies**: Routes tagged with "Technologies" → accessible by "technology" role
- etc.

Routes without tags are accessible by all authenticated users.

### JWT Token Structure

The system supports multiple JWT token formats:

#### Internal Tokens (simva/pumva issued):
```json
{
  "data": {
    "username": "john_doe",
    "role": "teacher",
    "user_id": 123
  },
  "iss": "pumva",
  "exp": 1234567890
}
```

#### Keycloak Tokens:
```json
{
  "preferred_username": "john_doe",
  "email": "john@example.com",
  "realm_access": {
    "roles": ["teacher", "researcher"]
  },
  "iss": "http://localhost:8080/realms/simva",
  "sub": "user-uuid",
  "exp": 1234567890
}
```

### Token Validation Process

1. **Decode token** and check basic structure
2. **Identify issuer**:
   - Keycloak realm URL → Keycloak validation path
   - 'simva'/'pumva' → Internal validation path
   - No issuer → Internal validation path
3. **For Keycloak tokens**:
   - Fetch public key using Key ID (kid)
   - Verify token signature with public key
   - Create/update user from token claims
   - Map roles from realm_access
4. **For internal tokens**:
   - Verify with JWT secret
   - Return existing token structure

### User Roles

The system recognizes these roles:
- `admin`: Administrative access
- `teacher`: Teacher/researcher access  
- `student`: Student/teaching-assistant access
- Custom roles as defined in your system

Role derivation from Keycloak `realm_access.roles`:
- `teacher` or `researcher` → `teacher` role
- `teaching-assistant` or `student` → `student` role

## API Usage Examples

### Authenticated Request
```bash
curl -H "Authorization: Bearer <jwt-token>" \
     http://localhost:3000/users
```

### Query Parameter Token
```bash
curl "http://localhost:3000/users?token=<jwt-token>"
```

### Health Check (No Auth Required)
```bash
curl http://localhost:3000/health
```

## Middleware Functions

### `auth`
Main authentication middleware. Requires valid JWT token and appropriate role.

### `optionalAuth`  
Optional authentication middleware. Attaches user data if token is present but doesn't reject requests without tokens.

```typescript
import { auth, optionalAuth } from '@/middlewares/auth.middleware';

// Require authentication
app.use('/protected', auth, protectedRoutes);

// Optional authentication  
app.use('/public', optionalAuth, publicRoutes);
```

## Error Responses

### 401 Unauthorized
- Missing or invalid authorization header
- Invalid JWT token
- User not found in database
- Insufficient permissions for route

### 404 Not Found
- Route doesn't exist for user's role

## Development Notes

### JWT Verification vs Decoding

- **Production**: Set `JWT_SECRET` environment variable for proper token verification
- **Development**: Without secret, tokens are decoded but not verified (useful for testing)

### Route Mapping

Routes are automatically mapped from `api.yaml` OpenAPI specification:
- Tags determine which roles can access endpoints
- Path parameters (e.g., `{id}`) are matched dynamically
- HTTP methods are considered in authorization

### Testing

Run authentication tests:
```bash
npm test -- auth.middleware.test.ts
npm test -- user.service.auth.test.ts
```

### Customization

To customize authentication behavior:

1. **Add new roles**: Update role derivation logic in `getRoleFromRealmAccessRoles()`
2. **Custom JWT validation**: Modify `validateJWT()` in user service  
3. **Route exceptions**: Add special handling in `roleAllowed()` middleware
4. **Token sources**: Extend token extraction logic in `auth()` middleware

## Security Considerations

1. **JWT Secret**: Use a strong, random secret key in production
2. **HTTPS**: Always use HTTPS in production to protect tokens in transit
3. **Token Expiration**: Set appropriate token expiration times
4. **Token Storage**: Client should store tokens securely (httpOnly cookies recommended)
5. **Refresh Tokens**: Consider implementing refresh token mechanism for long-lived sessions

## Integration with Existing Code

The authentication system is designed to be minimally invasive:

- Existing route handlers don't need modification
- User data is available in `req.user` for authenticated requests
- JWT data is available in `req.jwt` for token inspection
- Compatible with existing user service functions

## Troubleshooting

### Common Issues

1. **"No authorization header"**: Client must send `Authorization: Bearer <token>` header
2. **"JWT token is not valid"**: Token is malformed, expired, or verification failed
3. **"Username not found"**: Token is valid but user doesn't exist in database
4. **"You are not authorized"**: User lacks permissions for requested route

### Debug Logging

Enable debug logging to troubleshoot authentication:
```bash
DEBUG=true LOG_LEVEL=debug npm run dev
```

This will log:
- JWT validation steps
- Route matching decisions  
- User role assignments
- Authorization outcomes