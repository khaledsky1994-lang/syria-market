import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api, { SERVER_ORIGIN } from '../api/client';
import ListingCard from '../components/ListingCard';
import { categoryName } from '../utils/categoryName';

export default function SearchPage() {
  const { t, i18n } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [categoryId, setCategoryId] = useState(params.get('categoryId') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [category, setCategory] = useState(null);

  useEffect(() => {
    if (categoryId) {
      api.get('/categories').then(({ data }) => {
        for (const top of data.categories) {
          if (String(top.id) === String(categoryId)) return setCategory(top);
          const child = top.children?.find((c) => String(c.id) === String(categoryId));
          if (child) return setCategory({ ...child, parent: top });
        }
      });
    } else {
      setCategory(null);
    }
  }, [categoryId]);

  const search = (e) => {
    e?.preventDefault();
    setLoading(true);
    api.get('/listings', {
      params: {
        q: query || undefined,
        categoryId: categoryId || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sort,
      },
    }).then(({ data }) => { setResults(data.listings); setTotal(data.total); }).finally(() => setLoading(false));
    const next = {};
    if (query) next.q = query;
    if (categoryId) next.categoryId = categoryId;
    setParams(next);
  };

  useEffect(() => { search(); }, []); // eslint-disable-line
  useEffect(() => { if (params.get('categoryId')) search(); }, [categoryId]); // eslint-disable-line

  return (
    <div style={styles.container}>
      <form onSubmit={search} style={styles.filterBar}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          style={styles.mainInput}
        />
        <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder={t('minPrice')} type="number" style={styles.smallInput} />
        <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder={t('maxPrice')} type="number" style={styles.smallInput} />
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={styles.select}>
          <option value="newest">{t('sortNewest')}</option>
          <option value="price_asc">{t('sortPriceAsc')}</option>
          <option value="price_desc">{t('sortPriceDesc')}</option>
        </select>
        <button type="submit" style={styles.applyButton}>{t('apply')}</button>
      </form>

      {category && (
        <div style={styles.categoryBar}>
          <span style={styles.categoryBarText}>
            {category.parent ? `${categoryName(category.parent, i18n.language)} / ` : ''}
            <strong>{categoryName(category, i18n.language)}</strong>
          </span>
          <button onClick={() => { setCategoryId(''); setParams((p) => { p.delete('categoryId'); return p; }); search(); }} style={styles.clearCategory}>✕</button>
        </div>
      )}

      <div style={styles.resultsHeader}>
        <span style={styles.resultsCount}>{total} {t('resultsCount')}</span>
        <div style={styles.viewToggle}>
          <button onClick={() => setViewMode('grid')} style={{ ...styles.viewBtn, ...(viewMode === 'grid' ? styles.viewBtnActive : {}) }}>▦ {t('viewGrid')}</button>
          <button onClick={() => setViewMode('list')} style={{ ...styles.viewBtn, ...(viewMode === 'list' ? styles.viewBtnActive : {}) }}>☰ {t('viewList')}</button>
        </div>
      </div>

      {loading ? (
        <p style={styles.loadingText}>{t('loading')}</p>
      ) : results.length === 0 ? (
        <p style={styles.loadingText}>{t('noResults')}</p>
      ) : viewMode === 'grid' ? (
        <div style={styles.grid}>
          {results.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      ) : (
        <div style={styles.list}>
          {results.map((l) => (
            <a key={l.id} href={`/listing/${l.id}`} style={styles.listRow}>
              {l.images?.[0] ? (
                <img src={`${SERVER_ORIGIN}${l.images[0].url}`} alt="" style={styles.listImg} />
              ) : <div style={{ ...styles.listImg, background: '#EFE9DC' }} />}
              <div style={{ flex: 1 }}>
                <div style={styles.listTitle}>{l.title}</div>
                <div style={styles.listMeta}>{l.city} · {l.condition}</div>
              </div>
              <div style={styles.listPrice}>{l.price.toLocaleString()} {l.currency}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 1200, margin: '0 auto', padding: '28px 24px 48px' },
  filterBar: {
    display: 'flex', flexWrap: 'wrap', gap: 10, background: 'var(--color-surface)',
    padding: 16, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', marginBottom: 16,
  },
  mainInput: { flex: '2 1 220px', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 14 },
  smallInput: { flex: '1 1 110px', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 14 },
  select: { flex: '1 1 160px', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 14 },
  applyButton: { background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 700 },
  categoryBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg)',
    border: '1px solid var(--color-border)', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13.5,
  },
  categoryBarText: { color: 'var(--color-ink)' },
  clearCategory: { border: 'none', background: 'none', fontSize: 14, color: 'var(--color-ink-muted)', cursor: 'pointer' },
  resultsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  resultsCount: { fontSize: 13, color: 'var(--color-ink-muted)', fontWeight: 600 },
  viewToggle: { display: 'flex', gap: 6 },
  viewBtn: { border: '1px solid var(--color-border)', background: 'var(--color-surface)', borderRadius: 8, padding: '6px 12px', fontSize: 12.5, fontWeight: 600 },
  viewBtnActive: { background: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  listRow: {
    display: 'flex', alignItems: 'center', gap: 14, background: 'var(--color-surface)',
    border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 12, color: 'var(--color-ink)',
  },
  listImg: { width: 72, height: 72, borderRadius: 8, objectFit: 'cover', flexShrink: 0 },
  listTitle: { fontSize: 14.5, fontWeight: 700 },
  listMeta: { fontSize: 12.5, color: 'var(--color-ink-muted)', marginTop: 3 },
  listPrice: { fontFamily: 'var(--font-number)', fontWeight: 700, fontSize: 15, color: 'var(--color-primary-dark)', whiteSpace: 'nowrap' },
  loadingText: { textAlign: 'center', color: 'var(--color-ink-muted)', padding: '40px 0' },
};
