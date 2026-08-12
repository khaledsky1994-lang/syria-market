import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api, { SERVER_ORIGIN } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ListingDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/listings/${id}`).then(({ data }) => setListing(data.listing)).finally(() => setLoading(false));
  }, [id]);

  const contactSeller = async () => {
    if (!user) return navigate('/login');
    const { data } = await api.post('/conversations', { listingId: id });
    navigate(`/messages?conversation=${data.conversation.id}`);
  };

  const reportListing = async () => {
    if (!user) return navigate('/login');
    const reason = window.prompt(t('reportListing') + ':');
    if (!reason) return;
    await api.post('/reports', { listingId: id, reason });
    window.alert('✓');
  };

  if (loading) return <p style={styles.loadingText}>{t('loading')}</p>;
  if (!listing) return <p style={styles.loadingText}>{t('noResults')}</p>;

  const conditionLabel = {
    NEW: t('conditionNew'), LIKE_NEW: t('conditionLikeNew'), GOOD: t('conditionGood'),
    FAIR: t('conditionFair'), FOR_PARTS: t('conditionForParts'),
  }[listing.condition];

  const images = listing.images.length ? listing.images : [null];

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        <div>
          <div style={styles.mainImageWrap}>
            {images[activeImg] ? (
              <img src={`${SERVER_ORIGIN}${images[activeImg].url}`} alt={listing.title} style={styles.mainImage} />
            ) : (
              <div style={styles.noImage}>📷</div>
            )}
          </div>
          {images.length > 1 && (
            <div style={styles.thumbRow}>
              {images.map((img, idx) => (
                <button key={idx} onClick={() => setActiveImg(idx)} style={{ ...styles.thumbBtn, ...(idx === activeImg ? styles.thumbActive : {}) }}>
                  {img ? <img src={`${SERVER_ORIGIN}${img.url}`} alt="" style={styles.thumbImg} /> : <div style={styles.thumbImg} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={styles.info}>
          <h1 style={styles.title}>{listing.title}</h1>
          <div style={styles.priceRow}>
            <span style={styles.price}>{listing.price.toLocaleString()} {listing.currency}</span>
            {listing.negotiable && <span style={styles.negotiable}>{t('negotiable')}</span>}
          </div>

          <div style={styles.tags}>
            <span style={styles.tag}>{conditionLabel}</span>
            <span style={styles.tag}>{listing.city}</span>
            <span style={styles.tag}>{listing.viewCount} {t('views')}</span>
          </div>

          <h3 style={styles.sectionHeading}>{t('adDescription')}</h3>
          <p style={styles.description}>{listing.description}</p>

          <div style={styles.sellerCard}>
            <div>
              <div style={styles.sellerLabel}>{t('seller')}</div>
              <div style={styles.sellerName}>{listing.seller.name}</div>
              <div style={styles.sellerCity}>{listing.seller.city}</div>
            </div>
            {listing.sellerId !== user?.id && (
              <button style={styles.contactButton} onClick={contactSeller}>{t('contactSeller')}</button>
            )}
          </div>

          <p style={styles.codNote}>💵 {t('cashOnDelivery')}</p>
          <button style={styles.reportLink} onClick={reportListing}>⚑ {t('reportListing')}</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 1000, margin: '0 auto', padding: '28px 24px 60px' },
  grid: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 36 },
  mainImageWrap: { aspectRatio: '4/3', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: '#EFE9DC' },
  mainImage: { width: '100%', height: '100%', objectFit: 'cover' },
  noImage: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 },
  thumbRow: { display: 'flex', gap: 8, marginTop: 10 },
  thumbBtn: { width: 60, height: 60, borderRadius: 8, overflow: 'hidden', border: '2px solid transparent', padding: 0, background: '#EFE9DC' },
  thumbActive: { borderColor: 'var(--color-primary)' },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  info: {},
  title: { fontSize: 24, fontWeight: 800, marginBottom: 10 },
  priceRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 },
  price: { fontFamily: 'var(--font-number)', fontSize: 26, fontWeight: 700, color: 'var(--color-primary-dark)' },
  negotiable: { background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '3px 10px', fontSize: 12.5 },
  tags: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 },
  tag: { background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '4px 12px', fontSize: 12.5, color: 'var(--color-ink-muted)' },
  sectionHeading: { fontSize: 16, fontWeight: 700, marginBottom: 8 },
  description: { fontSize: 14.5, lineHeight: 1.8, color: 'var(--color-ink)', marginBottom: 24 },
  sellerCard: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 16,
  },
  sellerLabel: { fontSize: 11, color: 'var(--color-ink-muted)' },
  sellerName: { fontSize: 15, fontWeight: 700 },
  sellerCity: { fontSize: 12.5, color: 'var(--color-ink-muted)' },
  contactButton: { background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 13.5 },
  codNote: { marginTop: 18, fontSize: 13, color: 'var(--color-ink-muted)', textAlign: 'center' },
  reportLink: { display: 'block', margin: '16px auto 0', background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: 13 },
  loadingText: { textAlign: 'center', color: 'var(--color-ink-muted)', padding: '60px 0' },
};
