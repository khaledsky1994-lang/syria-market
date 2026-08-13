import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmailBanner() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [sent, setSent] = useState(false);

  if (!user || user.emailVerified) return null;

  const resend = async () => {
    try {
      await api.post('/auth/resend-verification');
      setSent(true);
    } catch (e) { /* ignore */ }
  };

  return (
    <div style={styles.banner}>
      <span>⚠️ {t('verifyEmailPending')}</span>
      <button style={styles.button} onClick={resend}>{sent ? t('verificationResent') : t('resendVerification')}</button>
    </div>
  );
}

const styles = {
  banner: {
    background: '#FFF6E5', borderBottom: '1px solid #F0DDA8', color: '#7A5B12',
    padding: '10px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center',
    gap: 14, fontSize: 13, flexWrap: 'wrap', textAlign: 'center',
  },
  button: {
    background: '#7A5B12', color: 'white', border: 'none', borderRadius: 6,
    padding: '6px 12px', fontSize: 12, fontWeight: 700,
  },
};
