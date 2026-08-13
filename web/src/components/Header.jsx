import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const switchLang = (lang) => i18n.changeLanguage(lang);

  return (
    <header style={styles.header}>
      <div style={styles.tricolor}>
        <span style={{ ...styles.tricolorBand, background: 'var(--color-primary)' }} />
        <span style={{ ...styles.tricolorBand, background: '#FFFFFF' }} />
        <span style={{ ...styles.tricolorBand, background: '#16191B' }} />
      </div>
      <div style={styles.inner}>
        <Link to="/" style={styles.logo}>
          <span style={styles.logoMark}>س</span>
          <span>{t('appName')}</span>
        </Link>

        <nav style={styles.nav}>
          <Link to="/" style={styles.navLink}>{t('home')}</Link>
          <Link to="/search" style={styles.navLink}>{t('search')}</Link>
          {user && <Link to="/messages" style={styles.navLink}>{t('messages')}</Link>}
          {user?.role === 'ADMIN' && <Link to="/admin" style={styles.navLink}>{t('adminDashboard')}</Link>}
        </nav>

        <div style={styles.actions}>
          <div style={styles.langSwitch}>
            <button
              onClick={() => switchLang('ar')}
              style={{ ...styles.langBtn, ...(i18n.language === 'ar' ? styles.langBtnActive : {}) }}
            >
              عربي
            </button>
            <button
              onClick={() => switchLang('tr')}
              style={{ ...styles.langBtn, ...(i18n.language === 'tr' ? styles.langBtnActive : {}) }}
            >
              TR
            </button>
            <button
              onClick={() => switchLang('en')}
              style={{ ...styles.langBtn, ...(i18n.language === 'en' ? styles.langBtnActive : {}) }}
            >
              EN
            </button>
          </div>

          <button style={styles.postButton} onClick={() => navigate(user ? '/create' : '/login')}>
            + {t('postAd')}
          </button>

          {user ? (
            <Link to="/profile" style={styles.profileLink}>{user.name}</Link>
          ) : (
            <Link to="/login" style={styles.profileLink}>{t('login')}</Link>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    background: 'var(--color-surface)',
    borderBottom: '1px solid var(--color-border)',
    position: 'sticky', top: 0, zIndex: 50,
  },
  tricolor: { display: 'flex', height: 4 },
  tricolorBand: { flex: 1 },
  inner: {
    maxWidth: 1200, margin: '0 auto', padding: '14px 24px',
    display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, fontWeight: 800,
    color: 'var(--color-primary-dark)',
  },
  logoMark: {
    width: 34, height: 34, borderRadius: 8, background: 'var(--color-primary)',
    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 800, fontSize: 18,
  },
  nav: { display: 'flex', gap: 20, flex: 1 },
  navLink: { fontWeight: 600, color: 'var(--color-ink)', fontSize: 15 },
  actions: { display: 'flex', alignItems: 'center', gap: 12 },
  langSwitch: { display: 'flex', border: '1px solid var(--color-border)', borderRadius: 20, overflow: 'hidden' },
  langBtn: { border: 'none', background: 'transparent', padding: '6px 12px', fontSize: 13, color: 'var(--color-ink-muted)' },
  langBtnActive: { background: 'var(--color-primary)', color: 'white' },
  postButton: {
    background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: 20,
    padding: '9px 18px', fontWeight: 700, fontSize: 14,
  },
  profileLink: { fontWeight: 700, fontSize: 14, color: 'var(--color-primary-dark)' },
};
