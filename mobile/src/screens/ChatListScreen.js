import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import api, { BASE_URL } from '../api/client';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';

export default function ChatListScreen({ navigation }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      api.get('/conversations').then(({ data }) => setConversations(data.conversations));
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
    <FlatList
      style={styles.container}
      data={conversations}
      keyExtractor={(c) => String(c.id)}
      ListEmptyComponent={<Text style={styles.empty}>{t('noResults')}</Text>}
      renderItem={({ item }) => {
        const otherUser = item.buyerId === user.id ? item.seller : item.buyer;
        const lastMessage = item.messages[0];
        return (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('Chat', { conversationId: item.id, listingTitle: item.listing.title })}
          >
            {item.listing.images?.[0] ? (
              <Image source={{ uri: `${BASE_URL.replace('/api', '')}${item.listing.images[0].url}` }} style={styles.image} />
            ) : (
              <View style={[styles.image, styles.noImage]} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{otherUser.name}</Text>
              <Text style={styles.listingTitle} numberOfLines={1}>{item.listing.title}</Text>
              {lastMessage && <Text style={styles.lastMessage} numberOfLines={1}>{lastMessage.body}</Text>}
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  loginButton: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 14 },
  loginButtonText: { color: '#fff', fontWeight: '600' },
  row: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderColor: colors.border, alignItems: 'center' },
  image: { width: 54, height: 54, borderRadius: 8, marginEnd: 12, backgroundColor: '#eee' },
  noImage: {},
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  listingTitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  lastMessage: { fontSize: 13, color: colors.text, marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 60, color: colors.textMuted },
});
