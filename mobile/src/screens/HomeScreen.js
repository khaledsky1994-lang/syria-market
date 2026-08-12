import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Image,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import api, { BASE_URL } from '../api/client';
import colors from '../theme/colors';

export default function HomeScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  const loadData = useCallback(async (categoryId = null) => {
    try {
      const [catRes, listRes] = await Promise.all([
        api.get('/categories'),
        api.get('/listings', { params: categoryId ? { categoryId } : {} }),
      ]);
      setCategories(catRes.data.categories);
      setListings(listRes.data.listings);
    } catch (e) {
      // network error - backend may not be reachable
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(activeCategory); }, [activeCategory]));

  const onRefresh = () => { setRefreshing(true); loadData(activeCategory); };

  const renderListing = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ListingDetail', { id: item.id })}>
      {item.images?.[0] ? (
        <Image source={{ uri: `${BASE_URL.replace('/api', '')}${item.images[0].url}` }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.noImage]}><Text>📷</Text></View>
      )}
      <Text numberOfLines={1} style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardPrice}>{item.price.toLocaleString()} {item.currency}</Text>
      <Text style={styles.cardCity}>{item.city}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(c) => String(c.id)}
        style={styles.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.categoryChip, activeCategory === item.id && styles.categoryChipActive]}
            onPress={() => setActiveCategory(activeCategory === item.id ? null : item.id)}
          >
            <Text>{item.icon} </Text>
            <Text style={[styles.categoryText, activeCategory === item.id && styles.categoryTextActive]}>
              {i18n.language === 'ar' ? item.nameAr : item.nameEn}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(l) => String(l.id)}
          numColumns={2}
          contentContainerStyle={styles.grid}
          renderItem={renderListing}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.empty}>{t('noResults')}</Text>}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateListing')}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  categoryList: { flexGrow: 0, paddingVertical: 12, paddingHorizontal: 8 },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 14,
    paddingVertical: 8, marginHorizontal: 4,
  },
  categoryChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryText: { color: colors.text, fontSize: 13 },
  categoryTextActive: { color: '#fff' },
  grid: { padding: 8 },
  card: {
    flex: 1, backgroundColor: colors.card, borderRadius: 12, margin: 6, padding: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  cardImage: { width: '100%', height: 120, borderRadius: 8, marginBottom: 6, backgroundColor: '#eee' },
  noImage: { alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  cardPrice: { fontSize: 14, fontWeight: 'bold', color: colors.primary, marginTop: 2 },
  cardCity: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 60, color: colors.textMuted },
  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', elevation: 4,
  },
  fabText: { fontSize: 28, color: '#fff', marginTop: -2 },
});
