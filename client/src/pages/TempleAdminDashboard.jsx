import { useState, useRef, useCallback, useEffect } from 'react';
import {
  MdAdd,
  MdMuseum,
  MdShield,
  MdWarning,
  MdCheckCircle,
  MdQrCode,
  MdSearch,
  MdClose,
  MdDownload,
  MdRestoreFromTrash,
  MdHistory,
  MdChevronLeft,
  MdChevronRight,
  MdVisibility,
  MdDescription,
  MdFilterList,
  MdDeleteOutline,
} from 'react-icons/md';
import { HiOutlineSparkles } from 'react-icons/hi';
import { QRCodeCanvas } from 'qrcode.react';
import toast from 'react-hot-toast';
import { useArtefacts } from '../context/ArtefactContext';
import StatusBadge from '../components/StatusBadge';

// ─── Skeleton Loader ──────────────────────────────────────────
const SkeletonCard = () => (
  <div className="glass-card p-5 border border-white/10 animate-pulse">
    <div className="h-52 rounded-xl bg-white/5 mb-4" />
    <div className="h-5 bg-white/5 rounded w-3/4 mb-2" />
    <div className="h-3 bg-white/5 rounded w-1/2 mb-4" />
    <div className="h-12 bg-white/5 rounded mb-4" />
    <div className="h-8 bg-white/5 rounded" />
  </div>
);

