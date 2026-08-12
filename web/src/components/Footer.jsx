import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer style={styles.footer}>
      <div style={styles.inner}>
        <span style={styles.brand}>{t('appName')}</span>
        <span style={styles.rights}>© {new Date().getFullYear()} — {t('footerRights')}</span>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    borderTop: '1px solid var(--color-border)', marginTop: 'auto',
    padding: '28px 24px', background: 'var(--color-surface)',
  },
  inner: {
    maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: 8, color: 'var(--color-ink-muted)', fontSize: 13,
  },
  brand: { fontWeight: 700, color: 'var(--color-primary-dark)' },
  rights: {},
};
