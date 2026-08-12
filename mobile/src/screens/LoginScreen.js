import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier || !password) return;
    setLoading(true);
    try {
      await login(identifier, password);
    } catch (e) {
      Alert.alert('', e?.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>{t('appName')}</Text>
      <Text style={styles.subtitle}>{t('welcome')}</Text>

      <TextInput
        style={styles.input}
        placeholder={`${t('email')} / ${t('phone')}`}
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder={t('password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? t('loading') : t('loginButton')}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>{t('noAccount')}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.background },
  title: { fontSize: 32, fontWeight: 'bold', color: colors.primary, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 16, color: colors.textMuted, textAlign: 'center', marginBottom: 32 },
  input: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 16, textAlign: 'right',
  },
  button: { backgroundColor: colors.primary, borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: colors.primary, textAlign: 'center', marginTop: 20, fontSize: 14 },
});
