import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  Image, Alert, Switch,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import colors from '../theme/colors';

const CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'FOR_PARTS'];

export default function CreateListingScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', price: '', city: '', categoryId: null,
    condition: 'GOOD', negotiable: true, currency: 'SYP',
  });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories));
  }, []);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsMultipleSelection: true });
    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets].slice(0, 8));
    }
  };

  const submit = async () => {
    if (!form.title || !form.description || !form.price || !form.categoryId || !form.city) {
      Alert.alert('', 'Please fill all required fields / يرجى تعبئة كل الحقول');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, String(v)));
      images.forEach((img, idx) => {
        formData.append('images', {
          uri: img.uri,
          name: `image_${idx}.jpg`,
          type: 'image/jpeg',
        });
      });

      await api.post('/listings', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      Alert.alert('', '✓');
      navigation.goBack();
    } catch (e) {
      Alert.alert('', e?.response?.data?.error || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.label}>{t('adTitle')}</Text>
      <TextInput style={styles.input} value={form.title} onChangeText={(v) => update('title', v)} />

      <Text style={styles.label}>{t('adDescription')}</Text>
      <TextInput
        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
        value={form.description}
        onChangeText={(v) => update('description', v)}
        multiline
      />

      <Text style={styles.label}>{t('price')} (SYP)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={form.price} onChangeText={(v) => update('price', v)} />

      <Text style={styles.label}>{t('city')}</Text>
      <TextInput style={styles.input} value={form.city} onChangeText={(v) => update('city', v)} />

      <Text style={styles.label}>{t('selectCategory')}</Text>
      <View style={styles.chipRow}>
        {categories.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.chip, form.categoryId === c.id && styles.chipActive]}
            onPress={() => update('categoryId', c.id)}
          >
            <Text style={[styles.chipText, form.categoryId === c.id && styles.chipTextActive]}>
              {c.icon} {i18n.language === 'ar' ? c.nameAr : c.nameEn}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>{t('condition')}</Text>
      <View style={styles.chipRow}>
        {CONDITIONS.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.chip, form.condition === c && styles.chipActive]}
            onPress={() => update('condition', c)}
          >
            <Text style={[styles.chipText, form.condition === c && styles.chipTextActive]}>
              {t(`condition${c.charAt(0) + c.slice(1).toLowerCase().replace(/_./g, (m) => m[1].toUpperCase())}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.label}>{t('negotiable')}</Text>
        <Switch value={form.negotiable} onValueChange={(v) => update('negotiable', v)} />
      </View>

      <Text style={styles.label}>{t('selectImages')}</Text>
      <View style={styles.chipRow}>
        {images.map((img, idx) => (
          <Image key={idx} source={{ uri: img.uri }} style={styles.thumb} />
        ))}
        <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
          <Text style={{ fontSize: 24, color: colors.primary }}>＋</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={submit} disabled={submitting}>
        <Text style={styles.submitText}>{submitting ? t('loading') : t('publish')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: 16, marginBottom: 6, textAlign: 'right' },
  input: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, padding: 12, fontSize: 15, textAlign: 'right',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: colors.card, marginBottom: 4 },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, color: colors.text },
  chipTextActive: { color: '#fff' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  thumb: { width: 60, height: 60, borderRadius: 8 },
  addImageButton: {
    width: 60, height: 60, borderRadius: 8, borderWidth: 1, borderColor: colors.border,
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card,
  },
  submitButton: { backgroundColor: colors.primary, borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 28, marginBottom: 40 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
