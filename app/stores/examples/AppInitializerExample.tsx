/**
 * EXAMPLE: App Root Setup with Auth Initialization
 * 
 * Place this in your root component/layout to:
 * - Initialize auth from localStorage
 * - Check if user is authenticated
 * - Setup data fetching on app load
 */

import { useEffect } from 'react';
import { useAuthSync, useAuthStore } from '@/stores';

/**
 * Wrap your main app with this component
 */
export function AppInitializer({ children }: { children: React.ReactNode }) {
  // Restore auth from localStorage
  useAuthSync();

  return children;
}

/**
 * EXAMPLE: Dashboard Layout with Protected Route
 */
export function DashboardLayout() {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="p-6">Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <p className="text-red-600">Please log in to continue</p>
      </div>
    );
  }

  return (
    <div>
      <header className="bg-white shadow">
        <div className="px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">STP Alumni Dashboard</h1>
          <div>
            <p className="text-gray-700">
              Welcome, {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-gray-500">{user?.authorTitle}</p>
          </div>
        </div>
      </header>
      {/* Main content */}
    </div>
  );
}

/**
 * EXAMPLE: Login Flow
 * 
 * Shows how to update auth store after login
 */
import { useAuthStore, showNotification } from '@/stores';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { useState } from 'react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const authStore = useAuthStore();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call your auth API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      const { token, user } = data.data;

      // Update Zustand auth store
      authStore.setUser(user);
      authStore.setToken(token);
      authStore.setIsAuthenticated(true);

      showNotification(`Welcome back, ${user.firstName}!`, 'success');

      // Auth sync hook will save to localStorage
      // User will be redirected by your router
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Login failed';
      showNotification(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto">
      <Input
        type="email"
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        placeholder="Email"
        required
        disabled={isSubmitting}
      />
      <Input
        type="password"
        value={password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        placeholder="Password"
        required
        disabled={isSubmitting}
      />
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}

/**
 * EXAMPLE: Logout and Cleanup
 */
export function LogoutButton() {
  const authStore = useAuthStore();

  const handleLogout = () => {
    authStore.logout(); // Clears auth store
    localStorage.removeItem('auth-storage'); // Clear localStorage
    showNotification('Logged out successfully', 'info');
    // Redirect to login page
    window.location.href = '/login';
  };

  return <button onClick={handleLogout}>Logout</button>;
}

/**
 * SETUP IN YOUR ROOT.TSX OR MAIN APP:
 * 
 * import { AppInitializer } from './stores/examples/AppInitializerExample';
 * 
 * function Root() {
 *   return (
 *     <AppInitializer>
 *       <Outlet />
 *     </AppInitializer>
 *   );
 * }
 */
