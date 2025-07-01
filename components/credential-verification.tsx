import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { AirCredentialWidget, type QueryRequest, type VerificationResults } from "@mocanetwork/air-credential-sdk";
import "@mocanetwork/air-credential-sdk/dist/style.css";
import { BUILD_ENV } from "@mocanetwork/airkit";
import { airService } from "@/lib/air-service";
import { ENVIRONMENT_CONFIGS, CREDENTIAL_CONFIG } from "@/lib/credential-config";
import { HoodMap } from "./hoodmap";

export function CredentialVerification() {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const widgetRef = useRef<AirCredentialWidget | null>(null);

  // Load saved verification from localStorage on mount
  useEffect(() => {
    const savedVerification = localStorage.getItem('airkit-verification-result');
    if (savedVerification) {
      try {
        const parsed = JSON.parse(savedVerification);
        setVerificationResult(parsed);
        console.log('🔄 Loaded saved verification from localStorage:', parsed);
      } catch (error) {
        console.error('Failed to parse saved verification:', error);
        localStorage.removeItem('airkit-verification-result');
      }
    }
  }, []);

  const getVerifierAuthToken = async (verifierDid: string, apiKey: string, apiUrl: string): Promise<string | null> => {
    try {
      const response = await fetch(`${apiUrl}/verifier/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
          "X-Test": "true",
        },
        body: JSON.stringify({
          verifierDid: verifierDid,
          authToken: apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const data = await response.json();

      if (data.code === 80000000 && data.data && data.data.token) {
        return data.data.token;
      } else {
        console.error("Failed to get verifier auth token from API:", data.msg || "Unknown error");
        return null;
      }
    } catch (error) {
      console.error("Error fetching verifier auth token:", error);
      return null;
    }
  };

  const handleVerifyCredential = async () => {
    setIsLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      // Get environment config
      const environmentConfig = ENVIRONMENT_CONFIGS[BUILD_ENV.SANDBOX];
      
      // Get verifier auth token
      const fetchedVerifierAuthToken = await getVerifierAuthToken(
        CREDENTIAL_CONFIG.verifierDid,
        CREDENTIAL_CONFIG.apiKey,
        environmentConfig.apiUrl
      );

      if (!fetchedVerifierAuthToken) {
        throw new Error("Failed to get verifier auth token");
      }

      // Get cross-partner token
      const rp = await airService?.goToPartner(environmentConfig.widgetUrl).catch((err) => {
        console.error("Error getting URL with token:", err);
        throw err;
      });

      // Create the query request
      const queryRequest: QueryRequest = {
        process: "Verify",
        verifierAuth: fetchedVerifierAuthToken,
        programId: CREDENTIAL_CONFIG.programId,
      };

      // Create and configure the widget
      widgetRef.current = new AirCredentialWidget(queryRequest, CREDENTIAL_CONFIG.verifierDid, {
        endpoint: rp?.urlWithToken,
        airKitBuildEnv: BUILD_ENV.SANDBOX,
        theme: "light",
        locale: "en" as any,
        redirectUrlForIssuer: undefined,
      });

      // Set up event listeners
      widgetRef.current.on("verifyCompleted", (results: VerificationResults) => {
        setVerificationResult(results);
        setIsLoading(false);
        
        // Save verification result to localStorage for persistence
        localStorage.setItem('airkit-verification-result', JSON.stringify(results));
        console.log("✅ Verification completed and saved:", results);
      });

      widgetRef.current.on("close", () => {
        setIsLoading(false);
        console.log("Widget closed");
      });

      // Start the widget
      widgetRef.current.launch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
      console.error("❌ Verification failed:", err);
    }
  };

  const handleReset = () => {
    setVerificationResult(null);
    setError(null);
    if (widgetRef.current) {
      widgetRef.current.destroy();
      widgetRef.current = null;
    }
    console.log("🔄 Verification reset");
  };

  const clearCredentials = () => {
    localStorage.removeItem('airkit-verification-result');
    setVerificationResult(null);
    setError(null);
    if (widgetRef.current) {
      widgetRef.current.destroy();
      widgetRef.current = null;
    }
    console.log("🗑️ All credentials cleared from localStorage");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (widgetRef.current) {
        widgetRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <Button 
          onClick={handleVerifyCredential} 
          disabled={isLoading}
          className="px-6 py-2"
        >
          {isLoading ? 'Verifying...' : 'Verify Credential'}
        </Button>
        
        {(verificationResult || error) && (
          <Button 
            onClick={handleReset} 
            variant="outline"
            className="px-6 py-2"
          >
            Reset
          </Button>
        )}

        {verificationResult && (
          <Button 
            onClick={clearCredentials} 
            variant="destructive"
            className="px-6 py-2 text-sm"
          >
            🗑️ Clear VCs
          </Button>
        )}
      </div>

      {/* Show if credentials are loaded from storage */}
      {verificationResult && !isLoading && !error && (
        <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded border">
          💾 Credentials loaded from previous session
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 font-medium">❌ Verification Error</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {verificationResult && (
        <div>
          {/* Check if user is verified as a woman (Compliant status) */}
          {(verificationResult as any)?.status === "Compliant" ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800 font-medium mb-1">✅ Verification Complete</p>
                <p className="text-green-700 text-sm">Welcome to the community! Access granted to HoodMap.</p>
              </div>
              <HoodMap />
            </div>
          ) : (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 font-medium mb-2">✅ Verification Complete</p>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Status:</span> Verification completed successfully</p>
                <p><span className="font-medium">Results:</span> Check console for detailed output</p>
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-800">
                  Show raw results
                </summary>
                <pre className="text-xs bg-white p-2 rounded border overflow-auto mt-2 max-h-40">
                  {JSON.stringify(verificationResult, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 