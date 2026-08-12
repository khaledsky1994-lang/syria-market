import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api, { SERVER_ORIGIN } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [myListings, setMyListings] = useState([]);

  useEffect(() => {
    if (!user) return navigate('/login');
    api.get('/listings/user/me').then(({ data }) => setMyListings(data.listings));
  }, [user]); // eslint-disable-line

  if (!user) return null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.name}>{user.name}</h1>
          <p style={styles.email}>{user.email} · {user.phone}</p>
        </div>
        <button style={styles.logoutButton} onClick={() => { logout(); navigate('/'); }}>{t('logout')}</button>
      </div>

      <div style={styles.langRow}>
        <span style={styles.sectionTitle}>{t('language')}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => i18n.changeLanguage('ar')} style={{ ...styles.langBtn, ...(i18n.language === 'ar' ? styles.langBtnActive : {}) }}>العربية</button>
          <button onClick={() => i18n.changeLanguage('en')} style={{ ...styles.langBtn, ...(i18n.language === 'en' ? styles.langBtnActive : {}) }}>English</button>
        </div>
      </div>

      <h2 style={styles.sectionTitle}>{t('myListings')} ({myListings.length})</h2>
      {myListings.length === 0 ? (
        <p style={styles.empty}>{t('noResults')}</p>
      ) : (
        <div style={styles.grid}>
          {myListings.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 1000, margin: '0 auto', padding: '28px 24px 60px' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)', padding: 22, marginBottom: 20,
  },
  name: { fontSize: 22, fontWeight: 800, marginBottom: 4 },
  email: { color: 'var(--color-ink-muted)', fontSize: 13.5 },
  logoutButton: { background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 13.5 },
  langRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 24,
  },
  langBtn: { border: '1px solid var(--color-border)', background: 'var(--color-bg)', borderRadius: 16, padding: '7px 16px', fontSize: 13 },
  langBtnActive: { background: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' },
  sectionTitle: { fontSize: 16, fontWeight: 700, marginBottom: 14 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 },
  empty: { color: 'var(--color-ink-muted)', padding: '20px 0' },
};
