import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

// Reads the Google Client ID from an env var you set at build time.
// See web/.env.example — if it's not set, the button explains why it's disabled
// instead of silently failing.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function GoogleSignInButton({ onSuccess, onError }) {
  const { t } = useTranslation();
  const { googleSignIn } = useAuth();
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const scriptId = 'google-identity-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = initGoogle;
      document.body.appendChild(script);
    } else {
      initGoogle();
    }

    function initGoogle() {
      if (!window.google || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            await googleSignIn(response.credential);
            onSuccess?.();
          } catch (err) {
            onError?.(err?.response?.data?.error || 'Google sign-in failed');
          }
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline', size: 'large', width: 320, locale: 'ar',
      });
    }
  }, []); // eslint-disable-line

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div style={styles.disabledNote}>
        {t('googleSignInDisabled')}
      </div>
    );
  }

  return <div ref={buttonRef} style={{ display: 'flex', justifyContent: 'center' }} />;
}

const styles = {
  disabledNote: {
    fontSize: 12, color: 'var(--color-ink-muted)', textAlign: 'center',
    border: '1px dashed var(--color-border)', borderRadius: 8, padding: 10,
  },
};
