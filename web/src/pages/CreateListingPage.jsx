import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api, { SERVER_ORIGIN } from '../api/client';
import { categoryName } from '../utils/categoryName';

const CONDITIONS = [
  ['NEW', 'conditionNew'], ['LIKE_NEW', 'conditionLikeNew'], ['GOOD', 'conditionGood'],
  ['FAIR', 'conditionFair'], ['FOR_PARTS', 'conditionForParts'],
];

export default function CreateListingPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [topCategoryId, setTopCategoryId] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', price: '', city: '', categoryId: '',
    condition: 'GOOD', negotiable: true,
  });
  const [existingImages, setExistingImages] = useState([]);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingListing, setLoadingListing] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/listings/${id}`).then(({ data }) => {
      const l = data.listing;
      setForm({
        title: l.title, description: l.description, price: String(l.price), city: l.city,
        categoryId: l.categoryId, condition: l.condition, negotiable: l.negotiable,
      });
      if (l.category?.parentId) setTopCategoryId(l.category.parentId);
      else setTopCategoryId(l.categoryId);
      setExistingImages(l.images);
    }).finally(() => setLoadingListing(false));
  }, [id, isEdit]);

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
      if (isEdit) {
        await api.put(`/listings/${id}`, form);
        navigate(`/listing/${id}`);
      } else {
        const formData = new FormData();
        Object.entries(form).forEach(([k, v]) => formData.append(k, String(v)));
        images.forEach((img) => formData.append('images', img));
        const { data } = await api.post('/listings', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        navigate(`/listing/${data.listing.id}`);
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingListing) return <p style={{ textAlign: 'center', padding: 60, color: 'var(--color-ink-muted)' }}>{t('loading')}</p>;

  return (
    <div style={styles.container}>
      <form onSubmit={submit} style={styles.card}>
        <h1 style={styles.title}>{isEdit ? t('editListing') : t('postAd')}</h1>
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
              onClick={() => { setTopCategoryId(c.id); if (!c.children?.length) update('categoryId', c.id); }}
              style={{ ...styles.chip, ...(topCategoryId === c.id ? styles.chipActive : {}) }}
            >
              {c.icon} {categoryName(c, i18n.language)}
            </button>
          ))}
        </div>

        {topCategoryId && categories.find((c) => c.id === topCategoryId)?.children?.length > 0 && (
          <>
            <label style={styles.label}>{t('subcategories')}</label>
            <div style={styles.chipRow}>
              {categories.find((c) => c.id === topCategoryId).children.map((sub) => (
                <button
                  type="button"
                  key={sub.id}
                  onClick={() => update('categoryId', sub.id)}
                  style={{ ...styles.chip, ...(Number(form.categoryId) === sub.id ? styles.chipActive : {}) }}
                >
                  {categoryName(sub, i18n.language)}
                </button>
              ))}
            </div>
          </>
        )}

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

        {isEdit && existingImages.length > 0 && (
          <>
            <label style={styles.label}>{t('selectImages')}</label>
            <div style={styles.previewRow}>
              {existingImages.map((img) => (
                <img key={img.id} src={`${SERVER_ORIGIN}${img.url}`} alt="" style={styles.previewImg} />
              ))}
            </div>
            <p style={styles.imgNote}>لتغيير الصور، احذف الإعلان وانشره من جديد / To change photos, delete and re-create the listing</p>
          </>
        )}

        {!isEdit && (
          <>
            <label style={styles.label}>{t('selectImages')}</label>
            <input type="file" accept="image/*" multiple onChange={onFiles} style={{ marginBottom: 12 }} />
            {previews.length > 0 && (
              <div style={styles.previewRow}>
                {previews.map((src, idx) => <img key={idx} src={src} alt="" style={styles.previewImg} />)}
              </div>
            )}
          </>
        )}

        <button style={styles.submitButton} disabled={submitting}>
          {submitting ? t('loading') : isEdit ? t('saveChanges') : t('publish')}
        </button>
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
  imgNote: { fontSize: 12, color: 'var(--color-ink-muted)', marginTop: 4 },
};
