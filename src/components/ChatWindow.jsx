import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errorMessage, fileUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { formatDayLabel, formatPrice } from '../utils/format';
import Avatar from './Avatar';
import ChatBubble from './ChatBubble';
import Spinner from './Spinner';
import TypingIndicator from './TypingIndicator';

const TYPING_TIMEOUT = 1500;

export default function ChatWindow({ conversationId, onBack }) {
  const { user } = useAuth();
  const { socket, isOnline } = useSocket();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [pendingImage, setPendingImage] = useState(null); // { url, preview }
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingName, setTypingName] = useState('');
  const [lightbox, setLightbox] = useState('');

  const bottomRef = useRef(null);
  const typingTimer = useRef(null);
  const isTyping = useRef(false);
  const fileInput = useRef(null);

  const other = conversation ? (user.role === 'agent' ? conversation.buyer : conversation.agent) : null;

  // ---- Load history ----
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMessages([]);
    setConversation(null);
    setTypingName('');
    setText('');
    setPendingImage(null);

    (async () => {
      try {
        const { data } = await api.get(`/chat/conversations/${conversationId}/messages`);
        if (cancelled) return;
        setConversation(data.conversation);
        setMessages(data.messages);
      } catch (err) {
        if (!cancelled) toast.error(errorMessage(err, 'Could not load conversation'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  const markRead = useCallback(() => {
    socket?.emit('markRead', { conversationId });
  }, [socket, conversationId]);

  // ---- Socket wiring ----
  useEffect(() => {
    if (!socket) return undefined;

    const join = () => socket.emit('joinRoom', conversationId, (res) => {
      if (res && !res.ok) toast.error(res.message);
    });
    join();
    // re-join after reconnects
    socket.on('connect', join);

    const onNew = (msg) => {
      if (msg.conversation !== conversationId) return;
      setMessages((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]));
      if (msg.sender !== user._id) {
        setTypingName('');
        markRead();
      }
    };
    const onTyping = (e) => {
      if (e.conversationId === conversationId && e.userId !== user._id) setTypingName(e.name);
    };
    const onStopTyping = (e) => {
      if (e.conversationId === conversationId) setTypingName('');
    };
    const onRead = (e) => {
      if (e.conversationId !== conversationId || e.readerId === user._id) return;
      setMessages((prev) => prev.map((m) => (m.sender === user._id ? { ...m, read: true } : m)));
    };

    socket.on('newMessage', onNew);
    socket.on('typing', onTyping);
    socket.on('stopTyping', onStopTyping);
    socket.on('messagesRead', onRead);

    return () => {
      socket.emit('leaveRoom', conversationId);
      socket.off('connect', join);
      socket.off('newMessage', onNew);
      socket.off('typing', onTyping);
      socket.off('stopTyping', onStopTyping);
      socket.off('messagesRead', onRead);
    };
  }, [socket, conversationId, user._id, markRead]);

  // Mark everything read once history is loaded
  useEffect(() => {
    if (!loading && conversation) markRead();
  }, [loading, conversation, markRead]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, typingName]);

  // Stop typing when leaving
  useEffect(
    () => () => {
      clearTimeout(typingTimer.current);
      if (isTyping.current) socket?.emit('stopTyping', { conversationId });
      isTyping.current = false;
    },
    [socket, conversationId]
  );

  // ---- Typing indicator emit ----
  const handleChange = (e) => {
    setText(e.target.value);
    if (!socket) return;
    if (!isTyping.current) {
      isTyping.current = true;
      socket.emit('typing', { conversationId });
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      isTyping.current = false;
      socket.emit('stopTyping', { conversationId });
    }, TYPING_TIMEOUT);
  };

  // ---- Image selection / upload ----
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image');
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be 5MB or smaller');

    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const { data } = await api.post('/chat/upload', form);
      setPendingImage({ url: data.url, preview: URL.createObjectURL(file) });
    } catch (err) {
      toast.error(errorMessage(err, 'Upload failed'));
    } finally {
      setUploading(false);
    }
  };

  // ---- Send ----
  const handleSend = (e) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if ((!trimmed && !pendingImage) || sending || !socket) return;

    setSending(true);
    socket.emit(
      'sendMessage',
      { conversationId, text: trimmed, image: pendingImage?.url || '' },
      (res) => {
        setSending(false);
        if (!res?.ok) return toast.error(res?.message || 'Message failed to send');
        // The server also broadcasts newMessage; dedupe by _id handles both paths.
        setMessages((prev) => (prev.some((m) => m._id === res.message._id) ? prev : [...prev, res.message]));
        setText('');
        setPendingImage(null);
        clearTimeout(typingTimer.current);
        if (isTyping.current) {
          isTyping.current = false;
          socket.emit('stopTyping', { conversationId });
        }
      }
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSend(e);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-surface">
        <Spinner />
      </div>
    );
  }
  if (!conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-surface p-6 text-center">
        <p className="text-sm text-neutral-500">This conversation could not be loaded.</p>
        {onBack && (
          <button onClick={onBack} className="btn-secondary md:hidden">
            Back
          </button>
        )}
      </div>
    );
  }

  const property = conversation.property;
  const online = isOnline(other?._id);
  let lastDay = '';

  return (
    <div className="flex h-full flex-col bg-surface">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-line bg-white px-3 py-3 sm:px-5">
        {onBack && (
          <button onClick={onBack} aria-label="Back to conversations" className="rounded-xl p-2 hover:bg-surface md:hidden">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <Avatar name={other?.name} online={online} showDot />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{other?.name}</p>
          <p className="text-xs text-neutral-500">{typingName ? 'typing…' : online ? 'Online' : 'Offline'}</p>
        </div>
      </div>

      {/* Property preview */}
      {property && (
        <Link
          to={`/properties/${property._id}`}
          className="flex items-center gap-3 border-b border-line bg-white px-3 py-2.5 transition-colors hover:bg-surface sm:px-5"
        >
          {property.images?.[0] ? (
            <img src={fileUrl(property.images[0])} alt="" className="h-12 w-16 shrink-0 rounded-xl object-cover" />
          ) : (
            <div className="h-12 w-16 shrink-0 rounded-xl bg-surface" />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{property.title}</p>
            <p className="truncate text-xs text-neutral-500">
              {formatPrice(property.price)} · {property.location}
            </p>
          </div>
        </Link>
      )}

      {/* Messages */}
      <div className="scroll-thin min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-4 sm:px-5">
        {messages.length === 0 && (
          <p className="py-10 text-center text-sm text-neutral-500">
            No messages yet. Say hello and ask about this property.
          </p>
        )}
        {messages.map((m) => {
          const day = new Date(m.createdAt).toDateString();
          const showDay = day !== lastDay;
          lastDay = day;
          return (
            <div key={m._id}>
              {showDay && (
                <div className="my-3 text-center">
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-neutral-500 border border-line">
                    {formatDayLabel(m.createdAt)}
                  </span>
                </div>
              )}
              <ChatBubble message={m} own={m.sender === user._id} onImageClick={setLightbox} />
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {typingName && <TypingIndicator name={typingName} />}

      {/* Composer */}
      <form onSubmit={handleSend} className="border-t border-line bg-white p-3 sm:p-4">
        {pendingImage && (
          <div className="mb-3 flex items-center gap-3">
            <div className="relative">
              <img src={pendingImage.preview} alt="To send" className="h-20 w-20 rounded-xl border border-line object-cover" />
              <button
                type="button"
                onClick={() => setPendingImage(null)}
                aria-label="Remove image"
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-sm text-white"
              >
                ×
              </button>
            </div>
            <span className="text-xs text-neutral-500">Photo ready to send</span>
          </div>
        )}
        <div className="flex items-end gap-2">
          <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            aria-label="Attach photo"
            className="btn-secondary !px-3"
          >
            {uploading ? (
              <Spinner className="h-5 w-5" />
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16l4-4 4 4 4-6 4 6M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z"
                />
              </svg>
            )}
          </button>
          <textarea
            rows={1}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={2000}
            placeholder="Type a message…"
            className="input max-h-32 min-h-[2.75rem] flex-1 resize-none"
          />
          <button type="submit" disabled={sending || uploading || (!text.trim() && !pendingImage)} className="btn-primary">
            Send
          </button>
        </div>
      </form>

      {/* Image lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4"
          onClick={() => setLightbox('')}
          role="dialog"
        >
          <img src={lightbox} alt="Full size" className="max-h-full max-w-full rounded-2xl" />
        </div>
      )}
    </div>
  );
}
