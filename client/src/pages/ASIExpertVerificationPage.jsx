import { useState, useCallback, useEffect } from 'react';
import {
  MdCheckCircle,
  MdCancel,
  MdVerifiedUser,
  MdLocationOn,
  MdCalendarToday,
  MdScience,
  MdClose,
  MdZoomIn,
  MdZoomOut,
  MdSmartToy,
  MdTextFields,
  MdDownload,
} from 'react-icons/md';
import { HiOutlineSparkles, HiOutlineShieldCheck } from 'react-icons/hi';
import { QRCodeCanvas } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import { useArtefacts } from '../context/ArtefactContext';
import StatusBadge from '../components/StatusBadge';

const ASIExpertVerificationPage = () => {
  const { verifications, artefacts, resolveVerification } = useArtefacts();

  const [activeVerifIndex, setActiveVerifIndex] = useState(0);
  const [analysisNotes, setAnalysisNotes] = useState(
    'XRF spectrometry confirms authentic 11th-century Chola panchaloha alloy with characteristic trace gold and lead. Prabhamandala flame joinery exhibits authentic lost-wax hand finishing. No signs of modern electroplating or synthetic aging.'
  );

  const [confirmAction, setConfirmAction] = useState(null); // { type: 'approve' | 'reject' }
  const [rejectReason, setRejectReason] = useState('');
  const [generatedCert, setGeneratedCert] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    if (!confirmAction && !zoomedImage && !generatedCert) return undefined;
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return;
      if (generatedCert) setGeneratedCert(null);
      else if (confirmAction) setConfirmAction(null);
      else setZoomedImage(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [confirmAction, zoomedImage, generatedCert]);

  const pendingList = verifications.filter((v) => v.status === 'pending');
  const currentCase = pendingList[activeVerifIndex] || null;

  // Find the artefact data for extra info
  const linkedArtefact = currentCase
    ? artefacts.find((a) => a.id === currentCase.artefactId || a._id === currentCase.artefactId)
    : null;

  const handleApprove = useCallback(async () => {
    if (!currentCase) return;
    const certId = await resolveVerification(currentCase.id, true, analysisNotes);
    setGeneratedCert({
      certId,
      caseItem: currentCase,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      officer: 'Dr. K. S. Sharma, Chief Epigraphist & Curator',
      institution: 'Archaeological Survey of India (ASI) Antiquities Directorate',
      notes: analysisNotes,
      matchScore: currentCase.matchScore,
    });
    setConfirmAction(null);
    toast.success('Artefact authenticated — recovery certificate generated', { icon: '🏛️', duration: 4000 });
  }, [currentCase, analysisNotes, resolveVerification]);

  const handleReject = useCallback(async () => {
    if (!currentCase) return;
    if (!rejectReason.trim()) {
      toast.error('A rejection reason is mandatory');
      return;
    }
    await resolveVerification(currentCase.id, false, analysisNotes, rejectReason);
    setConfirmAction(null);
    setRejectReason('');
    toast.error(`Case ${currentCase.id} rejected — marked as false positive`, { icon: '❌' });
  }, [currentCase, analysisNotes, rejectReason, resolveVerification]);

  // Generate PDF certificate
  const handleDownloadCertificate = useCallback(() => {
    if (!generatedCert) return;
    const doc = new jsPDF();
    const c = generatedCert;

    // Header
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('GOVERNMENT OF INDIA', 105, 15, { align: 'center' });
    doc.setFontSize(16);
    doc.setTextColor(20, 20, 20);
    doc.text('ARCHAEOLOGICAL SURVEY OF INDIA', 105, 25, { align: 'center' });
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text('Official Certificate of Authenticity & Repatriation', 105, 33, { align: 'center' });

    // Divider
    doc.setDrawColor(200, 160, 80);
    doc.setLineWidth(0.5);
    doc.line(20, 38, 190, 38);

    // Details
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const startY = 48;
    const lineH = 8;
    const fields = [
      ['Certificate Docket', c.certId || 'N/A'],
      ['Authenticated Artefact', c.caseItem.candidateName],
      ['Digital Heritage ID', c.caseItem.artefactId],
      ['Attributed Era', c.caseItem.candidatePeriod],
      ['Seizure Provenance', c.caseItem.seizureLocation],
      ['AI Match Score', `${c.matchScore}% Confidence`],
      ['Verifying Authority', c.officer],
      ['Institution', c.institution],
      ['Date Issued', c.date],
    ];

    fields.forEach(([label, value], i) => {
      doc.setFont(undefined, 'bold');
      doc.text(`${label}:`, 25, startY + i * lineH);
      doc.setFont(undefined, 'normal');
      doc.text(value, 80, startY + i * lineH);
    });

    // Expert notes
    const notesY = startY + fields.length * lineH + 5;
    doc.setFont(undefined, 'bold');
    doc.text('Expert Analysis Notes:', 25, notesY);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    const splitNotes = doc.splitTextToSize(c.notes || 'N/A', 160);
    doc.text(splitNotes, 25, notesY + 7);

    // QR Code placeholder text
    const qrY = notesY + 7 + splitNotes.length * 5 + 15;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Scan QR: https://heritagetrace.gov.in/certificate/${c.certId}`, 105, qrY, { align: 'center' });

    // Footer
    doc.setDrawColor(200, 160, 80);
    doc.line(20, 275, 190, 275);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('This certificate is generated by HeritageTrace AI — Archaeological Survey of India', 105, 282, { align: 'center' });

    doc.save(`Recovery-Certificate-${c.certId || 'ASI'}.pdf`);
    toast.success('Certificate PDF downloaded');
  }, [generatedCert]);

  // Score breakdown bar component
  const ScoreBar = ({ label, value }) => {
    const color = value >= 85 ? 'bg-emerald-500' : value >= 60 ? 'bg-amber-500' : 'bg-rose-500';
    return (
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-heritage-300 w-32 flex-shrink-0">{label}</span>
        <div className="flex-1 h-2 bg-white/10 rounded-full">
          <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${value}%` }} />
        </div>
        <span className="text-xs font-bold text-white w-12 text-right">{value.toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ═══ Zoom Image Modal ═══ */}
      {zoomedImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Zoomed artefact image"
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomedImage(null)}
        >
          <img
            src={zoomedImage}
            alt="Zoomed artefact photograph"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />
          <button
            onClick={() => setZoomedImage(null)}
            className="absolute top-4 right-4 bg-white/10 text-white p-2 rounded-full hover:bg-white/20"
          >
            <MdClose className="text-2xl" />
          </button>
        </div>
      )}

      {/* ═══ Confirm Dialog ═══ */}
      {confirmAction && (
        <div role="dialog" aria-modal="true" aria-labelledby="verification-confirm-title" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#140e09] border border-white/20 rounded-2xl max-w-md w-full p-6 animate-fade-in">
            {confirmAction.type === 'approve' ? (
              <>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                  <MdVerifiedUser className="text-3xl text-emerald-400" />
                </div>
                <h3 id="verification-confirm-title" className="font-display font-bold text-lg text-white text-center mb-2">
                  Authenticate & Issue Certificate?
                </h3>
                <p className="text-heritage-300 text-sm text-center mb-6">
                  This will mark "{currentCase?.candidateName}" as RECOVERED and generate an official ASI recovery certificate.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmAction(null)} className="btn-secondary text-xs flex-1 py-2.5">Cancel</button>
                  <button onClick={handleApprove} className="btn-success text-xs flex-1 py-2.5 flex items-center justify-center gap-1">
                    <MdCheckCircle /> Confirm Authentication
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
                  <MdCancel className="text-3xl text-rose-400" />
                </div>
                <h3 className="font-display font-bold text-lg text-white text-center mb-2">
                  Reject Match?
                </h3>
                <p className="text-heritage-300 text-sm text-center mb-4">
                  Please provide a reason for rejecting this match (mandatory).
                </p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows="3"
                  placeholder="e.g. Modern replica — synthetic aging detected, incorrect Talamana proportions..."
                  className="input-field text-xs leading-relaxed mb-4"
                  required
                />
                <div className="flex gap-3">
                  <button onClick={() => { setConfirmAction(null); setRejectReason(''); }} className="btn-secondary text-xs flex-1 py-2.5">Cancel</button>
                  <button onClick={handleReject} className="btn-danger text-xs flex-1 py-2.5 flex items-center justify-center gap-1">
                    <MdCancel /> Reject Match
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══ Certificate Modal ═══ */}
      {generatedCert && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#120c08] border-2 border-emerald-500/60 rounded-3xl max-w-2xl w-full p-8 relative shadow-2xl animate-fade-in my-8">
            <button
              onClick={() => setGeneratedCert(null)}
              className="absolute top-5 right-5 text-heritage-400 hover:text-white p-2 rounded-full bg-white/10"
            >
              <MdClose className="text-2xl" />
            </button>

            <div className="border border-emerald-500/30 p-6 rounded-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 text-3xl">
                <MdVerifiedUser />
              </div>

              <h2 className="font-display font-black text-2xl text-white mb-1">
                ARCHAEOLOGICAL SURVEY OF INDIA
              </h2>
              <p className="text-xs font-mono text-saffron-400 uppercase tracking-widest mb-6">
                Official Certificate of Authenticity & Repatriation Docket
              </p>

              <div className="bg-black/60 p-4 rounded-xl border border-white/10 text-left text-xs space-y-2 mb-6">
                {[
                  ['Certificate Docket', generatedCert.certId, 'text-saffron-400 font-mono font-bold'],
                  ['Authenticated Artefact', generatedCert.caseItem.candidateName, 'text-white font-bold'],
                  ['Digital Heritage ID', generatedCert.caseItem.artefactId, 'text-saffron-400 font-mono'],
                  ['Attributed Era', generatedCert.caseItem.candidatePeriod, 'text-white'],
                  ['Seizure Provenance', generatedCert.caseItem.seizureLocation, 'text-white'],
                  ['Match Confidence', `${generatedCert.matchScore}%`, 'text-emerald-400 font-bold'],
                  ['Verifying Authority', generatedCert.officer, 'text-emerald-400'],
                  ['Date Issued', generatedCert.date, 'text-white'],
                ].map(([label, value, cls]) => (
                  <div key={label} className="flex justify-between border-b border-white/5 pb-1.5">
                    <span className="text-heritage-400">{label}:</span>
                    <span className={cls}>{value}</span>
                  </div>
                ))}
              </div>

              {/* QR Code */}
              <div className="bg-white p-4 rounded-xl inline-block mx-auto mb-4">
                <QRCodeCanvas
                  value={`https://heritagetrace.gov.in/certificate/${generatedCert.certId}`}
                  size={120}
                  level="H"
                />
              </div>

              <p className="text-[11px] text-heritage-400 leading-relaxed mb-6 italic">
                &quot;The undersigned certifies that scientific and stylistic examination conclusively matches this item to the sacred temple registry. The status in the National Central Registry has been transitioned to RECOVERED.&quot;
              </p>

              <div className="flex justify-between gap-3">
                <button
                  onClick={() => setGeneratedCert(null)}
                  className="btn-secondary text-xs flex-1 py-2.5"
                >
                  Done & Close
                </button>
                <button
                  onClick={handleDownloadCertificate}
                  className="btn-primary text-xs flex-1 py-2.5 flex items-center justify-center gap-1.5"
                >
                  <MdDownload className="text-base" /> Download PDF Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-widest mb-1">
            <HiOutlineSparkles /> Archaeological Survey of India (ASI) Expert Directorate
          </div>
          <h1 className="section-heading">ASI Expert Authentication Workbench</h1>
          <p className="text-heritage-300 text-sm mt-1">
            Forensic analysis, metallurgical verification, and certifying seized antiquities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-heritage-400">
            Pending Queue: <strong className="text-emerald-400">{pendingList.length}</strong> cases
          </span>
        </div>
      </div>

      {/* ─── Pending Matches List ─── */}
      {pendingList.length > 0 && (
        <div className="glass-card p-4 border border-white/10 mb-8">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <HiOutlineShieldCheck className="text-emerald-400" /> Pending Verification Queue
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {pendingList.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setActiveVerifIndex(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 flex-shrink-0 ${
                  idx === activeVerifIndex
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-white/5 text-heritage-400 hover:text-white border border-transparent'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${idx === activeVerifIndex ? 'bg-emerald-400' : 'bg-heritage-600'}`} />
                {item.id} • {item.candidateName}
              </button>
            ))}
          </div>
        </div>
      )}

      {currentCase ? (
        <div className="glass-card p-6 sm:p-8 border border-white/10 rounded-3xl">
          {/* Case Title Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-8 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  DOCKET: {currentCase.id}
                </span>
                <StatusBadge status={currentCase.status} />
              </div>
              <h2 className="font-display font-bold text-2xl text-white">
                Verification: {currentCase.candidateName}
              </h2>
              <p className="text-xs text-saffron-400 font-mono">
                Flagged by {currentCase.officer} on {currentCase.seizureDate}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-heritage-400 block font-mono">AI Visual Match</span>
              <span className="text-2xl font-black text-emerald-400">
                {currentCase.matchScore}% Confidence
              </span>
            </div>
          </div>

          {/* Side by Side Examination with Zoom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Seized Item */}
            <div className="bg-black/50 p-5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-rose-400 font-bold uppercase">
                  Exhibit A: Intercepted Contraband
                </span>
                <button
                  onClick={() => setZoomedImage(currentCase.seizedImage)}
                  className="text-heritage-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                  title="Zoom"
                >
                  <MdZoomIn className="text-lg" />
                </button>
              </div>
              <div
                className="h-72 rounded-xl overflow-hidden bg-black/80 mb-3 border border-white/5 cursor-zoom-in"
                onClick={() => setZoomedImage(currentCase.seizedImage)}
              >
                <img
                  src={currentCase.seizedImage}
                  alt={`Seized exhibit for ${currentCase.candidateName}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-xs text-heritage-300 leading-relaxed bg-black/40 p-3 rounded-lg border border-white/5">
                <strong>Officer Report:</strong> {currentCase.notes}
              </p>
              <div className="mt-2 text-[11px] text-heritage-400">
                <MdLocationOn className="inline text-rose-400" /> {currentCase.seizureLocation} •{' '}
                <MdCalendarToday className="inline text-heritage-500" /> {currentCase.seizureDate}
              </div>
            </div>

            {/* Original Registry Record */}
            <div className="bg-black/50 p-5 rounded-2xl border border-saffron-500/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-saffron-400 font-bold uppercase">
                  Exhibit B: Original Sacred Registry
                </span>
                <button
                  onClick={() => setZoomedImage(currentCase.candidateImage)}
                  className="text-heritage-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                  title="Zoom"
                >
                  <MdZoomIn className="text-lg" />
                </button>
              </div>
              <div
                className="h-72 rounded-xl overflow-hidden bg-black/80 mb-3 border border-white/5 cursor-zoom-in"
                onClick={() => setZoomedImage(currentCase.candidateImage)}
              >
                <img
                  src={currentCase.candidateImage}
                  alt={`Archive record photograph of ${currentCase.candidateName}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-xs text-heritage-300 leading-relaxed bg-black/40 p-3 rounded-lg border border-white/5">
                <strong>Registered Attributes:</strong> {currentCase.candidatePeriod}. ID: {currentCase.artefactId}
              </p>
            </div>
          </div>

          {/* Match Score Breakdown */}
          <div className="glass-card p-6 border border-white/10 rounded-2xl mb-8">
            <h3 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
              <MdScience className="text-saffron-400 text-xl" /> Match Score Breakdown
            </h3>
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div className="flex items-center justify-between bg-black/30 p-4 rounded-xl border border-white/5">
                <span className="text-sm font-bold text-white">Overall Confidence</span>
                <span className="text-2xl font-black text-emerald-400">{currentCase.matchScore}%</span>
              </div>
              <div className="space-y-3 bg-black/30 p-4 rounded-xl border border-white/5">
                <ScoreBar label="Visual Similarity" value={currentCase.visualSimilarity || 97.2} />
                <ScoreBar label="Inscription Match" value={currentCase.inscriptionMatch || 99.1} />
                <ScoreBar label="Material Match" value={currentCase.materialMatch || 96.8} />
              </div>
            </div>
          </div>

          {/* OCR Text Box */}
          <div className="glass-card p-6 border border-white/10 rounded-2xl mb-8">
            <h3 className="font-display font-bold text-base text-white mb-3 flex items-center gap-2">
              <MdTextFields className="text-blue-400" /> OCR Extracted Inscription
            </h3>
            <div className="bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-sm text-saffron-300 leading-relaxed whitespace-pre-wrap">
              {currentCase.ocrText || 'No inscription text extracted'}
            </div>
          </div>

          {/* AI Reasoning Box */}
          <div className="glass-card p-6 border border-white/10 rounded-2xl mb-8">
            <h3 className="font-display font-bold text-base text-white mb-3 flex items-center gap-2">
              <MdSmartToy className="text-purple-400" /> AI Reasoning
            </h3>
            <div className="bg-black/50 p-4 rounded-xl border border-purple-500/20 text-sm text-heritage-300 leading-relaxed">
              {currentCase.aiReasoning || 'AI reasoning data not available for this case.'}
            </div>
          </div>

          {/* Expert Notes */}
          <div className="mb-8">
            <label className="block text-xs font-semibold text-heritage-200 mb-2 uppercase tracking-wider">
              Expert Curatorial & Epigraphist Evaluation Notes (XRF Analysis)
            </label>
            <textarea
              value={analysisNotes}
              onChange={(e) => setAnalysisNotes(e.target.value)}
              rows="3"
              className="input-field text-xs leading-relaxed"
            ></textarea>
          </div>

          {/* Official Verification Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-white/10">
            <button
              onClick={() => setConfirmAction({ type: 'reject' })}
              className="btn-secondary text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 text-xs py-3 px-6 flex items-center justify-center gap-2"
            >
              <MdCancel className="text-base" /> Reject Match
            </button>

            <button
              onClick={() => setConfirmAction({ type: 'approve' })}
              className="btn-primary text-xs py-3 px-8 flex items-center justify-center gap-2"
            >
              <MdCheckCircle className="text-lg" /> Authenticate & Issue Recovery Certificate
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card p-16 text-center max-w-lg mx-auto border border-white/10">
          <MdCheckCircle className="text-5xl text-emerald-400 mx-auto mb-4 opacity-75" />
          <h3 className="font-display font-bold text-xl text-white mb-2">Queue is Clear!</h3>
          <p className="text-heritage-300 text-xs mb-6">
            All seized antiquities flagged by investigators have been authenticated and resolved.
          </p>
        </div>
      )}
    </div>
  );
};

export default ASIExpertVerificationPage;
