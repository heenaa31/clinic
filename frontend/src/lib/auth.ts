import { AuthState } from '../types';

const KEY = 'clinicflow_auth';

export const saveAuth = (state: AuthState) =>
  localStorage.setItem(KEY, JSON.stringify(state));

export const loadAuth = (): AuthState | null => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthState) : null;
  } catch {
    return null;
  }
};

export const clearAuth = () => localStorage.removeItem(KEY);
