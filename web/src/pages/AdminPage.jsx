import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AdminPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);

  const load = () => {
    api.get('/admin/stats').then(({ data }) => setStats(data));
    api.get('/admin/users').then(({ data }) => setUsers(data.users));
  };

  useEffect(() => {
    if (!user) return navigate('/login');
    if (user.role !== 'ADMIN') return navigate('/');
    load();
  }, [user]); // eslint-disable-line

  const toggleBan = async (id) => {
    await api.put(`/admin/users/${id}/ban`);
    load();
  };

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{t('adminDashboard')}</h1>

      {stats && (
        <div style={styles.statsGrid}>
          <StatCard label={t('totalUsers')} value={stats.userCount} />
          <StatCard label={t('totalListings')} value={stats.listingCount} />
          <StatCard label={t('activeListings')} value={stats.activeListings} />
          <StatCard label={t('pendingReports')} value={stats.reportCount} />
        </div>
      )}

      <h2 style={styles.sectionTitle}>Users</h2>
      <div style={styles.userTable}>
        {users.map((u) => (
          <div key={u.id} style={styles.userRow}>
            <div>
              <div style={styles.userName}>{u.name} {u.role === 'ADMIN' ? '👑' : ''}</div>
              <div style={styles.userMeta}>{u.email} · {u.phone}</div>
            </div>
            <button
              onClick={() => toggleBan(u.id)}
              style={{ ...styles.banButton, ...(u.isBanned ? styles.unbanButton : {}) }}
            >
              {u.isBanned ? t('unbanUser') : t('banUser')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 1000, margin: '0 auto', padding: '28px 24px 60px' },
  title: { fontSize: 24, fontWeight: 800, marginBottom: 20 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 32 },
  statCard: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 18, textAlign: 'center' },
  statValue: { fontFamily: 'var(--font-number)', fontSize: 28, fontWeight: 700, color: 'var(--color-primary)' },
  statLabel: { fontSize: 12.5, color: 'var(--color-ink-muted)', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 700, marginBottom: 12 },
  userTable: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' },
  userRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottom: '1px solid var(--color-border)' },
  userName: { fontWeight: 700, fontSize: 14 },
  userMeta: { fontSize: 12.5, color: 'var(--color-ink-muted)', marginTop: 2 },
  banButton: { background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700 },
  unbanButton: { background: 'var(--color-success)' },
};
