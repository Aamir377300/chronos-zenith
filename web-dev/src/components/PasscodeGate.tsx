'use client';

import { useState } from 'react';
import { usePasscodeStore } from '@/store/passcodeStore';
import { ownerApi } from '@/lib/api';

export function PasscodeGate({ children }: { children: React.ReactNode }) {
  const passcode = usePasscodeStore((s) => s.passcode);
  const hasHydrated = usePasscodeStore((s) => s._hasHydrated);
  const setPasscode = usePasscodeStore((s) => s.setPasscode);
  const setUser = usePasscodeStore((s) => s.setUser);

  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (passcode) {
    return <>{children}</>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Persist first so the axios interceptor can send x-passcode
    setPasscode(value);

    try {
      const data = await ownerApi.getMe();
      setUser(data.user);
    } catch (err: unknown) {
      usePasscodeStore.getState().clearPasscode();
      setError(err instanceof Error ? err.message : 'Invalid passcode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="" className="w-16 h-16 rounded-2xl mx-auto mb-3" />
          <h1 className="text-xl font-semibold text-gray-900">Chronos Zenith</h1>
          <p className="text-sm text-gray-500 mt-1">Enter passcode</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passcode</label>
            <input
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
              autoFocus
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !value}
            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? 'Checking...' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  );
}
