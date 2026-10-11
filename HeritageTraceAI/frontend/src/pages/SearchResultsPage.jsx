import { MdWarning } from 'react-icons/md';

const SearchResultsPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="heading-display text-3xl mb-2">AI Match Results</h1>
        <p className="text-heritage-300">Comparing uploaded image against the national stolen artefact database.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="glass-card sticky top-24">
            <h2 className="text-xl font-semibold mb-4 border-b border-white/10 pb-2">Uploaded Item</h2>
            <div className="bg-black/30 rounded-xl p-4 mb-4">
              <div className="w-full h-48 bg-gray-800 rounded-lg flex items-center justify-center mb-2">
                <span className="text-gray-500 text-sm">Uploaded Image</span>
              </div>
              <p className="text-sm text-heritage-300">Location: Chennai Port</p>
              <p className="text-sm text-heritage-300">Date: Oct 5, 2026</p>
            </div>
            <button className="btn-secondary w-full">Refine Search</button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Top Matches Found (3)</h2>
          
          <div className="space-y-6">
            {/* Match 1 */}
            <div className="glass-card flex flex-col md:flex-row gap-6 border-l-4 border-l-saffron-500">
              <div className="w-full md:w-1/3 h-48 bg-gray-800 rounded-lg flex-shrink-0"></div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white">Bronze Nataraja Idol</h3>
                    <span className="bg-saffron-500/20 text-saffron-400 px-3 py-1 rounded-full text-sm font-bold border border-saffron-500/30">98% Match</span>
                  </div>
                  <p className="text-heritage-400 text-sm mb-2">Reported missing from Brihadeeswara Temple on Jun 12, 2022.</p>
                  <p className="text-sm text-heritage-300"><span className="text-white">Period:</span> 11th Century</p>
                  <p className="text-sm text-heritage-300"><span className="text-white">Material:</span> Panchaloha (Bronze)</p>
                </div>
                <div className="flex gap-4 mt-4">
                  <button className="btn-primary py-2 text-sm">Flag for ASI Verification</button>
                  <button className="btn-secondary py-2 text-sm">View Full Details</button>
                </div>
              </div>
            </div>

            {/* Match 2 */}
            <div className="glass-card flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3 h-48 bg-gray-800 rounded-lg flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-white">Shiva Parvati Sculpture</h3>
                  <span className="bg-white/10 text-white/70 px-3 py-1 rounded-full text-sm font-bold">42% Match</span>
                </div>
                <p className="text-heritage-400 text-sm mb-2">Stolen from Kumbakonam region.</p>
                <button className="btn-secondary py-2 text-sm mt-4">View Full Details</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
