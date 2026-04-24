import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { AuthState } from '../types';

interface Props {
  onLogin: (state: AuthState) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.post<AuthState>('/auth/login', { email, password });
      onLogin(data);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>ClinicFlow</h1>
        <p style={styles.subtitle}>Sign in to your account</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
              autoComplete="email"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
              autoComplete="current-password"
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <div style={styles.hint}>
          <p style={styles.hintText}>Demo credentials:</p>
          <p style={styles.hintText}>Admin: admin@clinic.com / admin123</p>
          <p style={styles.hintText}>Doctor: dr.smith@clinic.com / doctor123</p>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f4f8',
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '2.5rem',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
  },
  title: { margin: 0, fontSize: '1.8rem', color: '#1a73e8', textAlign: 'center' },
  subtitle: { textAlign: 'center', color: '#666', marginTop: 4, marginBottom: '1.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontWeight: 600, fontSize: '0.9rem', color: '#333' },
  input: {
    padding: '0.6rem 0.8rem',
    border: '1.5px solid #ddd',
    borderRadius: 8,
    fontSize: '1rem',
    outline: 'none',
  },
  error: { color: '#d32f2f', fontSize: '0.875rem', margin: 0 },
  button: {
    padding: '0.75rem',
    background: '#1a73e8',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  hint: { marginTop: '1.5rem', background: '#f5f5f5', borderRadius: 8, padding: '1rem' },
  hintText: { margin: '2px 0', fontSize: '0.8rem', color: '#555' },
};
