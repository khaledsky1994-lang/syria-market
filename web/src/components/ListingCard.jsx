import React from 'react';
import { Link } from 'react-router-dom';
import { SERVER_ORIGIN } from '../api/client';

export default function ListingCard({ listing }) {
  return (
    <Link to={`/listing/${listing.id}`} style={styles.card}>
      <div style={styles.imageWrap}>
        {listing.images?.[0] ? (
          <img src={`${SERVER_ORIGIN}${listing.images[0].url}`} alt={listing.title} style={styles.image} />
        ) : (
          <div style={styles.noImage}>📷</div>
        )}
        <div style={styles.priceTag}>
          <span style={styles.priceNum}>{listing.price.toLocaleString()}</span>
          <span style={styles.priceCur}>{listing.currency}</span>
        </div>
      </div>
      <div style={styles.body}>
        <div style={styles.title}>{listing.title}</div>
        <div style={styles.meta}>{listing.city}</div>
      </div>
    </Link>
  );
}

const styles = {
  card: {
    background: 'var(--color-surface)', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)', overflow: 'hidden',
    boxShadow: 'var(--shadow-card)', display: 'block', color: 'var(--color-ink)',
  },
  imageWrap: { position: 'relative', aspectRatio: '4/3', background: '#EFE9DC' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  noImage: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 },
  priceTag: {
    position: 'absolute', bottom: 10, insetInlineStart: 10,
    background: 'var(--color-accent)', color: 'white', borderRadius: '4px 4px 4px 0',
    padding: '4px 10px', display: 'flex', alignItems: 'baseline', gap: 4,
    boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
  },
  priceNum: { fontFamily: 'var(--font-number)', fontWeight: 700, fontSize: 15 },
  priceCur: { fontSize: 11, fontWeight: 600, opacity: 0.9 },
  body: { padding: '12px 14px' },
  title: {
    fontWeight: 700, fontSize: 14.5, marginBottom: 4,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  meta: { fontSize: 12.5, color: 'var(--color-ink-muted)' },
};
