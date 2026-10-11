import {
  MdCheckCircle,
  MdReportProblem,
  MdRestore,
  MdWarning,
  MdPendingActions,
  MdCancel,
} from 'react-icons/md';

const STATUS_CONFIG = {
  safe: { label: 'Safe', icon: MdCheckCircle, className: 'status-safe' },
  missing: { label: 'Missing', icon: MdReportProblem, className: 'status-missing' },
  recovered: { label: 'Recovered', icon: MdRestore, className: 'status-recovered' },
  endangered: { label: 'Endangered', icon: MdWarning, className: 'status-endangered' },
  pending: { label: 'Pending', icon: MdPendingActions, className: 'status-endangered' },
  authenticated: { label: 'Authenticated', icon: MdCheckCircle, className: 'status-safe' },
  rejected: { label: 'Rejected', icon: MdCancel, className: 'status-missing' },
};

export default function StatusBadge({ status, className = '' }) {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    icon: MdWarning,
    className: 'status-endangered',
  };
  const Icon = config.icon;

  return (
    <span className={`status-badge ${config.className} ${className}`}>
      <Icon aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
