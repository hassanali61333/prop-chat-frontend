import { fileUrl } from '../services/api';
import { formatTime } from '../utils/format';

/** Double tick: one tick = sent, two ticks = read. */
function Ticks({ read }) {
  return (
    <svg
      className={`h-3.5 w-3.5 ${read ? 'text-white' : 'text-white/60'}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label={read ? 'Read' : 'Sent'}
    >
      {read ? (
        <>
          <path d="M1 13l4 4L14 7" />
          <path d="M9 15l2 2L21 7" />
        </>
      ) : (
        <path d="M5 13l4 4L19 7" />
      )}
    </svg>
  );
}

/** Own message: orange + white text. Other message: white + black text + grey border. */
export default function ChatBubble({ message, own, onImageClick }) {
  return (
    <div className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 sm:max-w-[70%] ${
          own
            ? 'rounded-br-md bg-brand text-white'
            : 'rounded-bl-md border border-line bg-white text-ink'
        }`}
      >
        {message.image && (
          <button type="button" onClick={() => onImageClick?.(fileUrl(message.image))} className="mb-1 block">
            <img
              src={fileUrl(message.image)}
              alt="Shared"
              loading="lazy"
              className="max-h-64 w-full rounded-xl object-cover"
            />
          </button>
        )}
        {message.text && <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.text}</p>}
        <div
          className={`mt-1 flex items-center justify-end gap-1 text-[11px] ${
            own ? 'text-white/80' : 'text-neutral-400'
          }`}
        >
          <span>{formatTime(message.createdAt)}</span>
          {own && <Ticks read={message.read} />}
        </div>
      </div>
    </div>
  );
}
