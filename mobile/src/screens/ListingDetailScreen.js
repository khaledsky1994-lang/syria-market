import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet,
  ActivityIndicator, Dimensions, Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import api, { BASE_URL } from '../api/client';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';

const { width } = Dimensions.get('window');

export default function ListingDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/listings/${id}`).then(({ data }) => setListing(data.listing)).finally(() => setLoading(false));
  }, [id]);

  const contactSeller = async () => {
    if (!user) return navigation.navigate('Login');
    try {
      const { data } = await api.post('/conversations', { listingId: id });
      navigation.navigate('Chat', { conversationId: data.conversation.id, listingTitle: listing.title });
    } catch (e) {
      Alert.alert('', e?.response?.data?.error || 'Error');
    }
  };

  const reportListing = async () => {
    if (!user) return navigation.navigate('Login');
    Alert.alert(t('reportListing'), '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: t('submit'),
        onPress: async () => {
          try {
            await api.post('/reports', { listingId: id, reason: 'Reported from mobile app' });
            Alert.alert('', '✓');
          } catch (e) { /* ignore */ }
        },
      },
    ]);
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 60 }} color={colors.primary} />;
  if (!listing) return <Text style={styles.empty}>{t('noResults')}</Text>;

  const conditionLabel = {
    NEW: t('conditionNew'), LIKE_NEW: t('conditionLikeNew'), GOOD: t('conditionGood'),
    FAIR: t('conditionFair'), FOR_PARTS: t('conditionForParts'),
  }[listing.condition];

  return (
    <ScrollView style={styles.container}>
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {(listing.images.length ? listing.images : [{ url: null }]).map((img, idx) => (
          img.url ? (
            <Image key={idx} source={{ uri: `${BASE_URL.replace('/api', '')}${img.url}` }} style={styles.image} />
          ) : (
            <View key={idx} style={[styles.image, styles.noImage]}><Text style={{ fontSize: 40 }}>📷</Text></View>
          )
        ))}
      </ScrollView>

      <View style={styles.content}>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.price}>{listing.price.toLocaleString()} {listing.currency}</Text>

        <View style={styles.tagsRow}>
          <View style={styles.tag}><Text style={styles.tagText}>{conditionLabel}</Text></View>
          <View style={styles.tag}><Text style={styles.tagText}>{listing.city}</Text></View>
          {listing.negotiable && <View style={styles.tag}><Text style={styles.tagText}>{t('negotiable')}</Text></View>}
        </View>

        <Text style={styles.sectionTitle}>{t('adDescription')}</Text>
        <Text style={styles.description}>{listing.description}</Text>

        <Text style={styles.meta}>{listing.viewCount} {t('views')}</Text>

        <View style={styles.sellerCard}>
          <View>
            <Text style={styles.sellerLabel}>{t('seller')}</Text>
            <Text style={styles.sellerName}>{listing.seller.name}</Text>
            <Text style={styles.sellerCity}>{listing.seller.city}</Text>
          </View>
          {listing.sellerId !== user?.id && (
            <TouchableOpacity style={styles.contactButton} onPress={contactSeller}>
              <Text style={styles.contactButtonText}>{t('contactSeller')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.codNote}>💵 {t('cashOnDelivery')}</Text>

        <TouchableOpacity onPress={reportListing}>
          <Text style={styles.reportLink}>⚑ {t('reportListing')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  image: { width, height: 280, backgroundColor: '#eee' },
  noImage: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  price: { fontSize: 22, fontWeight: 'bold', color: colors.primary, marginTop: 6 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  tag: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 12, color: colors.textMuted },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 20, marginBottom: 6, color: colors.text },
  description: { fontSize: 14, color: colors.text, lineHeight: 22 },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 10 },
  sellerCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: 12, padding: 14, marginTop: 20, borderWidth: 1, borderColor: colors.border,
  },
  sellerLabel: { fontSize: 11, color: colors.textMuted },
  sellerName: { fontSize: 15, fontWeight: '600', color: colors.text },
  sellerCity: { fontSize: 12, color: colors.textMuted },
  contactButton: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
  contactButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  codNote: { marginTop: 16, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  reportLink: { marginTop: 18, color: colors.danger, textAlign: 'center', fontSize: 13 },
  empty: { textAlign: 'center', marginTop: 60, color: colors.textMuted },
});
