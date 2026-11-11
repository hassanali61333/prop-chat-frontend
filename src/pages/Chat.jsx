import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await api.get('/chat/conversations');
      setConversations(data.conversations);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not load conversations'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Keep the sidebar in sync with live updates
  useEffect(() => {
    if (!socket) return undefined;

    const onUpdated = (c) => {
      let known = false;
      setConversations((prev) => {
        const next = prev.map((item) => {
          if (item._id !== c._id) return item;
          known = true;
          return { ...item, ...c };
        });
        // Most recently active thread first
        return next.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
      // A brand-new thread (e.g. a buyer just messaged the agent): reload with populated data
      setTimeout(() => {
        if (!known) fetchConversations();
      }, 0);
    };

    socket.on('conversationUpdated', onUpdated);
    return () => socket.off('conversationUpdated', onUpdated);
  }, [socket, fetchConversations]);

  return (
    <div className="mx-auto flex h-full max-w-7xl md:p-4">
      <div className="flex h-full w-full overflow-hidden bg-white md:rounded-2xl md:border md:border-line md:shadow-card">
        {/* Sidebar: hidden on mobile while a thread is open */}
        <div
          className={`h-full w-full shrink-0 border-r border-line md:block md:w-80 lg:w-96 ${
            conversationId ? 'hidden' : 'block'
          }`}
        >
          <ConversationList
            conversations={conversations}
            activeId={conversationId}
            loading={loading}
            query={query}
            onQuery={setQuery}
            onSelect={(id) => navigate(`/chat/${id}`)}
          />
        </div>

        {/* Thread */}
        <div className={`h-full min-w-0 flex-1 md:block ${conversationId ? 'block' : 'hidden'}`}>
          {conversationId ? (
            <ChatWindow key={conversationId} conversationId={conversationId} onBack={() => navigate('/chat')} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 bg-surface p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-card">
                💬
              </div>
              <p className="text-lg font-semibold text-ink">Select a conversation</p>
              <p className="max-w-xs text-sm text-neutral-500">
                {user.role === 'buyer'
                  ? 'Pick a thread, or open a property and tap "Chat with Agent" to start one.'
                  : 'Pick a thread to reply to buyers asking about your listings.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
