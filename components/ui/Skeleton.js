export default function Skeleton({ className = '' }) {
  return (
    <div
      className={`bg-slate-700 animate-pulse rounded-md ${className}`}
      aria-hidden="true"
    />
  );
}
