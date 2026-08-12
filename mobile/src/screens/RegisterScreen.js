import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';

export default function RegisterScreen({ navigation }) {
  const { t } = useTranslation();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', city: '' });
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleRegister = async () => {
    setLoading(true);
    try {
      await register(form);
    } catch (e) {
      const msg = e?.response?.data?.errors?.[0]?.msg || e?.response?.data?.error || 'Registration failed';
      Alert.alert('', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('register')}</Text>

      {['name', 'email', 'phone', 'city', 'password'].map((field) => (
        <TextInput
          key={field}
          style={styles.input}
          placeholder={t(field)}
          value={form[field]}
          onChangeText={(v) => update(field, v)}
          secureTextEntry={field === 'password'}
          autoCapitalize="none"
        />
      ))}

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? t('loading') : t('registerButton')}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>{t('haveAccount')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.background },
  title: { fontSize: 26, fontWeight: 'bold', color: colors.primary, textAlign: 'center', marginBottom: 24 },
  input: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 16, textAlign: 'right',
  },
  button: { backgroundColor: colors.primary, borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: colors.primary, textAlign: 'center', marginTop: 20, fontSize: 14 },
});
