import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { createSocket } from '../services/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // Keep latest path in a ref so the socket listener never goes stale
  const pathRef = useRef(location.pathname);
  useEffect(() => {
    pathRef.current = location.pathname;
  }, [location.pathname]);

  const refreshUnread = useCallback(async () => {
    try {
      const { data } = await api.get('/chat/unread-count');
      setUnreadTotal(data.total);
    } catch (_) {
      /* non-critical */
    }
  }, []);

  useEffect(() => {
    if (!token || !user) {
      setSocket(null);
      setOnlineUsers([]);
      setUnreadTotal(0);
      return undefined;
    }

    const s = createSocket(token);
    setSocket(s);
    refreshUnread();

    s.on('onlineUsers', setOnlineUsers);
    s.on('connect_error', (err) => {
      if (/token|Authentication/i.test(err.message)) toast.error('Chat connection failed: ' + err.message);
    });

    // Badge refresh + toast for messages arriving while that thread isn't open
    s.on('conversationUpdated', (c) => {
      refreshUnread();
      const myUnread = user.role === 'agent' ? c.unreadAgent : c.unreadBuyer;
      const fromOther = c.lastMessage?.sender && c.lastMessage.sender !== user._id;
      const viewing = pathRef.current.includes(c._id);
      if (myUnread > 0 && fromOther && !viewing) {
        toast(c.lastMessage.text || 'Sent you a photo', {
          icon: '💬',
          duration: 4000,
          id: `msg-${c._id}`,
        });
      }
    });

    return () => {
      s.off();
      s.disconnect();
    };
  }, [token, user?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const isOnline = useCallback((userId) => onlineUsers.includes(userId), [onlineUsers]);

  const value = useMemo(
    () => ({ socket, onlineUsers, isOnline, unreadTotal, refreshUnread, navigate }),
    [socket, onlineUsers, isOnline, unreadTotal, refreshUnread, navigate]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside <SocketProvider>');
  return ctx;
};
