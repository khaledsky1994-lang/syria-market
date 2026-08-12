import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import ListingCard from '../components/ListingCard';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const load = useCallback((categoryId = null) => {
    setLoading(true);
    Promise.all([
      api.get('/categories'),
      api.get('/listings', { params: categoryId ? { categoryId } : {} }),
    ]).then(([catRes, listRes]) => {
      setCategories(catRes.data.categories);
      setListings(listRes.data.listings);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const onCategoryClick = (id) => {
    const next = activeCategory === id ? null : id;
    setActiveCategory(next);
    load(next);
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <h1 style={styles.heroTitle}>{t('tagline')}</h1>
          <form onSubmit={onSearchSubmit} style={styles.searchForm}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              style={styles.searchInput}
            />
            <button type="submit" style={styles.searchButton}>{t('search')}</button>
          </form>
        </div>
      </section>

      <div style={styles.container}>
        <div style={styles.categoryRow}>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => onCategoryClick(c.id)}
              style={{ ...styles.categoryChip, ...(activeCategory === c.id ? styles.categoryChipActive : {}) }}
            >
              <span style={{ marginInlineEnd: 6 }}>{c.icon}</span>
              {i18n.language === 'ar' ? c.nameAr : c.nameEn}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={styles.loadingText}>{t('loading')}</p>
        ) : listings.length === 0 ? (
          <p style={styles.loadingText}>{t('noResults')}</p>
        ) : (
          <div style={styles.grid}>
            {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  hero: {
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
    padding: '56px 24px 72px', position: 'relative',
  },
  heroInner: { maxWidth: 720, margin: '0 auto', textAlign: 'center' },
  heroTitle: { color: 'white', fontSize: 30, fontWeight: 800, marginBottom: 24, lineHeight: 1.4 },
  searchForm: { display: 'flex', gap: 8, background: 'white', borderRadius: 30, padding: 6, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' },
  searchInput: { flex: 1, border: 'none', outline: 'none', padding: '10px 16px', fontSize: 15, borderRadius: 24 },
  searchButton: {
    background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: 24,
    padding: '10px 22px', fontWeight: 700, fontSize: 14,
  },
  container: { maxWidth: 1200, margin: '-36px auto 0', padding: '0 24px 48px', position: 'relative' },
  categoryRow: {
    display: 'flex', gap: 10, overflowX: 'auto', background: 'var(--color-surface)',
    padding: 14, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', marginBottom: 28,
  },
  categoryChip: {
    border: '1px solid var(--color-border)', background: 'var(--color-bg)', borderRadius: 20,
    padding: '8px 16px', fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
  },
  categoryChipActive: { background: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 },
  loadingText: { textAlign: 'center', color: 'var(--color-ink-muted)', padding: '40px 0' },
};
