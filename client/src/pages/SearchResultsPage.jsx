import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  MdCheckCircle,
  MdVerifiedUser,
  MdFingerprint,
  MdOutlineVisibility,
  MdArrowBack,
} from 'react-icons/md';
import { HiOutlineSparkles, HiOutlineShieldCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useArtefacts } from '../context/ArtefactContext';

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { artefacts, findMatches, flagForVerification, setCurrentRole } = useArtefacts();

  const state = location.state || {};
  const uploadedImage = state.imagePreview || '/images/nataraja.jpg';
  const seizureLocation = state.location || 'Chennai Seaport Customs Terminal 3';
  const seizureDate = state.date || '2026-10-05';
  const seizingOfficer = state.officer || 'Inspector Ramesh Kumar (DRI)';
  const seizureNotes = state.notes || 'Submitted for comparison against registered artefact images.';

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'heatmap' | 'forensics'
  const [analyzing, setAnalyzing] = useState(true);
  const [matchResults, setMatchResults] = useState([]);
  const [matchError, setMatchError] = useState('');
  const [flaggedSuccess, setFlaggedSuccess] = useState(false);
  const [createdVerifId, setCreatedVerifId] = useState(null);
  const [sendingMatch, setSendingMatch] = useState(false);

  const topCandidate = matchResults[0] || null;
  const secondaryCandidate = matchResults[1] || null;

  useEffect(() => {
    let active = true;
    setAnalyzing(true);
    setMatchError('');
    findMatches(uploadedImage, artefacts)
      .then((results) => {
        if (active) setMatchResults(results);
      })
      .catch((error) => {
        if (!active) return;
        setMatchResults([]);
        setMatchError(error.message || 'Similarity analysis failed.');
        toast.error(error.message || 'Similarity analysis failed.');
      })
      .finally(() => {
        if (active) setAnalyzing(false);
      });
    return () => {
      active = false;
    };
  }, [artefacts, findMatches, uploadedImage]);

  useEffect(() => {
    if (!flaggedSuccess) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setFlaggedSuccess(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [flaggedSuccess]);

  const handleFlagForASI = async () => {
    if (!topCandidate || sendingMatch) return;
    setSendingMatch(true);
    try {
      const verifId = await flagForVerification({
        candidateArtefact: topCandidate,
        seizedImage: uploadedImage,
        location: seizureLocation,
        date: seizureDate,
        officer: seizingOfficer,
        notes: seizureNotes,
        matchScore: topCandidate.matchScore,
      });
      setCreatedVerifId(verifId);
      setFlaggedSuccess(true);
    } catch (error) {
      console.error('Unable to send match for ASI review:', error);
      toast.error('The match could not be sent. Please try again.');
    } finally {
      setSendingMatch(false);
    }
  };

  const handleJumpToASI = () => {
    setCurrentRole('asi-expert');
    navigate('/asi-verification');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Toast Notification when flagged */}
      {flaggedSuccess && (
        <div role="dialog" aria-modal="true" aria-labelledby="match-sent-title" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#140e09] border border-emerald-500/40 p-8 rounded-3xl max-w-lg w-full text-center shadow-2xl animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 text-4xl">
              <MdCheckCircle />
            </div>
            <h3 id="match-sent-title" className="font-display font-bold text-2xl text-white mb-2">
              Flagged for ASI Authentication!
            </h3>
            <p className="text-heritage-300 text-sm mb-4">
              Seizure dossier has been queued into the Archaeological Survey of India (ASI) forensic workbench.
            </p>
            <div className="bg-black/50 p-3 rounded-xl border border-white/10 font-mono text-saffron-400 text-sm mb-6">
              Verification Docket ID: {createdVerifId}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setFlaggedSuccess(false)}
                className="btn-secondary flex-1 text-xs py-2.5"
              >
                Close & Stay on Results
              </button>
              <button
                onClick={handleJumpToASI}
                className="btn-primary flex-1 text-xs py-2.5 flex items-center justify-center gap-2"
              >
                <MdVerifiedUser className="text-base" /> Open ASI Workbench →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <Link
            to="/investigator-dashboard"
            className="text-xs text-heritage-400 hover:text-white flex items-center gap-1 mb-2"
          >
            <MdArrowBack /> Back to Investigator Portal
          </Link>
          <div className="inline-flex items-center gap-2 text-saffron-400 font-mono text-xs uppercase tracking-widest mb-1">
            <HiOutlineSparkles /> Neural Visual Recognition Engine
          </div>
          <h1 className="section-heading">AI Match Results & Provenance Analysis</h1>
          <p className="text-heritage-300 text-sm mt-1">
            Ranked against available registry images using visual feature matching.
          </p>
        </div>

        <Link to="/upload-recovered">
          <button className="btn-secondary text-xs py-2.5 px-4">
            Upload Another Contraband Photo
          </button>
        </Link>
      </div>

      {analyzing ? (
        /* Neural scan loading state */
        <div className="glass-card p-16 text-center max-w-xl mx-auto border border-saffron-500/30">
          <div className="w-16 h-16 rounded-full border-4 border-saffron-500/20 border-t-saffron-500 animate-spin mx-auto mb-6"></div>
          <h3 className="font-display font-bold text-xl text-white mb-2">
            Comparing ORB keypoints and global image features...
          </h3>
          <p className="text-heritage-400 text-xs max-w-md mx-auto mb-4">
            Registry candidates are ranked by a 70% ORB and 30% global embedding score.
          </p>
          <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden max-w-xs mx-auto">
            <div className="h-full bg-saffron-500 animate-pulse rounded-full w-3/4"></div>
          </div>
        </div>
      ) : topCandidate ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Seized Item Info */}
          <div className="lg:col-span-4">
            <div className="glass-card p-6 border border-white/10 sticky top-24">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <h3 className="font-display font-bold text-lg text-white">Seized Contraband</h3>
                <span className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                  Confiscated
                </span>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-black/60 aspect-square border border-white/10 mb-4">
                <img
                  src={uploadedImage}
                  alt="Seized Contraband"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-heritage-200">
                  SEIZURE PHOTO
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-heritage-300 bg-black/40 p-4 rounded-xl border border-white/5 mb-4">
                <p>
                  <strong className="text-white">Location:</strong> {seizureLocation}
                </p>
                <p>
                  <strong className="text-white">Date:</strong> {seizureDate}
                </p>
                <p>
                  <strong className="text-white">Seizing Authority:</strong> {seizingOfficer}
                </p>
                <p className="pt-2 border-t border-white/5 text-heritage-400 text-[11px] leading-relaxed">
                  <strong>Notes:</strong> {seizureNotes}
                </p>
              </div>

              <div className="bg-saffron-500/10 border border-saffron-500/30 p-3.5 rounded-xl text-xs">
                <div className="flex items-center gap-1.5 text-saffron-400 font-semibold mb-1">
                  <MdFingerprint className="text-base" /> Neural Descriptors
                </div>
                <p className="text-heritage-300 text-[11px] leading-relaxed">
                  ORB keypoint match: {(topCandidate.orbScore * 100).toFixed(1)}%. Global feature embedding: {(topCandidate.deepScore * 100).toFixed(1)}%.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: AI Match Results & Forensic View */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-2xl text-white">
                Identified Match Candidates ({matchResults.length})
              </h2>
              <span className="text-xs text-emerald-400 font-mono font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping"></span>
                Ranked by image similarity
              </span>
            </div>

            {/* Top Match Card (High Confidence) */}
            <div className="glass-card p-6 sm:p-8 border-2 border-saffron-500/50 bg-gradient-to-br from-saffron-950/20 via-black/40 to-black/60 rounded-3xl relative overflow-hidden shadow-2xl">
              {/* Match Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-emerald-500 text-black text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {topCandidate.matchScore.toFixed(1)}% Match
                    </span>
                    <span className="text-xs font-mono text-saffron-400 font-semibold">
                      ID: {topCandidate.id}
                    </span>
                    <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-rose-500/30">
                      {topCandidate.status}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-2xl text-white">
                    {topCandidate.name}
                  </h3>
                  <p className="text-xs text-saffron-400 font-mono">{topCandidate.period || 'Period not provided'}</p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] uppercase tracking-wider font-mono text-heritage-400 block">
                    Visual match score
                  </span>
                  <span className="font-display text-3xl font-black text-emerald-400">
                    {topCandidate.matchScore.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* View Tabs */}
              <div className="flex border-b border-white/10 mb-6 gap-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
                    activeTab === 'overview'
                      ? 'border-saffron-400 text-saffron-300'
                      : 'border-transparent text-heritage-400 hover:text-white'
                  }`}
                >
                  Side-by-Side Comparison
                </button>
                <button
                  onClick={() => setActiveTab('heatmap')}
                  className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'heatmap'
                      ? 'border-saffron-400 text-saffron-300'
                      : 'border-transparent text-heritage-400 hover:text-white'
                  }`}
                >
                  <MdOutlineVisibility /> Similarity Scores
                </button>
                <button
                  onClick={() => setActiveTab('forensics')}
                  className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'forensics'
                      ? 'border-saffron-400 text-saffron-300'
                      : 'border-transparent text-heritage-400 hover:text-white'
                  }`}
                >
                  <HiOutlineShieldCheck /> Registry Metadata
                </button>
              </div>

              {/* Tab 1: Side by side comparison */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div className="bg-black/50 p-3 rounded-2xl border border-white/10 text-center">
                    <p className="text-[11px] font-mono text-heritage-400 uppercase mb-2">
                      Recovered Confiscation
                    </p>
                    <div className="h-56 rounded-xl overflow-hidden bg-black/80">
                      <img
                        src={uploadedImage}
                        alt="Recovered"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-[10px] text-heritage-400 mt-2">
                      Customs Terminal 3 Seizure
                    </p>
                  </div>

                  <div className="bg-black/50 p-3 rounded-2xl border border-saffron-500/30 text-center">
                    <p className="text-[11px] font-mono text-saffron-400 uppercase mb-2">
                      Registry reference image
                    </p>
                    <div className="h-56 rounded-xl overflow-hidden bg-black/80">
                      <img
                        src={topCandidate.image || topCandidate.imageUrl}
                        alt={`Registry image of ${topCandidate.name}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-[10px] text-heritage-400 mt-2">
                      {topCandidate.origin || topCandidate.templeName || 'Registry reference'}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Similarity signals */}
              {activeTab === 'heatmap' && (
                <div className="mb-6 grid grid-cols-2 gap-4 bg-black/60 p-4 rounded-2xl border border-saffron-500/30">
                  <div className="bg-white/5 p-4 rounded-xl">
                    <p className="text-heritage-400 text-xs">ORB keypoint score · 70% weight</p>
                    <p className="text-emerald-400 font-mono font-bold text-xl">{(topCandidate.orbScore * 100).toFixed(1)}%</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl">
                    <p className="text-heritage-400 text-xs">Global embedding · 30% weight</p>
                    <p className="text-emerald-400 font-mono font-bold text-xl">{(topCandidate.deepScore * 100).toFixed(1)}%</p>
                  </div>
                </div>
              )}

              {/* Tab 3: Registry metadata */}
              {activeTab === 'forensics' && (
                <div className="mb-6 bg-black/40 p-5 rounded-2xl border border-white/10 space-y-3 text-xs">
                  <div className="flex justify-between pb-2 border-b border-white/5">
                    <span className="text-heritage-400">Registry status:</span>
                    <span className="text-white font-semibold">{topCandidate.status}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-white/5">
                    <span className="text-heritage-400">Origin:</span>
                    <span className="text-white font-semibold">{topCandidate.origin || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-white/5">
                    <span className="text-heritage-400">Material Composition:</span>
                    <span className="text-white">{topCandidate.material || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-white/5">
                    <span className="text-heritage-400">Physical Dimensions:</span>
                    <span className="text-white">{topCandidate.dimensions || 'Not provided'}</span>
                  </div>
                </div>
              )}

              {/* Match Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/10">
                <span className="text-xs text-heritage-400">
                  Ready for Archaeological Survey of India (ASI) official physical inspection.
                </span>

                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleFlagForASI}
                    disabled={sendingMatch || !topCandidate}
                    className="btn-primary flex-1 sm:flex-none text-xs py-3 px-6 flex items-center justify-center gap-2 shadow-saffron-500/20"
                  >
                    <MdVerifiedUser className="text-lg" /> {sendingMatch ? 'Sending match…' : 'Send match to ASI Expert'}
                  </button>
                </div>
              </div>
            </div>

            {/* Secondary Candidate (Low confidence match for comparison) */}
            {secondaryCandidate && <div className="glass-card p-5 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 opacity-75 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-4">
                <img
                  src={secondaryCandidate.image || secondaryCandidate.imageUrl}
                  alt={secondaryCandidate.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-white/10 text-heritage-300 text-[10px] font-mono px-2 py-0.5 rounded-full">
                      {secondaryCandidate.matchScore.toFixed(1)}% Match
                    </span>
                    <span className="text-xs text-heritage-400 font-mono">{secondaryCandidate.id}</span>
                  </div>
                  <h4 className="font-display font-bold text-white text-base">
                    {secondaryCandidate.name}
                  </h4>
                  <p className="text-[11px] text-heritage-400">{secondaryCandidate.period || 'Period not provided'}</p>
                </div>
              </div>

              <span className="text-xs text-heritage-400 font-mono bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                Next highest image similarity
              </span>
            </div>}
          </div>
        </div>
      ) : (
        <div className="glass-card p-8 text-center border border-white/10">
          <p className="text-white font-semibold">No registry image matches are available.</p>
          <p className="text-heritage-400 text-sm mt-2">{matchError || 'No registry records have reference images to compare.'}</p>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
