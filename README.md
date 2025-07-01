# Outpost

A Next.js application with AirKit login and credential verification.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# AirKit Configuration
NEXT_PUBLIC_AIR_PARTNER_ID=your_partner_id_here

# Credential Verification Configuration
NEXT_PUBLIC_VERIFIER_DID=your_verifier_did_here
NEXT_PUBLIC_VERIFIER_API_KEY=your_verifier_api_key_here
NEXT_PUBLIC_CREDENTIAL_ID_GENDER=your_credential_id_here
NEXT_PUBLIC_PROGRAM_ID=your_program_id_here
```

### 3. Run Development Server

```bash
npm run dev
```

## Features

- **AirKit Login**: Seamless SSO authentication with MPC wallet integration
- **Credential Verification**: Verify verifiable credentials using the AirKit Credential SDK
- **Modern UI**: Built with Next.js, Tailwind CSS, and shadcn/ui components

## Usage

1. Click "Login with AIR" to authenticate
2. After successful login, use the "Verify Credential" button to check for specific credentials
3. Verification results will be logged to the console and displayed in the UI

## Environment

The application currently uses the AirKit SANDBOX environment for both login and credential verification.
