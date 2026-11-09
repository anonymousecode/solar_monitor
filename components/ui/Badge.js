const statusConfig = {
  online: {
    dot: 'bg-emerald-400',
    text: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
  },
  offline: {
    dot: 'bg-rose-400',
    text: 'text-rose-400',
    bg: 'bg-rose-400/10',
    border: 'border-rose-400/20',
  },
  warning: {
    dot: 'bg-amber-400',
    text: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
  },
  error: {
    dot: 'bg-rose-500',
    text: 'text-rose-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
};

export default function Badge({ status = 'offline', label }) {
  const config = statusConfig[status] || statusConfig.offline;
  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.border} ${config.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {displayLabel}
    </span>
  );
}
