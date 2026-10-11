/**
 * StatCard — Displays a single statistic with icon and label.
 *
 * Props:
 *   - icon: React node (icon element)
 *   - label: string
 *   - value: string or number
 *   - color: tailwind color class for the accent (e.g., 'text-saffron-400')
 */
const StatCard = ({ icon, label, value, color = 'text-saffron-400' }) => {
  return (
    <div className="stat-card">
      <div className={`text-3xl mb-3 ${color}`}>{icon}</div>
      <div className="font-display text-3xl font-bold text-heritage-100 mb-1">
        {value}
      </div>
      <div className="text-heritage-400 text-sm">{label}</div>
    </div>
  );
};

export default StatCard;
