import { MdCheckCircle, MdCancel } from 'react-icons/md';

const ASIExpertVerificationPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="heading-display text-3xl mb-2">ASI Expert Verification</h1>
        <p className="text-heritage-300">Review flagged matches to authenticate recovered artefacts.</p>
      </div>

      <div className="glass-card">
        <h2 className="text-xl font-semibold mb-6 border-b border-white/10 pb-4">Pending Verifications (1)</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Seized Item */}
          <div className="bg-black/30 p-6 rounded-xl border border-white/5">
            <h3 className="text-lg font-medium text-heritage-200 mb-4 text-center">Recovered Item (Customs, Chennai)</h3>
            <div className="w-full h-64 bg-gray-800 rounded-lg mb-4"></div>
            <p className="text-sm text-heritage-400 text-center">Uploaded by Inv. Ramesh (Oct 5, 2026)</p>
          </div>

          {/* Database Item */}
          <div className="bg-saffron-900/10 p-6 rounded-xl border border-saffron-500/20">
            <h3 className="text-lg font-medium text-saffron-400 mb-4 text-center">Original Registry (Missing since 2022)</h3>
            <div className="w-full h-64 bg-gray-800 rounded-lg mb-4"></div>
            <p className="text-sm text-heritage-400 text-center">Bronze Nataraja (ID: HT-49281)</p>
          </div>
        </div>

        <div className="bg-black/20 p-6 rounded-xl border border-white/10 mb-8">
          <h3 className="font-semibold mb-4 text-white">Expert Analysis Notes</h3>
          <textarea className="input-field" rows="4" placeholder="Enter findings regarding iconography, material composition, patina, and unique marks..."></textarea>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-4 border-t border-white/10 pt-6">
          <button className="btn-secondary flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 hover:border-red-500/30">
            <MdCancel className="text-xl" /> Reject Match (False Positive)
          </button>
          <button className="btn-primary flex items-center justify-center gap-2">
            <MdCheckCircle className="text-xl" /> Authenticate & Confirm Match
          </button>
        </div>
      </div>
    </div>
  );
};

export default ASIExpertVerificationPage;
