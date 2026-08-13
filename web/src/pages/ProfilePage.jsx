import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api, { SERVER_ORIGIN } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [myListings, setMyListings] = useState([]);

  const loadListings = () => {
    api.get('/listings/user/me').then(({ data }) => setMyListings(data.listings));
  };

  useEffect(() => {
    if (!user) return navigate('/login');
    loadListings();
  }, [user]); // eslint-disable-line

  const deleteListing = async (id) => {
    if (!window.confirm(t('confirmDelete'))) return;
    await api.delete(`/listings/${id}`);
    loadListings();
  };

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
          <button onClick={() => i18n.changeLanguage('tr')} style={{ ...styles.langBtn, ...(i18n.language === 'tr' ? styles.langBtnActive : {}) }}>Türkçe</button>
          <button onClick={() => i18n.changeLanguage('en')} style={{ ...styles.langBtn, ...(i18n.language === 'en' ? styles.langBtnActive : {}) }}>English</button>
        </div>
      </div>

      <h2 style={styles.sectionTitle}>{t('myListings')} ({myListings.length})</h2>
      {myListings.length === 0 ? (
        <p style={styles.empty}>{t('noResults')}</p>
      ) : (
        <div style={styles.grid}>
          {myListings.map((l) => (
            <div key={l.id} style={styles.listingCard}>
              <div onClick={() => navigate(`/listing/${l.id}`)} style={{ cursor: 'pointer' }}>
                {l.images?.[0] ? (
                  <img src={`${SERVER_ORIGIN}${l.images[0].url}`} alt="" style={styles.listingImg} />
                ) : <div style={{ ...styles.listingImg, background: '#EFE9DC' }} />}
                <div style={styles.listingBody}>
                  <div style={styles.listingTitle}>{l.title}</div>
                  <div style={styles.listingPrice}>{l.price.toLocaleString()} {l.currency}</div>
                  {l.status === 'SOLD' && <div style={styles.soldTag}>{t('sold')}</div>}
                </div>
              </div>
              <div style={styles.cardActions}>
                <button style={styles.editBtn} onClick={() => navigate(`/edit/${l.id}`)}>✎ {t('edit')}</button>
                <button style={styles.deleteBtn} onClick={() => deleteListing(l.id)}>🗑 {t('delete')}</button>
              </div>
            </div>
          ))}
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
  listingCard: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' },
  listingImg: { width: '100%', aspectRatio: '4/3', objectFit: 'cover' },
  listingBody: { padding: '10px 12px' },
  listingTitle: { fontSize: 13.5, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  listingPrice: { fontSize: 13, color: 'var(--color-primary-dark)', fontWeight: 700, marginTop: 2 },
  soldTag: { display: 'inline-block', marginTop: 4, fontSize: 11, color: 'var(--color-danger)', fontWeight: 700 },
  cardActions: { display: 'flex', borderTop: '1px solid var(--color-border)' },
  editBtn: { flex: 1, border: 'none', background: 'var(--color-bg)', padding: '9px 0', fontSize: 12, fontWeight: 700 },
  deleteBtn: { flex: 1, border: 'none', borderInlineStart: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-danger)', padding: '9px 0', fontSize: 12, fontWeight: 700 },
};