// ─── Confirm Dialog ───────────────────────────────────────────
const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, variant = 'danger', confirming = false }) => {
  if (!open) return null;
  const colors = variant === 'danger'
    ? 'border-rose-500/40 bg-rose-500/10'
    : 'border-emerald-500/40 bg-emerald-500/10';
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#140e09] border border-white/20 rounded-2xl max-w-md w-full p-6 animate-fade-in">
        <div className={`w-14 h-14 rounded-2xl ${colors} flex items-center justify-center mx-auto mb-4`}>
          {variant === 'danger' ? <MdWarning className="text-3xl text-rose-400" /> : <MdCheckCircle className="text-3xl text-emerald-400" />}
        </div>
        <h3 className="font-display font-bold text-lg text-white text-center mb-2">{title}</h3>
        <p className="text-heritage-300 text-sm text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={confirming} className="btn-secondary text-xs flex-1 py-2.5 disabled:opacity-50">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={confirming}
            className={`${variant === 'danger' ? 'btn-danger' : 'btn-success'} text-xs flex-1 py-2.5`}
          >
            {confirming ? 'Deleting...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Status filter chips ──────────────────────────────────────
const STATUS_FILTERS = ['all', 'safe', 'missing', 'recovered', 'endangered'];
const statusColors = {
  all: 'bg-white/10 text-white border-white/20',
  safe: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  missing: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  recovered: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  endangered: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
};
const statusColorsActive = {
  all: 'bg-white/20 text-white border-white/40',
  safe: 'bg-emerald-500/30 text-emerald-300 border-emerald-400/60',
  missing: 'bg-rose-500/30 text-rose-300 border-rose-400/60',
  recovered: 'bg-blue-500/30 text-blue-300 border-blue-400/60',
  endangered: 'bg-amber-500/30 text-amber-300 border-amber-400/60',
};

const TempleAdminDashboard = () => {
  const { artefacts, reportStolen, markSafe, addArtefact, deleteArtefact, loading } = useArtefacts();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedForQr, setSelectedForQr] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [confirmAction, setConfirmAction] = useState(null);
  const [deletingArtefactId, setDeletingArtefactId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const qrRef = useRef(null);

  // Add form state
  const [newArtefact, setNewArtefact] = useState({
    name: '', period: '', material: '', dimensions: '',
    templeName: '', description: '', inscriptionText: '',
  });
  const [uploadedImages, setUploadedImages] = useState([]);

  useEffect(() => {
    if (!confirmAction && !selectedForQr && !selectedDetail && !showAddForm) return undefined;
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return;
      setConfirmAction(null);
      setSelectedForQr(null);
      setSelectedDetail(null);
      setShowAddForm(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [confirmAction, selectedForQr, selectedDetail, showAddForm]);

  // Stats
  const total = artefacts.length;
  const safe = artefacts.filter((a) => a.status === 'safe').length;
  const missing = artefacts.filter((a) => a.status === 'missing').length;
  const recovered = artefacts.filter((a) => a.status === 'recovered').length;
  const endangered = artefacts.filter((a) => a.status === 'endangered').length;

  // Filter and search combined
  const filtered = artefacts.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  // ─── Handlers ─────────────────────────────────────────
  const handleReportStolen = async (item) => {
    setConfirmAction({
      title: 'Report Stolen',
      message: `Are you sure you want to report "${item.name}" (${item.id}) as stolen? This will broadcast a national lookout.`,
      variant: 'danger',
      onConfirm: async () => {
        await reportStolen(item.id);
        toast.error(`${item.name} reported stolen — national lookout issued`, { icon: '🚨' });
        setConfirmAction(null);
      },
    });
  };

  const handleMarkSafe = async (item) => {
    await markSafe(item.id);
    toast.success(`${item.name} marked as safe — returned to custody`);
  };

  const handleDeleteArtefact = (item) => {
    const artefactId = item.id || item._id || item.artefactId || item.digitalId;
    if (!artefactId) {
      toast.error('Cannot delete this artefact because it has no identifier.');
      return;
    }
    setConfirmAction({
      title: 'Delete Artefact',
      message: 'Are you sure you want to delete this artefact?',
      variant: 'danger',
      onConfirm: async () => {
        setDeletingArtefactId(String(artefactId));
        try {
          await deleteArtefact(artefactId);
          toast.success(`${item.name} deleted from the registry`);
          setConfirmAction(null);
          setSelectedDetail((selected) =>
            selected && String(selected.id || selected._id || selected.artefactId || selected.digitalId) === String(artefactId)
              ? null
              : selected
          );
          setSelectedForQr((selected) =>
            selected && String(selected.id || selected._id || selected.artefactId || selected.digitalId) === String(artefactId)
              ? null
              : selected
          );
        } catch (error) {
          console.error('Could not delete artefact:', error);
          toast.error(error.response?.data?.message || 'Unable to delete artefact. Please try again.');
        } finally {
          setDeletingArtefactId(null);
        }
      },
    });
  };

  const handleDownloadQR = useCallback(() => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `QR-${selectedForQr?.id || 'tag'}.png`;
    link.href = url;
    link.click();
    toast.success('QR code downloaded as PNG');
  }, [selectedForQr]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const valid = files.filter((f) => {
      if (!f.type.startsWith('image/')) {
        toast.error(`${f.name} is not an image file`);
        return false;
      }
      if (f.size > maxSize) {
        toast.error(`${f.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });
    valid.forEach((f) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages((prev) => [...prev, { name: f.name, dataUrl: reader.result, file: f }]);
      };
      reader.readAsDataURL(f);
    });
  };

  const handleSubmitArtefact = async (e) => {
    e.preventDefault();
    if (!newArtefact.name.trim()) {
      toast.error('Artefact name is required');
      return;
    }
    if (uploadedImages.length === 0) {
      toast.error('Upload an artefact image before registration.');
      return;
    }
    try {
      const full = await addArtefact({
        ...newArtefact,
        origin: newArtefact.templeName,
        image: '',
        imageUrl: '',
        imageFile: uploadedImages[0].file,
      });
      toast.success(`"${full.name}" registered as ${full.id}`, { icon: '✨', duration: 4000 });
      setShowAddForm(false);
      setNewArtefact({ name: '', period: '', material: '', dimensions: '', templeName: '', description: '', inscriptionText: '' });
      setUploadedImages([]);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Artefact registration failed.');
    }
  };

  // ─── Render ───────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction?.title}
        message={confirmAction?.message}
        variant={confirmAction?.variant}
        onConfirm={confirmAction?.onConfirm}
        onCancel={() => setConfirmAction(null)}
        confirming={Boolean(deletingArtefactId)}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-widest mb-1">
            <HiOutlineSparkles /> Brihadeeswara & Regional Temple Trust
          </div>
          <h1 className="section-heading">Temple Administration Workspace</h1>
          <p className="text-heritage-300 text-sm mt-1">
            Digital custody, inventory audits, and instantaneous loss reporting.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAddForm(true)} className="btn-primary text-sm flex items-center gap-2">
            <MdAdd className="text-xl" /> Add Artefact
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
        {[
          { label: 'Total Catalogued', value: total, icon: <MdMuseum />, color: 'text-saffron-400', border: 'border-saffron-500/20', bg: 'bg-saffron-500/20' },
          { label: 'Safe & Protected', value: safe, icon: <MdShield />, color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/20' },
          { label: 'Missing / Stolen', value: missing, icon: <MdWarning />, color: 'text-rose-400', border: 'border-rose-500/20', bg: 'bg-rose-500/20' },
          { label: 'Recovered', value: recovered, icon: <MdRestoreFromTrash />, color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/20' },
          { label: 'Endangered', value: endangered, icon: <MdWarning />, color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/20' },
        ].map((stat) => (
          <div key={stat.label} className={`glass-card flex items-center gap-4 ${stat.border} p-4`}>
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0`}>
              {stat.icon}
            </div>
            <div>
              <p className={`text-[10px] uppercase font-mono tracking-wider ${stat.color}`}>{stat.label}</p>
              <p className="text-2xl font-black text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter Controls */}
      <div className="glass-card p-4 sm:p-6 mb-8 border border-white/10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-80">
            <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-heritage-400 text-lg" />
            <input
              type="text"
              placeholder="Search temple inventory..."
              className="input-field pl-10 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-xs text-heritage-300 font-mono">
            Showing <span className="text-white font-bold">{filtered.length}</span> items
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          <MdFilterList className="text-heritage-400 text-lg mt-0.5" />
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all ${
                statusFilter === s ? statusColorsActive[s] : statusColors[s]
              }`}
            >
              {s === 'all' ? 'All' : s}
              {s !== 'all' && (
                <span className="ml-1.5 opacity-75">
                  {artefacts.filter((a) => a.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="glass-card p-16 text-center border border-white/10">
          <MdMuseum className="text-5xl text-heritage-600 mx-auto mb-4" />
          <h3 className="font-display font-bold text-xl text-white mb-2">No artefacts found</h3>
          <p className="text-heritage-400 text-sm">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Register your first artefact to get started.'}
          </p>
        </div>
      )}

      {/* Grid of Artefacts */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="glass-card p-5 border border-white/10 hover:border-saffron-500/40 transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div onClick={() => { setSelectedDetail(item); setCarouselIdx(0); }}>
                <div className="relative h-52 rounded-xl overflow-hidden bg-black/60 mb-4">
                  <img
                    src={item.image || item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <StatusBadge status={item.status} className="absolute top-2.5 right-2.5" />
                  <span className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-saffron-400">
                    {item.id}
                  </span>
                </div>

                <h3 className="font-display font-bold text-xl text-white mb-1">{item.name}</h3>
                <p className="text-xs text-saffron-400 font-mono mb-2">{item.period}</p>
                <p className="text-heritage-300 text-xs line-clamp-2 leading-relaxed mb-4">
                  {item.description}
                </p>

                <div className="space-y-1 text-[11px] text-heritage-400 bg-black/30 p-2.5 rounded-lg border border-white/5 mb-4">
                  <p><strong>Material:</strong> {item.material}</p>
                  <p><strong>Dimensions:</strong> {item.dimensions}</p>
                  <p><strong>Sanctuary:</strong> {item.origin || item.templeName}</p>
                </div>
              </div>

              {/* Actions — depend on status */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedForQr(item)}
                  className="btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1"
                  title="Generate QR Security Tag"
                >
                  <MdQrCode className="text-sm" /> Digital Tag
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteArtefact(item)}
                  className="p-2 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
                  title="Delete artefact"
                  aria-label={`Delete ${item.name}`}
                >
                  <MdDeleteOutline className="text-base" />
                </button>

                {item.status === 'safe' && (
                  <button
                    onClick={() => handleReportStolen(item)}
                    className="text-[11px] font-bold py-1.5 px-3 rounded-xl border bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-all"
                  >
                    Report Stolen
                  </button>
                )}

                {item.status === 'endangered' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarkSafe(item)}
                      className="text-[11px] font-bold py-1.5 px-3 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                    >
                      Mark Safe
                    </button>
                    <button
                      onClick={() => handleReportStolen(item)}
                      className="text-[11px] font-bold py-1.5 px-3 rounded-xl border bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-all"
                    >
                      Report Stolen
                    </button>
                  </div>
                )}

                {item.status === 'missing' && (
                  <button
                    onClick={() => { setSelectedDetail(item); setCarouselIdx(0); }}
                    className="text-[11px] font-bold py-1.5 px-3 rounded-xl border bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all flex items-center gap-1"
                  >
                    <MdVisibility className="text-sm" /> View Case
                  </button>
                )}

                {item.status === 'recovered' && (
                  <button
                    onClick={() => { setSelectedDetail(item); setCarouselIdx(0); }}
                    className="text-[11px] font-bold py-1.5 px-3 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-1"
                  >
                    <MdDescription className="text-sm" /> View Certificate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ QR Code Modal ═══ */}
      {selectedForQr && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#140e09] border border-white/20 rounded-2xl max-w-md w-full p-6 text-center animate-fade-in">
            <h3 className="font-display font-bold text-xl text-white mb-1">
              Digital Heritage Identity Tag
            </h3>
            <p className="text-xs text-heritage-400 mb-2 font-mono">
              Digital Heritage ID: <span className="text-saffron-400 font-bold">{selectedForQr.id}</span>
            </p>
            <p className="text-sm text-white mb-4">{selectedForQr.name}</p>

            <div ref={qrRef} className="bg-white p-6 rounded-2xl inline-block mx-auto mb-4 shadow-xl">
              <QRCodeCanvas
                value={`https://heritagetrace.gov.in/artefact/${selectedForQr.id}`}
                size={180}
                level="H"
                includeMargin={false}
              />
            </div>

            <p className="text-[11px] text-heritage-300 mb-6">
              Attach this tamper-evident micro-tag to the physical idol pedestal for immediate audit scans by ASI & temple trustees.
            </p>

            <div className="flex justify-between gap-3">
              <button
                onClick={() => setSelectedForQr(null)}
                className="btn-secondary text-xs flex-1 py-2"
              >
                Close
              </button>
              <button
                onClick={handleDownloadQR}
                className="btn-primary text-xs flex-1 py-2 flex items-center justify-center gap-1.5"
              >
                <MdDownload /> Download PNG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Detail View Modal ═══ */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#140e09] border border-white/20 rounded-3xl max-w-3xl w-full p-6 sm:p-8 relative animate-fade-in my-8">
            <button
              onClick={() => setSelectedDetail(null)}
              className="absolute top-4 right-4 text-heritage-400 hover:text-white p-2 rounded-full bg-white/10"
            >
              <MdClose className="text-2xl" />
            </button>

            {/* Image Carousel */}
            <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-black/60 mb-6">
              <img
                src={selectedDetail.image || selectedDetail.imageUrl}
                alt={selectedDetail.name}
                className="w-full h-full object-cover"
              />
              {/* Carousel controls placeholder if multiple images existed */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                <button className="w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-all">
                  <MdChevronLeft />
                </button>
                <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full font-mono">
                  1 / 1
                </span>
                <button className="w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-all">
                  <MdChevronRight />
                </button>
              </div>
              <StatusBadge status={selectedDetail.status} className="absolute top-3 right-3" />
            </div>

            {/* Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="font-display font-black text-2xl text-white mb-1">{selectedDetail.name}</h2>
                <p className="text-saffron-400 font-mono text-sm mb-3">{selectedDetail.id} • {selectedDetail.period}</p>
                <p className="text-heritage-300 text-sm leading-relaxed">{selectedDetail.description}</p>
              </div>
              <div className="space-y-2 text-xs text-heritage-400 bg-black/30 p-4 rounded-xl border border-white/5">
                <p><strong className="text-heritage-200">Material:</strong> {selectedDetail.material}</p>
                <p><strong className="text-heritage-200">Dimensions:</strong> {selectedDetail.dimensions}</p>
                <p><strong className="text-heritage-200">Temple/Sanctuary:</strong> {selectedDetail.origin || selectedDetail.templeName}</p>
                <p><strong className="text-heritage-200">Location:</strong> {selectedDetail.currentLocation}</p>
                <p><strong className="text-heritage-200">Registered:</strong> {selectedDetail.registeredAt}</p>
                {selectedDetail.inscriptionText && (
                  <p><strong className="text-heritage-200">Inscription:</strong> {selectedDetail.inscriptionText}</p>
                )}
              </div>
            </div>

            {/* Status History Timeline */}
            <div className="mb-6">
              <h3 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
                <MdHistory className="text-saffron-400" /> Status History
              </h3>
              <div className="relative pl-6 space-y-4">
                <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-white/10" />
                {(selectedDetail.statusHistory || []).map((entry, i) => {
                  const statusIcon = {
                    registered: { color: 'bg-saffron-500', icon: '📋' },
                    reported_stolen: { color: 'bg-rose-500', icon: '🚨' },
                    recovered: { color: 'bg-emerald-500', icon: '✅' },
                    marked_safe: { color: 'bg-emerald-500', icon: '🛡️' },
                    missing: { color: 'bg-rose-500', icon: '🚨' },
                    endangered: { color: 'bg-amber-500', icon: '⚠️' },
                  }[entry.status] || { color: 'bg-white/30', icon: '📌' };

                  return (
                    <div key={i} className="relative flex items-start gap-3">
                      <div className={`absolute -left-4 w-3 h-3 rounded-full ${statusIcon.color} ring-2 ring-[#140e09] flex-shrink-0`} />
                      <div className="flex-1 bg-black/30 p-3 rounded-xl border border-white/5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white uppercase">
                            {statusIcon.icon} {entry.status.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] text-heritage-400 font-mono">{entry.date}</span>
                        </div>
                        <p className="text-[11px] text-heritage-300">{entry.note}</p>
                      </div>
                    </div>
                  );
                })}
                {(!selectedDetail.statusHistory || selectedDetail.statusHistory.length === 0) && (
                  <p className="text-heritage-400 text-xs">No status history recorded yet.</p>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedDetail(null)}
              className="btn-secondary text-sm w-full py-3"
            >
              Close Detail View
            </button>
          </div>
        </div>
      )}

      {/* ═══ Add Artefact Form Modal ═══ */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#140e09] border border-white/20 rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative animate-fade-in my-8">
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 text-heritage-400 hover:text-white p-2 rounded-full bg-white/10"
            >
              <MdClose className="text-2xl" />
            </button>

            <h2 className="font-display font-bold text-2xl text-white mb-1">Register New Artefact</h2>
            <p className="text-heritage-400 text-sm mb-6">A unique Digital Heritage ID (HT-XXXXX) will be auto-generated.</p>

            <form onSubmit={handleSubmitArtefact} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-heritage-200 mb-1.5 uppercase tracking-wider">Artefact Name *</label>
                  <input
                    type="text"
                    value={newArtefact.name}
                    onChange={(e) => setNewArtefact((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Bronze Nataraja"
                    className="input-field text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-heritage-200 mb-1.5 uppercase tracking-wider">Period / Dynasty</label>
                  <input
                    type="text"
                    value={newArtefact.period}
                    onChange={(e) => setNewArtefact((p) => ({ ...p, period: e.target.value }))}
                    placeholder="e.g. 11th Century Chola Dynasty"
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-heritage-200 mb-1.5 uppercase tracking-wider">Material</label>
                  <input
                    type="text"
                    value={newArtefact.material}
                    onChange={(e) => setNewArtefact((p) => ({ ...p, material: e.target.value }))}
                    placeholder="e.g. Panchaloha Bronze"
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-heritage-200 mb-1.5 uppercase tracking-wider">Dimensions</label>
                  <input
                    type="text"
                    value={newArtefact.dimensions}
                    onChange={(e) => setNewArtefact((p) => ({ ...p, dimensions: e.target.value }))}
                    placeholder="e.g. 122 cm × 94 cm × 32 cm"
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-heritage-200 mb-1.5 uppercase tracking-wider">Temple / Sanctuary</label>
                <input
                  type="text"
                  value={newArtefact.templeName}
                  onChange={(e) => setNewArtefact((p) => ({ ...p, templeName: e.target.value }))}
                  placeholder="e.g. Brihadeeswara Temple, Thanjavur"
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-heritage-200 mb-1.5 uppercase tracking-wider">Description</label>
                <textarea
                  value={newArtefact.description}
                  onChange={(e) => setNewArtefact((p) => ({ ...p, description: e.target.value }))}
                  rows="3"
                  placeholder="Detailed description of the artefact..."
                  className="input-field text-sm leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-heritage-200 mb-1.5 uppercase tracking-wider">Inscription Text</label>
                <textarea
                  value={newArtefact.inscriptionText}
                  onChange={(e) => setNewArtefact((p) => ({ ...p, inscriptionText: e.target.value }))}
                  rows="2"
                  placeholder="Any inscription or epigraphic text on the artefact..."
                  className="input-field text-sm leading-relaxed"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-heritage-200 mb-1.5 uppercase tracking-wider">Images</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="artefact-images"
                />
                <label
                  htmlFor="artefact-images"
                  className="block border-2 border-dashed border-white/20 hover:border-saffron-500/50 rounded-xl p-4 text-center cursor-pointer bg-black/30 hover:bg-black/50 transition-all"
                >
                  <MdAdd className="text-2xl text-saffron-400 mx-auto mb-1" />
                  <p className="text-xs text-heritage-300">Click to upload images (max 5MB each)</p>
                </label>
                {uploadedImages.length > 0 && (
                  <div className="flex gap-3 mt-3 flex-wrap">
                    {uploadedImages.map((img, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10">
                        <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setUploadedImages((prev) => prev.filter((_, j) => j !== i))}
                          className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary text-sm">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-sm px-8">
                  <MdCheckCircle className="text-lg" /> Register Artefact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TempleAdminDashboard;
