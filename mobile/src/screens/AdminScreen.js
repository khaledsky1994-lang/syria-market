import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import colors from '../theme/colors';

export default function AdminScreen() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);

  const load = () => {
    api.get('/admin/stats').then(({ data }) => setStats(data));
    api.get('/admin/users').then(({ data }) => setUsers(data.users));
  };

  useEffect(() => { load(); }, []);

  const toggleBan = async (id) => {
    await api.put(`/admin/users/${id}/ban`);
    load();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{t('adminDashboard')}</Text>

      {stats && (
        <View style={styles.statsGrid}>
          <StatCard label={t('totalUsers')} value={stats.userCount} />
          <StatCard label={t('totalListings')} value={stats.listingCount} />
          <StatCard label={t('activeListings')} value={stats.activeListings} />
          <StatCard label={t('pendingReports')} value={stats.reportCount} />
        </View>
      )}

      <Text style={styles.sectionTitle}>Users</Text>
      <FlatList
        data={users}
        keyExtractor={(u) => String(u.id)}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.userRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{item.name} {item.role === 'ADMIN' ? '👑' : ''}</Text>
              <Text style={styles.userMeta}>{item.email} · {item.phone}</Text>
            </View>
            <TouchableOpacity
              style={[styles.banButton, item.isBanned && styles.unbanButton]}
              onPress={() => toggleBan(item.id)}
            >
              <Text style={styles.banButtonText}>{item.isBanned ? t('unbanUser') : t('banUser')}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </ScrollView>
  );
}

function StatCard({ label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { fontSize: 22, fontWeight: 'bold', color: colors.text, padding: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  statCard: { width: '48%', backgroundColor: colors.card, borderRadius: 12, padding: 16, margin: '1%', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statValue: { fontSize: 24, fontWeight: 'bold', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text, padding: 16, paddingBottom: 8 },
  userRow: { flexDirection: 'row', alignItems: 'center', padding: 12, marginHorizontal: 12, marginBottom: 8, backgroundColor: colors.card, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  userName: { fontSize: 14, fontWeight: '600', color: colors.text },
  userMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  banButton: { backgroundColor: colors.danger, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  unbanButton: { backgroundColor: colors.success },
  banButtonText: { color: '#fff', fontSize: 11, fontWeight: '600' },
});
