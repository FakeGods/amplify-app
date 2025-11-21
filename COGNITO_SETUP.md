# Cognito Configuration Guide

## Callback URL Configuration

The application is now configured to redirect to `http://localhost:3000/callback` after Cognito authentication.

### Steps to configure Cognito:

1. **Go to AWS Cognito Console**
   - Navigate to your User Pool
   - Go to **App integration** → **App clients and analytics**
   - Select your app client

2. **Update Allowed Callback URLs**
   - Add: `http://localhost:3000/callback` (for development)
   - Add: `https://yourdomain.com/callback` (for production)

3. **Update Allowed Logout URLs**
   - Add: `http://localhost:3000` (for development)
   - Add: `https://yourdomain.com` (for production)

4. **Verify App Client Settings**
   - Client type: **Public client**
   - Authentication flows: Enable "Authorization code grant"
   - OAuth scopes: email, openid, profile

5. **Update Hosted UI Domain** (if using hosted UI)
   - Go to **App integration** → **Domain name**
   - Configure your domain if not already done

## Current Configuration

Your `oidcConfig.js` is now set up with:

- **Region**: us-east-1
- **User Pool ID**: us-east-1_GSnf0PN2f
- **Client ID**: 5fiaeb4q798nptctg97mfgc9p3
- **Cognito Domain**: us-east-1gsnf0pn2f
- **Callback URL**: `http://localhost:3000/callback`
- **Logout URL**: `http://localhost:3000`

## OAuth Flow

1. User clicks "Sign In"
2. Redirects to Cognito login page
3. After successful login, redirects to `http://localhost:3000/callback`
4. Authorization code is exchanged for tokens
5. User is redirected to home page (`/`)

## Testing

1. Start the app: `npm start`
2. Navigate to `http://localhost:3000`
3. Click "Sign In"
4. Enter your Cognito credentials
5. Should redirect back to dashboard after successful login
