import StatusBadge from './StatusBadge';

/**
 * ArtefactCard — Displays a single artefact summary in a card layout.
 *
 * Props:
 *   - artefact: { name, origin, period, category, status, imageUrl, description }
 */
const ArtefactCard = ({ artefact }) => {
  return (
    <div className="glass-card overflow-hidden group hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
      {/* Image area */}
      <div className="h-48 bg-heritage-800/50 overflow-hidden relative">
        {artefact.imageUrl ? (
          <img
            src={artefact.imageUrl}
            alt={`Photograph of ${artefact.name}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-heritage-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Status badge overlay */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={artefact.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display font-semibold text-lg text-heritage-100 mb-1 truncate">
          {artefact.name}
        </h3>
        <p className="text-heritage-400 text-sm mb-3 line-clamp-2">
          {artefact.description || 'No description available'}
        </p>

        <div className="space-y-1 text-xs text-heritage-500">
          {artefact.origin && (
            <div className="flex items-center gap-2">
              <span className="text-heritage-600">Origin:</span>
              <span>{artefact.origin}</span>
            </div>
          )}
          {artefact.period && (
            <div className="flex items-center gap-2">
              <span className="text-heritage-600">Period:</span>
              <span>{artefact.period}</span>
            </div>
          )}
          {artefact.category && (
            <div className="flex items-center gap-2">
              <span className="text-heritage-600">Category:</span>
              <span className="capitalize">{artefact.category}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtefactCard;
