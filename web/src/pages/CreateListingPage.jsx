import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';

const CONDITIONS = [
  ['NEW', 'conditionNew'], ['LIKE_NEW', 'conditionLikeNew'], ['GOOD', 'conditionGood'],
  ['FAIR', 'conditionFair'], ['FOR_PARTS', 'conditionForParts'],
];

export default function CreateListingPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', price: '', city: '', categoryId: '',
    condition: 'GOOD', negotiable: true,
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories));
  }, []);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const onFiles = (e) => {
    const files = Array.from(e.target.files).slice(0, 8);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.description || !form.price || !form.categoryId || !form.city) {
      setError('يرجى تعبئة كل الحقول / Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, String(v)));
      images.forEach((img) => formData.append('images', img));
      const { data } = await api.post('/listings', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate(`/listing/${data.listing.id}`);
    } catch (err) {
      setError(err?.response?.data?.error || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={submit} style={styles.card}>
        <h1 style={styles.title}>{t('postAd')}</h1>
        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label}>{t('adTitle')}</label>
        <input style={styles.input} value={form.title} onChange={(e) => update('title', e.target.value)} />

        <label style={styles.label}>{t('adDescription')}</label>
        <textarea style={{ ...styles.input, height: 100 }} value={form.description} onChange={(e) => update('description', e.target.value)} />

        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>{t('price')} (SYP)</label>
            <input style={styles.input} type="number" value={form.price} onChange={(e) => update('price', e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>{t('city')}</label>
            <input style={styles.input} value={form.city} onChange={(e) => update('city', e.target.value)} />
          </div>
        </div>

        <label style={styles.label}>{t('selectCategory')}</label>
        <div style={styles.chipRow}>
          {categories.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => update('categoryId', c.id)}
              style={{ ...styles.chip, ...(form.categoryId === c.id ? styles.chipActive : {}) }}
            >
              {c.icon} {i18n.language === 'ar' ? c.nameAr : c.nameEn}
            </button>
          ))}
        </div>

        <label style={styles.label}>{t('condition')}</label>
        <div style={styles.chipRow}>
          {CONDITIONS.map(([value, key]) => (
            <button
              type="button"
              key={value}
              onClick={() => update('condition', value)}
              style={{ ...styles.chip, ...(form.condition === value ? styles.chipActive : {}) }}
            >
              {t(key)}
            </button>
          ))}
        </div>

        <label style={styles.checkboxRow}>
          <input type="checkbox" checked={form.negotiable} onChange={(e) => update('negotiable', e.target.checked)} />
          {t('negotiable')}
        </label>

        <label style={styles.label}>{t('selectImages')}</label>
        <input type="file" accept="image/*" multiple onChange={onFiles} style={{ marginBottom: 12 }} />
        {previews.length > 0 && (
          <div style={styles.previewRow}>
            {previews.map((src, idx) => <img key={idx} src={src} alt="" style={styles.previewImg} />)}
          </div>
        )}

        <button style={styles.submitButton} disabled={submitting}>{submitting ? t('loading') : t('publish')}</button>
      </form>
    </div>
  );
}

const styles = {
  container: { maxWidth: 640, margin: '0 auto', padding: '28px 24px 60px' },
  card: {
    background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)',
    padding: 32, border: '1px solid var(--color-border)',
  },
  title: { fontSize: 22, fontWeight: 800, marginBottom: 20 },
  label: { display: 'block', fontSize: 13.5, fontWeight: 700, marginBottom: 6, marginTop: 14 },
  input: { width: '100%', padding: '11px 14px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 14 },
  row: { display: 'flex', gap: 14 },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  chip: { border: '1px solid var(--color-border)', background: 'var(--color-bg)', borderRadius: 16, padding: '7px 14px', fontSize: 13 },
  chipActive: { background: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' },
  checkboxRow: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, fontSize: 14, fontWeight: 600 },
  previewRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 },
  previewImg: { width: 64, height: 64, borderRadius: 8, objectFit: 'cover' },
  submitButton: { width: '100%', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 8, padding: 14, fontWeight: 700, fontSize: 15, marginTop: 26 },
  error: { background: '#FCECEA', color: 'var(--color-danger)', padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 14 },
};
