import React, { useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import api, { BASE_URL } from '../api/client';
import colors from '../theme/colors';

export default function SearchScreen({ navigation }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await api.get('/listings', {
        params: {
          q: query || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          sort,
        },
      });
      setResults(data.listings);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder={t('searchPlaceholder')}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={search}
        returnKeyType="search"
      />

      <View style={styles.filterRow}>
        <TextInput
          style={styles.filterInput}
          placeholder={t('minPrice')}
          keyboardType="numeric"
          value={minPrice}
          onChangeText={setMinPrice}
        />
        <TextInput
          style={styles.filterInput}
          placeholder={t('maxPrice')}
          keyboardType="numeric"
          value={maxPrice}
          onChangeText={setMaxPrice}
        />
      </View>

      <View style={styles.sortRow}>
        {[
          { key: 'newest', label: t('sortNewest') },
          { key: 'price_asc', label: t('sortPriceAsc') },
          { key: 'price_desc', label: t('sortPriceDesc') },
        ].map((s) => (
          <TouchableOpacity
            key={s.key}
            style={[styles.sortChip, sort === s.key && styles.sortChipActive]}
            onPress={() => setSort(s.key)}
          >
            <Text style={[styles.sortText, sort === s.key && styles.sortTextActive]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.applyButton} onPress={search}>
        <Text style={styles.applyText}>{t('apply')}</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />}

      {!loading && searched && (
        <FlatList
          data={results}
          keyExtractor={(l) => String(l.id)}
          style={{ marginTop: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultRow}
              onPress={() => navigation.navigate('ListingDetail', { id: item.id })}
            >
              {item.images?.[0] ? (
                <Image source={{ uri: `${BASE_URL.replace('/api', '')}${item.images[0].url}` }} style={styles.resultImage} />
              ) : (
                <View style={[styles.resultImage, styles.noImage]} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.resultPrice}>{item.price.toLocaleString()} {item.currency}</Text>
                <Text style={styles.resultCity}>{item.city}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>{t('noResults')}</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 12 },
  searchInput: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, padding: 12, fontSize: 16, textAlign: 'right',
  },
  filterRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  filterInput: {
    flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, padding: 10, textAlign: 'right',
  },
  sortRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  sortChip: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 12,
    paddingVertical: 6, backgroundColor: colors.card,
  },
  sortChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  sortText: { fontSize: 12, color: colors.text },
  sortTextActive: { color: '#fff' },
  applyButton: { backgroundColor: colors.primary, borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 12 },
  applyText: { color: '#fff', fontWeight: '600' },
  resultRow: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 10, padding: 8, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  resultImage: { width: 70, height: 70, borderRadius: 8, marginEnd: 10, backgroundColor: '#eee' },
  noImage: {},
  resultTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  resultPrice: { fontSize: 14, color: colors.primary, fontWeight: 'bold', marginTop: 2 },
  resultCity: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 40, color: colors.textMuted },
});
