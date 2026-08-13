import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', city: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.errors?.[0]?.msg || err?.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={submit} style={styles.card}>
        <h1 style={styles.title}>{t('register')}</h1>
        {error && <div style={styles.error}>{error}</div>}

        {['name', 'email', 'phone', 'city', 'password'].map((field) => (
          <input
            key={field}
            style={styles.input}
            placeholder={t(field)}
            type={field === 'password' ? 'password' : 'text'}
            value={form[field]}
            onChange={(e) => update(field, e.target.value)}
          />
        ))}

        <button style={styles.button} disabled={loading}>{loading ? t('loading') : t('registerButton')}</button>
        <Link to="/login" style={styles.link}>{t('haveAccount')}</Link>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>{t('orContinueWith')}</span>
          <span style={styles.dividerLine} />
        </div>
        <GoogleSignInButton onSuccess={() => navigate('/')} onError={setError} />
      </form>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', padding: '60px 24px' },
  card: {
    width: '100%', maxWidth: 380, background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-card)', padding: 32, border: '1px solid var(--color-border)',
  },
  title: { textAlign: 'center', fontSize: 24, fontWeight: 800, color: 'var(--color-primary-dark)', marginBottom: 20 },
  input: { width: '100%', padding: '12px 14px', marginBottom: 12, borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 14 },
  button: { width: '100%', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 8, padding: 13, fontWeight: 700, fontSize: 15, marginTop: 6 },
  link: { display: 'block', textAlign: 'center', marginTop: 18, color: 'var(--color-primary)', fontSize: 13.5, fontWeight: 600 },
  error: { background: '#FCECEA', color: 'var(--color-danger)', padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 14 },
  divider: { display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 16px' },
  dividerLine: { flex: 1, height: 1, background: 'var(--color-border)' },
  dividerText: { fontSize: 12, color: 'var(--color-ink-muted)' },
};
