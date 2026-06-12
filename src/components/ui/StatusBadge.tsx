interface StatusBadgeProps {
  status: 'online' | 'offline' | 'warning' | 'active' | 'inactive' | 'expired'
  label?: string
  size?: 'sm' | 'md'
}

const STATUS_MAP: Record<string, { label: string; cls: string; dot: string }> = {
  online:   { label: 'Online',   cls: 'nb-badge-green',  dot: 'nb-dot-green' },
  offline:  { label: 'Offline',  cls: 'nb-badge-red',    dot: 'nb-dot-red' },
  warning:  { label: 'Warning',  cls: 'nb-badge-yellow', dot: 'nb-dot-yellow' },
  active:   { label: 'Active',   cls: 'nb-badge-green',  dot: 'nb-dot-green' },
  inactive: { label: 'Inactive', cls: 'nb-badge-gray',   dot: 'nb-dot-gray' },
  expired:  { label: 'Expired',  cls: 'nb-badge-red',    dot: 'nb-dot-red' },
}

export default function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const cfg = STATUS_MAP[status] ?? STATUS_MAP['offline']
  return (
    <span
      className={`nb-badge ${cfg.cls}`}
      style={{ fontSize: size === 'sm' ? '0.65rem' : undefined }}
    >
      <span className={`nb-dot ${cfg.dot}`} style={{ width: 7, height: 7, borderWidth: 1.5 }} />
      {label ?? cfg.label}
    </span>
  )
}
