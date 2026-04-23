# Authentication Setup 🔐

OpenTrack uses **NextAuth.js** with Google OAuth 2.0 for secure, one-click authentication.

## Configuration

To enable Google Login, you must set the following environment variables in a `.env.local` file:

```bash
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_SECRET="your-random-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Steps to get Google Credentials:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project called "OpenTrack".
3. Navigate to **APIs & Services > Credentials**.
4. Create an **OAuth 2.0 Client ID**.
5. Set the **Authorized redirect URIs** to:
   `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Secret and paste them into your `.env.local`.

## Technical Details
- **Provider**: Google
- **Session Strategy**: JWT (JSON Web Token)
- **Library**: `next-auth`
- **Session Provider**: Wrapped at the root in `src/components/Providers.tsx`.
