const timeFmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const dateFmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });

export const formatPrice = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

export const formatTime = (d) => (d ? timeFmt.format(new Date(d)) : '');

/** Chat-list friendly: time today, "Yesterday", otherwise "Oct 3". */
export const formatListTime = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return timeFmt.format(date);
  const y = new Date();
  y.setDate(now.getDate() - 1);
  if (date.toDateString() === y.toDateString()) return 'Yesterday';
  return dateFmt.format(date);
};

/** Label for date separators in the message list. */
export const formatDayLabel = (d) => {
  const date = new Date(d);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return 'Today';
  const y = new Date();
  y.setDate(now.getDate() - 1);
  if (date.toDateString() === y.toDateString()) return 'Yesterday';
  return dateFmt.format(date);
};

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
