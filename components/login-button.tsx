import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { airService } from '@/lib/air-service';
import { BUILD_ENV } from '@mocanetwork/airkit';

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
      <div className="text-center space-y-4">
        <p className="text-green-600 mb-4">✅ Logged in successfully!</p>
        <pre className="text-sm bg-gray-100 p-4 rounded mb-4">
          {JSON.stringify(user, null, 2)}
        </pre>
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