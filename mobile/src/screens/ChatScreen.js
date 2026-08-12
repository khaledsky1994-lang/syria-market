import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { io } from 'socket.io-client';
import api, { BASE_URL } from '../api/client';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';

export default function ChatScreen({ route, navigation }) {
  const { conversationId, listingTitle } = route.params;
  const { t } = useTranslation();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const socketRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({ title: listingTitle });

    api.get(`/conversations/${conversationId}/messages`).then(({ data }) => setMessages(data.messages));

    const socket = io(BASE_URL.replace('/api', ''));
    socketRef.current = socket;
    socket.emit('join_conversation', conversationId);
    socket.on('new_message', (msg) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.emit('leave_conversation', conversationId);
      socket.disconnect();
    };
  }, [conversationId]);

  const send = async () => {
    if (!text.trim()) return;
    const body = text.trim();
    setText('');
    try {
      const { data } = await api.post(`/conversations/${conversationId}/messages`, { body });
      setMessages((prev) => [...prev, data.message]);
    } catch (e) { /* ignore */ }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => String(m.id)}
        contentContainerStyle={{ padding: 12 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.senderId === user.id ? styles.myBubble : styles.theirBubble]}>
            <Text style={item.senderId === user.id ? styles.myText : styles.theirText}>{item.body}</Text>
          </View>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={t('typeMessage')}
          onSubmitEditing={send}
        />
        <TouchableOpacity style={styles.sendButton} onPress={send}>
          <Text style={styles.sendText}>{t('sendMessage')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  bubble: { maxWidth: '75%', padding: 10, borderRadius: 12, marginBottom: 8 },
  myBubble: { backgroundColor: colors.primary, alignSelf: 'flex-end' },
  theirBubble: { backgroundColor: colors.card, alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.border },
  myText: { color: '#fff' },
  theirText: { color: colors.text },
  inputRow: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  input: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, textAlign: 'right' },
  sendButton: { justifyContent: 'center', paddingHorizontal: 14 },
  sendText: { color: colors.primary, fontWeight: '600' },
});
