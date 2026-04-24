import { useState } from 'react';
import { AuthState } from '../types';
import { saveAuth, loadAuth, clearAuth } from '../lib/auth';

export const useAuth = () => {
  const [auth, setAuth] = useState<AuthState | null>(loadAuth);

  const login = (state: AuthState) => {
    saveAuth(state);
    setAuth(state);
  };

  const logout = () => {
    clearAuth();
    setAuth(null);
  };

  return { auth, login, logout };
};
