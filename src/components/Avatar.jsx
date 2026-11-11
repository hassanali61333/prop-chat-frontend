import { initials } from '../utils/format';
import OnlineDot from './OnlineDot';

/** Round initials avatar with optional presence dot. Neutral colours only. */
export default function Avatar({ name, online, size = 'h-10 w-10', showDot = false }) {
  return (
    <span className={`relative inline-flex shrink-0 ${size}`}>
      <span className="flex h-full w-full items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
        {initials(name) || '?'}
      </span>
      {showDot && <OnlineDot online={online} className="absolute bottom-0 right-0" />}
    </span>
  );
}
