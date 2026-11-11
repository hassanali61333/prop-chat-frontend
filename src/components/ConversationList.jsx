import { fileUrl } from '../services/api';
import { formatListTime } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Avatar from './Avatar';
import Spinner from './Spinner';

/** Sidebar listing every conversation, with search + unread badges. */
export default function ConversationList({ conversations, activeId, loading, query, onQuery, onSelect }) {
  const { user } = useAuth();
  const { isOnline } = useSocket();

  const other = (c) => (user.role === 'agent' ? c.buyer : c.agent);
  const unread = (c) => (user.role === 'agent' ? c.unreadAgent : c.unreadBuyer);

  const q = query.trim().toLowerCase();
  const visible = q
    ? conversations.filter(
        (c) =>
          other(c)?.name?.toLowerCase().includes(q) ||
          c.property?.title?.toLowerCase().includes(q) ||
          c.lastMessage?.text?.toLowerCase().includes(q)
      )
    : conversations;

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-line p-4">
        <h2 className="mb-3 text-lg font-bold text-ink">Messages</h2>
        <input
          type="search"
          className="input"
          placeholder="Search conversations"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
        />
      </div>

      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : visible.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-neutral-500">
            {conversations.length === 0
              ? user.role === 'buyer'
                ? 'No conversations yet. Open a property and tap "Chat with Agent".'
                : 'No conversations yet. Buyers will appear here when they message you.'
              : 'No conversations match your search.'}
          </p>
        ) : (
          visible.map((c) => {
            const o = other(c);
            const count = unread(c);
            const active = c._id === activeId;
            const last = c.lastMessage;
            return (
              <button
                key={c._id}
                onClick={() => onSelect(c._id)}
                className={`flex w-full items-center gap-3 border-b border-line px-4 py-3.5 text-left transition-colors ${
                  active ? 'bg-surface' : 'hover:bg-surface/60'
                }`}
              >
                <Avatar name={o?.name} online={isOnline(o?._id)} showDot />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-ink">{o?.name}</p>
                    <span className="shrink-0 text-[11px] text-neutral-400">
                      {formatListTime(last?.createdAt || c.updatedAt)}
                    </span>
                  </div>
                  <p className="truncate text-xs text-neutral-500">{c.property?.title}</p>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p className={`truncate text-sm ${count ? 'font-semibold text-ink' : 'text-neutral-500'}`}>
                      {last?.text ? last.text : last?.image ? '📷 Photo' : 'Say hello 👋'}
                    </p>
                    {count > 0 && (
                      <span className="inline-flex min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-semibold leading-5 text-white">
                        {count > 99 ? '99+' : count}
                      </span>
                    )}
                  </div>
                </div>
                {c.property?.images?.[0] && (
                  <img
                    src={fileUrl(c.property.images[0])}
                    alt=""
                    className="hidden h-11 w-11 shrink-0 rounded-xl object-cover sm:block"
                  />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
