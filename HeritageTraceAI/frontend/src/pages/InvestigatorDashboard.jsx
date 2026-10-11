import { Link } from 'react-router-dom';
import { MdSearch, MdUploadFile } from 'react-icons/md';

const InvestigatorDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-10 text-center">
        <h1 className="heading-display text-4xl mb-4">Investigator Portal</h1>
        <p className="text-heritage-300 max-w-2xl mx-auto">Cross-reference seized items with the national missing artefacts database.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="glass-card text-center p-8">
          <div className="w-16 h-16 bg-saffron-500/20 text-saffron-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <MdSearch className="text-3xl" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Search Database</h2>
          <p className="text-heritage-400 mb-6">Search the registry using AI-powered image matching or text queries.</p>
          <Link to="/search-results">
            <button className="btn-secondary w-full">Start Search</button>
          </Link>
        </div>

        <div className="glass-card text-center p-8">
          <div className="w-16 h-16 bg-saffron-500/20 text-saffron-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <MdUploadFile className="text-3xl" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Log Seized Item</h2>
          <p className="text-heritage-400 mb-6">Upload details and images of newly recovered items for ASI verification.</p>
          <Link to="/upload-recovered">
            <button className="btn-primary w-full">Upload Recovered Artefact</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InvestigatorDashboard;
