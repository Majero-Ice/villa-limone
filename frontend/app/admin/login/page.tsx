'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/admin-auth';
import { Button } from '@/shared/ui';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, checkAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lifted p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif text-graphite mb-2">Villa Limone</h1>
            <p className="text-warm-gray">Admin Login</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-graphite mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-soft-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent"
                placeholder="admin@villalimone.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-graphite mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-soft-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-warm-gray">
            <p>Default credentials: admin@villalimone.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
