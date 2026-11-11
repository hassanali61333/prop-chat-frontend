export default function Spinner({ className = 'h-6 w-6' }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-2 border-line border-t-brand ${className}`}
    />
  );
}
