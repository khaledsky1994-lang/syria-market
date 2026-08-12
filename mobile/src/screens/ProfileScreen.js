import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api, { BASE_URL } from '../api/client';
import colors from '../theme/colors';

export default function ProfileScreen({ navigation }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [myListings, setMyListings] = useState([]);

  useFocusEffect(
    useCallback(() => {
      if (user) api.get('/listings/user/me').then(({ data }) => setMyListings(data.listings));
    }, [user])
  );

  if (!user) {
    return (
      <View style={styles.center}>
        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginButtonText}>{t('login')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        {user.role === 'ADMIN' && (
          <TouchableOpacity style={styles.adminButton} onPress={() => navigation.navigate('Admin')}>
            <Text style={styles.adminButtonText}>{t('adminDashboard')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.langRow}>
        <Text style={styles.sectionTitle}>{t('language')}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={[styles.langChip, language === 'ar' && styles.langChipActive]}
            onPress={() => setLanguage('ar')}
          >
            <Text style={[styles.langText, language === 'ar' && styles.langTextActive]}>العربية</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langChip, language === 'en' && styles.langChipActive]}
            onPress={() => setLanguage('en')}
          >
            <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>English</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>{t('myListings')} ({myListings.length})</Text>
      <FlatList
        data={myListings}
        keyExtractor={(l) => String(l.id)}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.listingRow} onPress={() => navigation.navigate('ListingDetail', { id: item.id })}>
            {item.images?.[0] ? (
              <Image source={{ uri: `${BASE_URL.replace('/api', '')}${item.images[0].url}` }} style={styles.listingImage} />
            ) : (
              <View style={[styles.listingImage, { backgroundColor: '#eee' }]} />
            )}
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={styles.listingTitle}>{item.title}</Text>
              <Text style={styles.listingPrice}>{item.price.toLocaleString()} {item.currency}</Text>
              <Text style={styles.listingStatus}>{item.status === 'SOLD' ? t('sold') : item.status}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>{t('logout')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  loginButton: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 14 },
  loginButtonText: { color: '#fff', fontWeight: '600' },
  header: { padding: 20, alignItems: 'center', backgroundColor: colors.card, borderBottomWidth: 1, borderColor: colors.border },
  name: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  email: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  adminButton: { marginTop: 12, backgroundColor: colors.accent, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  adminButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  langRow: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  langChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6 },
  langChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  langText: { color: colors.text, fontSize: 13 },
  langTextActive: { color: '#fff' },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: colors.text, paddingHorizontal: 16, marginTop: 8, marginBottom: 8 },
  listingRow: { flexDirection: 'row', padding: 12, marginHorizontal: 12, marginBottom: 8, backgroundColor: colors.card, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  listingImage: { width: 56, height: 56, borderRadius: 8, marginEnd: 12 },
  listingTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  listingPrice: { fontSize: 13, color: colors.primary, marginTop: 2 },
  listingStatus: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  logoutButton: { margin: 20, backgroundColor: colors.danger, borderRadius: 10, padding: 14, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: '600' },
});
