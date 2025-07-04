import { BUILD_ENV } from "@mocanetwork/airkit";

export interface EnvironmentConfig {
  widgetUrl: string;
  apiUrl: string;
}

export const ENVIRONMENT_CONFIGS: Record<string, EnvironmentConfig> = {
  [BUILD_ENV.STAGING]: {
    widgetUrl: "https://credential-widget.test.air3.com",
    apiUrl: "https://credential.api.test.air3.com",
  },
  [BUILD_ENV.SANDBOX]: {
    widgetUrl: "https://credential-widget.sandbox.air3.com",
    apiUrl: "https://credential.api.sandbox.air3.com",
  },
};

export const CREDENTIAL_CONFIG = {
  // Verification config
  verifierDid: process.env.NEXT_PUBLIC_VERIFIER_DID || '',
  verifierApiKey: process.env.NEXT_PUBLIC_VERIFIER_API_KEY || '',
  verificationCredentialId: process.env.NEXT_PUBLIC_CREDENTIAL_ID_GENDER || '',
  programId: process.env.NEXT_PUBLIC_PROGRAM_ID || '',
  partnerId: process.env.NEXT_PUBLIC_AIR_PARTNER_ID || '',
  
  // Issuance config
  issuerDid: process.env.NEXT_PUBLIC_ISSUER_DID || '',
  issuerApiKey: process.env.NEXT_PUBLIC_ISSUER_API_KEY || '',
  locationCredentialId: process.env.NEXT_PUBLIC_CREDENTIAL_ID_LOCATION || '',
}; 