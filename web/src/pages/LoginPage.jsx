import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier, password);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={submit} style={styles.card}>
        <h1 style={styles.title}>{t('appName')}</h1>
        <p style={styles.subtitle}>{t('welcome')}</p>

        {error && <div style={styles.error}>{error}</div>}

        <input style={styles.input} placeholder={`${t('email')} / ${t('phone')}`} value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
        <input style={styles.input} placeholder={t('password')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button style={styles.button} disabled={loading}>{loading ? t('loading') : t('loginButton')}</button>
        <Link to="/register" style={styles.link}>{t('noAccount')}</Link>
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
  title: { textAlign: 'center', fontSize: 26, fontWeight: 800, color: 'var(--color-primary-dark)', marginBottom: 4 },
  subtitle: { textAlign: 'center', color: 'var(--color-ink-muted)', marginBottom: 24, fontSize: 14 },
  input: { width: '100%', padding: '12px 14px', marginBottom: 12, borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 14 },
  button: { width: '100%', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 8, padding: 13, fontWeight: 700, fontSize: 15, marginTop: 6 },
  link: { display: 'block', textAlign: 'center', marginTop: 18, color: 'var(--color-primary)', fontSize: 13.5, fontWeight: 600 },
  error: { background: '#FCECEA', color: 'var(--color-danger)', padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 14 },
};
