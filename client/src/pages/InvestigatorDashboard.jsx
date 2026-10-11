import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  MdSearch,
  MdUploadFile,
  MdLocationOn,
  MdVerifiedUser,
  MdFingerprint,
  MdClose,
  MdCloudUpload,
  MdCalendarToday,
  MdSend,
  MdAutoAwesome,
} from 'react-icons/md';
import { HiOutlineSparkles, HiOutlineArrowRight } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useArtefacts } from '../context/ArtefactContext';

const InvestigatorDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { artefacts, verifications, findMatches, flagForVerification } = useArtefacts();
  const fileInputRef = useRef(null);

  // Pre-selection from Temple Admin "Match Seizure"
  const preselected = location.state?.preselectedArtefact || null;

  const missingItems = artefacts.filter((a) => a.status === 'missing');
  const pendingCount = verifications.filter((v) => v.status === 'pending').length;

  // Upload & search state
  const [imagePreview, setImagePreview] = useState(preselected?.image || preselected?.imageUrl || null);
  const [dragActive, setDragActive] = useState(false);
  const [caseNumber, setCaseNumber] = useState('');
  const [seizureLocation, setSeizureLocation] = useState('');
  const [seizureDate, setSeizureDate] = useState(new Date().toISOString().split('T')[0]);
  const [analyzing, setAnalyzing] = useState(false);
  const [matchResults, setMatchResults] = useState(null);
  const [fileError, setFileError] = useState('');

  // Drag and drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const validateFile = (file) => {
    setFileError('');
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setFileError('Only JPG, PNG and WebP images are supported');
      toast.error('Invalid file type — only JPG, PNG, WebP');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size must be under 10MB');
      toast.error('File too large — max 10MB');
      return false;
    }
    return true;
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
      }
    }
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && validateFile(file)) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFindMatches = async () => {
    if (!imagePreview) {
      toast.error('Upload an image first');
      return;
    }
    setAnalyzing(true);
    setMatchResults(null);
    try {
      const results = await findMatches(imagePreview, artefacts);
      setMatchResults(results);
      toast.success(`Found ${results.length} potential matches`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Match analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSendToASI = async (result) => {
    await flagForVerification({
      candidateArtefact: result,
      seizedImage: imagePreview,
      location: seizureLocation || 'Seizure Terminal',
      date: seizureDate,
      officer: 'Investigator',
      notes: caseNumber ? `Case #${caseNumber}` : '',
      matchScore: result.matchScore,
    });
    toast.success(`"${result.name}" sent to ASI Expert for verification`, { icon: '📤' });
  };

  const getScoreColor = (score) => {
    if (score >= 85) return { bar: 'bg-emerald-500', text: 'text-emerald-400' };
    if (score >= 60) return { bar: 'bg-amber-500', text: 'text-amber-400' };
    return { bar: 'bg-rose-500', text: 'text-rose-400' };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-blue-400 font-mono text-xs uppercase tracking-widest mb-1">
            <HiOutlineSparkles /> Directorate of Revenue Intelligence & Customs
          </div>
          <h1 className="section-heading">Investigator & Enforcement Portal</h1>
          <p className="text-heritage-300 text-sm mt-1">
            Cross-reference intercepted cargo with the national stolen antiquities database using AI vision.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="glass-card p-6 border-l-4 border-l-rose-500">
          <p className="text-xs uppercase font-mono text-rose-400 mb-1">Active Thefts to Intercept</p>
          <p className="font-display text-3xl font-black text-white">{missingItems.length}</p>
          <p className="text-[11px] text-heritage-400 mt-1">Under nationwide lookout circular</p>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-blue-500">
          <p className="text-xs uppercase font-mono text-blue-400 mb-1">Seizure Matches Flagged</p>
          <p className="font-display text-3xl font-black text-blue-400">{verifications.length}</p>
          <p className="text-[11px] text-heritage-400 mt-1">Escalated to ASI epigraphists</p>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-emerald-500">
          <p className="text-xs uppercase font-mono text-emerald-400 mb-1">Awaiting ASI Verification</p>
          <p className="font-display text-3xl font-black text-emerald-400">{pendingCount}</p>
          <p className="text-[11px] text-heritage-400 mt-1">In forensic analysis queue</p>
        </div>
      </div>

      {/* ─── Image Upload & AI Match Section ─── */}
      <div className="glass-card p-6 sm:p-8 border border-white/10 mb-10 rounded-3xl">
        <h2 className="font-display text-xl font-bold text-white mb-1 flex items-center gap-2">
          <MdFingerprint className="text-blue-400" /> AI Visual Match Scanner
        </h2>
        <p className="text-heritage-400 text-sm mb-6">Upload a photograph of the seized item to find registry matches.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Area */}
          <div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => !imagePreview && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer relative min-h-[260px] flex flex-col items-center justify-center transition-all ${
                dragActive
                  ? 'border-blue-400 bg-blue-500/10'
                  : imagePreview
                  ? 'border-white/20 bg-black/30'
                  : 'border-white/20 hover:border-blue-500/50 bg-black/40 hover:bg-black/50'
              }`}
            >
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Seized item"
                    className="max-h-60 rounded-xl mx-auto object-cover border border-white/15 shadow-xl"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagePreview(null);
                      setMatchResults(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute -top-3 -right-3 bg-rose-600 hover:bg-rose-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg"
                  >
                    <MdClose />
                  </button>
                </div>
              ) : (
                <>
                  <MdCloudUpload className="text-5xl text-blue-400 mb-3" />
                  <p className="text-sm font-semibold text-white">
                    {dragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
                  </p>
                  <p className="text-xs text-heritage-400 mt-1">
                    JPG, PNG or WebP • Max 10MB
                  </p>
                </>
              )}
            </div>
            {fileError && <p className="text-xs text-rose-400 mt-2">{fileError}</p>}

            {/* Optional fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <div>
                <label className="block text-[10px] font-semibold text-heritage-400 mb-1 uppercase tracking-wider">Case Number</label>
                <input
                  type="text"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  placeholder="e.g. FIR-492/2022"
                  className="input-field text-xs py-2"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-heritage-400 mb-1 uppercase tracking-wider">Seizure Location</label>
                <input
                  type="text"
                  value={seizureLocation}
                  onChange={(e) => setSeizureLocation(e.target.value)}
                  placeholder="e.g. Chennai Port"
                  className="input-field text-xs py-2"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-heritage-400 mb-1 uppercase tracking-wider">Seizure Date</label>
                <input
                  type="date"
                  value={seizureDate}
                  onChange={(e) => setSeizureDate(e.target.value)}
                  className="input-field text-xs py-2"
                />
              </div>
            </div>

            <button
              onClick={handleFindMatches}
              disabled={!imagePreview || analyzing}
              className="btn-primary w-full mt-4 text-sm py-3 flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing... Running AI neural match
                </>
              ) : (
                <>
                  <MdSearch className="text-lg" /> Find Matches
                </>
              )}
            </button>
          </div>

          {/* Results Area */}
          <div>
            {analyzing && (
              <div className="flex flex-col items-center justify-center h-full py-16">
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" />
                  <MdFingerprint className="absolute inset-0 m-auto text-3xl text-blue-400" />
                </div>
                <p className="text-white font-semibold mb-1">Analyzing image features...</p>
                <p className="text-heritage-400 text-xs">Neural feature extraction • Visual geometry • Inscription OCR</p>
              </div>
            )}

            {!analyzing && !matchResults && (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <MdAutoAwesome className="text-4xl text-heritage-600 mb-4" />
                <p className="text-heritage-400 text-sm">Upload an image and click "Find Matches" to search the registry</p>
              </div>
            )}

            {!analyzing && matchResults && (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                <p className="text-xs text-heritage-400 font-mono mb-2">
                  Top {matchResults.length} matches from national registry
                </p>
                {matchResults.map((result, i) => {
                  const sc = getScoreColor(result.matchScore);
                  return (
                    <div
                      key={result.id}
                      className="bg-black/40 border border-white/10 rounded-xl p-4 flex gap-4 hover:border-blue-500/30 transition-all"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-black/60 flex-shrink-0">
                        <img src={result.image || result.imageUrl} alt={result.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <h4 className="font-display font-bold text-sm text-white truncate">{result.name}</h4>
                            <p className="text-[10px] text-saffron-400 font-mono">{result.id} • {result.templeName || result.origin}</p>
                          </div>
                          <span className={`text-lg font-black ${sc.text} flex-shrink-0`}>
                            {result.matchScore.toFixed(1)}%
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full h-1.5 bg-white/10 rounded-full mb-3">
                          <div
                            className={`h-full ${sc.bar} rounded-full transition-all duration-500`}
                            style={{ width: `${result.matchScore}%` }}
                          />
                        </div>
                        <button
                          onClick={() => handleSendToASI(result)}
                          className="text-[11px] font-bold py-1 px-3 rounded-lg border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-1"
                        >
                          <MdSend className="text-xs" /> Send to ASI Expert
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Priority Lookout Items */}
      <div className="glass-card p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display text-xl font-bold text-white">
              High-Priority National Thefts Circular
            </h3>
            <p className="text-heritage-400 text-xs mt-0.5">
              These artefacts have active FIRs and lookouts registered with port authorities.
            </p>
          </div>
          <Link to="/artefacts" className="text-xs text-saffron-400 hover:underline">
            View All in Registry →
          </Link>
        </div>

        {missingItems.length === 0 && (
          <div className="text-center py-12">
            <MdVerifiedUser className="text-4xl text-emerald-400 mx-auto mb-3 opacity-60" />
            <p className="text-heritage-400 text-sm">No active thefts in the system — all artefacts accounted for.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {missingItems.map((item) => (
            <div
              key={item.id}
              className="bg-black/40 border border-rose-500/30 rounded-2xl p-4 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 rounded-xl overflow-hidden mb-3 bg-black/60">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  <span className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Stolen / Missing
                  </span>
                  <span className="absolute bottom-2 left-2 bg-black/80 text-saffron-400 text-[10px] font-mono px-2 py-0.5 rounded">
                    ID: {item.id}
                  </span>
                </div>

                <h4 className="font-display font-bold text-lg text-white mb-1">{item.name}</h4>
                <p className="text-xs text-saffron-400 font-mono mb-2">{item.period}</p>
                <p className="text-heritage-300 text-xs line-clamp-2 mb-3">{item.description}</p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-heritage-400 flex items-center gap-1 truncate mr-2">
                  <MdLocationOn className="text-rose-400 flex-shrink-0" /> {item.origin}
                </span>
                <button
                  onClick={() => {
                    setImagePreview(item.image || item.imageUrl);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    toast('Artefact pre-loaded — click "Find Matches" to proceed', { icon: '🔍' });
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex-shrink-0"
                >
                  Match Seizure →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InvestigatorDashboard;
