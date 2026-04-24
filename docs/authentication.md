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

---

## B2B API Keys (Machine-to-Machine)

For external integrations (like backend systems or third-party dispatchers), OpenTrack provides a robust API key system.

### Provisioning
Keys are managed via the `POST /api/v1/keys` endpoint.
Keys are cryptographically secure 256-bit hashes (`opntrk_...`).

### Scopes
When generating a key, you can assign it a scope:
- `read`: Can query locations and analytics.
- `write`: Can ingest telemetry (e.g., IoT gateways).
- `admin`: Can create other keys or webhooks.

### Usage
Clients must pass their API key in the header:
```bash
curl -X GET /api/v1/export \
  -H "x-api-key: opntrk_your_secure_key_here"
```
