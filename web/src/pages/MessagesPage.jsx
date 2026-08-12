import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { io } from 'socket.io-client';
import api, { SERVER_ORIGIN } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function MessagesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(params.get('conversation') ? Number(params.get('conversation')) : null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!user) return navigate('/login');
    api.get('/conversations').then(({ data }) => {
      setConversations(data.conversations);
      if (!activeId && data.conversations.length) setActiveId(data.conversations[0].id);
    });
  }, [user]); // eslint-disable-line

  const loadMessages = useCallback((id) => {
    api.get(`/conversations/${id}/messages`).then(({ data }) => setMessages(data.messages));
  }, []);

  useEffect(() => {
    if (!activeId) return;
    setParams({ conversation: activeId });
    loadMessages(activeId);

    const socket = io(SERVER_ORIGIN);
    socketRef.current = socket;
    socket.emit('join_conversation', activeId);
    socket.on('new_message', (msg) => {
      if (msg.conversationId === activeId) setMessages((prev) => [...prev, msg]);
    });
    return () => socket.disconnect();
  }, [activeId]); // eslint-disable-line

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const body = text.trim();
    setText('');
    const { data } = await api.post(`/conversations/${activeId}/messages`, { body });
    setMessages((prev) => [...prev, data.message]);
  };

  const activeConv = conversations.find((c) => c.id === activeId);

  return (
    <div style={styles.container}>
      <div style={styles.list}>
        {conversations.length === 0 && <p style={styles.empty}>{t('noResults')}</p>}
        {conversations.map((c) => {
          const other = c.buyerId === user?.id ? c.seller : c.buyer;
          return (
            <button key={c.id} onClick={() => setActiveId(c.id)} style={{ ...styles.convRow, ...(c.id === activeId ? styles.convActive : {}) }}>
              {c.listing.images?.[0] ? (
                <img src={`${SERVER_ORIGIN}${c.listing.images[0].url}`} alt="" style={styles.convImg} />
              ) : <div style={styles.convImg} />}
              <div style={{ textAlign: 'start', overflow: 'hidden' }}>
                <div style={styles.convName}>{other.name}</div>
                <div style={styles.convTitle}>{c.listing.title}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={styles.chatPanel}>
        {activeConv ? (
          <>
            <div style={styles.chatHeader}>{activeConv.listing.title}</div>
            <div style={styles.messages}>
              {messages.map((m) => (
                <div key={m.id} style={{ ...styles.bubble, ...(m.senderId === user.id ? styles.myBubble : styles.theirBubble) }}>
                  {m.body}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={send} style={styles.inputRow}>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t('typeMessage')} style={styles.textInput} />
              <button style={styles.sendButton}>{t('sendMessage')}</button>
            </form>
          </>
        ) : (
          <p style={styles.empty}>{t('noResults')}</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 1000, margin: '0 auto', padding: '28px 24px 48px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, minHeight: 500 },
  list: { background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden', height: 'fit-content' },
  convRow: { display: 'flex', gap: 10, alignItems: 'center', width: '100%', padding: 12, border: 'none', borderBottom: '1px solid var(--color-border)', background: 'transparent' },
  convActive: { background: 'var(--color-bg)' },
  convImg: { width: 44, height: 44, borderRadius: 8, objectFit: 'cover', background: '#EFE9DC', flexShrink: 0 },
  convName: { fontSize: 13.5, fontWeight: 700 },
  convTitle: { fontSize: 12, color: 'var(--color-ink-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  chatPanel: { background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' },
  chatHeader: { padding: 14, borderBottom: '1px solid var(--color-border)', fontWeight: 700, fontSize: 14.5 },
  messages: { flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420 },
  bubble: { maxWidth: '70%', padding: '9px 13px', borderRadius: 12, fontSize: 14 },
  myBubble: { alignSelf: 'flex-end', background: 'var(--color-primary)', color: 'white' },
  theirBubble: { alignSelf: 'flex-start', background: 'var(--color-bg)', border: '1px solid var(--color-border)' },
  inputRow: { display: 'flex', gap: 8, padding: 12, borderTop: '1px solid var(--color-border)' },
  textInput: { flex: 1, padding: '10px 14px', borderRadius: 20, border: '1px solid var(--color-border)', fontSize: 14 },
  sendButton: { background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 20, padding: '10px 18px', fontWeight: 700, fontSize: 13.5 },
  empty: { textAlign: 'center', color: 'var(--color-ink-muted)', padding: 40 },
};
