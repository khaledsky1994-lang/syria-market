import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import ListingCard from '../components/ListingCard';

export default function SearchPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = (e) => {
    e?.preventDefault();
    setLoading(true);
    api.get('/listings', {
      params: { q: query || undefined, minPrice: minPrice || undefined, maxPrice: maxPrice || undefined, sort },
    }).then(({ data }) => setResults(data.listings)).finally(() => setLoading(false));
    setParams(query ? { q: query } : {});
  };

  useEffect(() => { search(); }, []); // eslint-disable-line

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

      {loading ? (
        <p style={styles.loadingText}>{t('loading')}</p>
      ) : results.length === 0 ? (
        <p style={styles.loadingText}>{t('noResults')}</p>
      ) : (
        <div style={styles.grid}>
          {results.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 1200, margin: '0 auto', padding: '28px 24px 48px' },
  filterBar: {
    display: 'flex', flexWrap: 'wrap', gap: 10, background: 'var(--color-surface)',
    padding: 16, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', marginBottom: 28,
  },
  mainInput: { flex: '2 1 220px', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 14 },
  smallInput: { flex: '1 1 110px', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 14 },
  select: { flex: '1 1 160px', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 14 },
  applyButton: { background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 700 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 },
  loadingText: { textAlign: 'center', color: 'var(--color-ink-muted)', padding: '40px 0' },
};
