/** Animated "X is typing..." indicator (neutral grey dots). */
export default function TypingIndicator({ name }) {
  return (
    <div className="flex items-center gap-2 px-4 pb-2 text-xs text-neutral-500" aria-live="polite">
      <span className="flex items-center gap-1 rounded-full bg-white px-3 py-2 border border-line">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </span>
      <span>{name ? `${name} is typing...` : 'Typing...'}</span>
    </div>
  );
}
