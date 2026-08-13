import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading | success | error

  useEffect(() => {
    const token = params.get('token');
    if (!token) return setStatus('error');
    api.get(`/auth/verify-email?token=${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [params]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>{t('verifyEmailTitle')}</h1>
        {status === 'loading' && <p style={styles.text}>{t('verifyingEmail')}</p>}
        {status === 'success' && <p style={{ ...styles.text, color: 'var(--color-success)' }}>✓ {t('emailVerifiedSuccess')}</p>}
        {status === 'error' && <p style={{ ...styles.text, color: 'var(--color-danger)' }}>{t('emailVerifiedFailed')}</p>}
        <Link to="/" style={styles.link}>{t('backHome')}</Link>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', padding: '80px 24px' },
  card: {
    width: '100%', maxWidth: 400, background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-card)', padding: 32, border: '1px solid var(--color-border)', textAlign: 'center',
  },
  title: { fontSize: 20, fontWeight: 800, marginBottom: 16 },
  text: { fontSize: 14.5, marginBottom: 20 },
  link: { color: 'var(--color-primary)', fontWeight: 700, fontSize: 14 },
};
