import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { airService } from '@/lib/air-service';
import { BUILD_ENV } from '@mocanetwork/airkit';
import { CredentialVerification } from './credential-verification';

export function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      
      // Initialize the service
      await airService.init({
        buildEnv: BUILD_ENV.SANDBOX,
        enableLogging: true,
        skipRehydration: false
      });
      
      // Trigger login flow
      const loggedInResult = await airService.login();
      
      console.log('Login successful:', loggedInResult);
      setUser(loggedInResult);
      
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      
      // Logout from AIR service
      await airService.logout();
      
      console.log('Logged out successfully');
      setUser(null);
      
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return (
      <div className="text-center space-y-6">
        <p className="text-green-600 mb-4">✅ Logged in successfully!</p>
        
        <div className="text-left bg-gray-100 p-4 rounded mb-4">
          <h3 className="font-medium mb-2">User Info:</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">ID:</span> {user.id}</p>
            <p><span className="font-medium">Account Address:</span> {user.abstractAccountAddress || 'Not available'}</p>
            <p><span className="font-medium">MFA Setup:</span> {user.isMFASetup ? '✅ Yes' : '❌ No'}</p>
            <p><span className="font-medium">Logged In:</span> {user.isLoggedIn ? '✅ Yes' : '❌ No'}</p>
          </div>
        </div>

        <div className="text-left bg-blue-50 p-4 rounded mb-4">
          <h3 className="font-medium mb-3">Credential Verification:</h3>
          <CredentialVerification />
        </div>
        
        <Button 
          onClick={handleLogout} 
          disabled={isLoading}
          variant="outline"
          className="px-8 py-4 text-lg"
        >
          {isLoading ? 'Signing out...' : 'Sign Out'}
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={handleLogin} 
      disabled={isLoading}
      className="px-8 py-4 text-lg"
    >
      {isLoading ? 'Logging in...' : 'Login with AIR'}
    </Button>
  );
} 