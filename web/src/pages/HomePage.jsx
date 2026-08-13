import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import ListingCard from '../components/ListingCard';
import { categoryName } from '../utils/categoryName';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/categories'),
      api.get('/listings'),
    ]).then(([catRes, listRes]) => {
      setCategories(catRes.data.categories);
      setListings(listRes.data.listings);
    }).finally(() => setLoading(false));
  }, []);

  const onCategoryClick = (cat) => {
    if (expandedCategory === cat.id) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(cat.id);
    }
  };

  const goToCategory = (categoryId) => navigate(`/search?categoryId=${categoryId}`);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const activeCat = categories.find((c) => c.id === expandedCategory);

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
        {/* Dense category grid, similar in spirit to classifieds sites like Sahibinden:
            every top-level category is always visible with an icon, and clicking one
            reveals its subcategories inline instead of navigating away. */}
        <div style={styles.categoryPanel}>
          <div style={styles.categoryGrid}>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => onCategoryClick(c)}
                style={{ ...styles.categoryCell, ...(expandedCategory === c.id ? styles.categoryCellActive : {}) }}
              >
                <span style={styles.categoryIcon}>{c.icon}</span>
                <span style={styles.categoryLabel}>{categoryName(c, i18n.language)}</span>
              </button>
            ))}
          </div>

          {activeCat && activeCat.children?.length > 0 && (
            <div style={styles.subPanel}>
              <div style={styles.subPanelHeader}>
                <span>{categoryName(activeCat, i18n.language)} — {t('subcategories')}</span>
                <button onClick={() => goToCategory(activeCat.id)} style={styles.viewAllLink}>{t('allSubcategories')} ›</button>
              </div>
              <div style={styles.subChipRow}>
                {activeCat.children.map((sub) => (
                  <button key={sub.id} onClick={() => goToCategory(sub.id)} style={styles.subChip}>
                    {categoryName(sub, i18n.language)}
                  </button>
                ))}
              </div>
            </div>
          )}
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
    padding: '48px 24px 64px', position: 'relative',
  },
  heroInner: { maxWidth: 720, margin: '0 auto', textAlign: 'center' },
  heroTitle: { color: 'white', fontSize: 28, fontWeight: 800, marginBottom: 22, lineHeight: 1.4 },
  searchForm: { display: 'flex', gap: 8, background: 'white', borderRadius: 30, padding: 6, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' },
  searchInput: { flex: 1, border: 'none', outline: 'none', padding: '10px 16px', fontSize: 15, borderRadius: 24 },
  searchButton: {
    background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: 24,
    padding: '10px 22px', fontWeight: 700, fontSize: 14,
  },
  container: { maxWidth: 1200, margin: '-32px auto 0', padding: '0 24px 48px', position: 'relative' },
  categoryPanel: {
    background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-card)', marginBottom: 28, overflow: 'hidden',
  },
  categoryGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: 2, padding: 14,
  },
  categoryCell: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    border: 'none', background: 'transparent', borderRadius: 10, padding: '14px 6px',
    fontSize: 12, fontWeight: 600, color: 'var(--color-ink)',
  },
  categoryCellActive: { background: 'var(--color-bg)', color: 'var(--color-primary-dark)' },
  categoryIcon: { fontSize: 24 },
  categoryLabel: { textAlign: 'center', lineHeight: 1.3 },
  subPanel: { borderTop: '1px solid var(--color-border)', background: 'var(--color-bg)', padding: '14px 18px 18px' },
  subPanelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--color-ink)' },
  viewAllLink: { border: 'none', background: 'none', color: 'var(--color-primary)', fontWeight: 700, fontSize: 12.5 },
  subChipRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  subChip: {
    border: '1px solid var(--color-border)', background: 'var(--color-surface)', borderRadius: 16,
    padding: '7px 14px', fontSize: 12.5, fontWeight: 600, color: 'var(--color-ink)',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 },
  loadingText: { textAlign: 'center', color: 'var(--color-ink-muted)', padding: '40px 0' },
};
