import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlinePlus,
  HiOutlineSparkles,
  HiOutlineShieldCheck,
  HiOutlineExclamation,
  HiOutlinePrinter,
} from 'react-icons/hi';
import { MdClose, MdLocationOn, MdCalendarToday, MdOutlineMuseum } from 'react-icons/md';
import { useArtefacts } from '../context/ArtefactContext';
import StatusBadge from '../components/StatusBadge';

const ArtefactsPage = () => {
  const { artefacts, updateArtefactStatus } = useArtefacts();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedArtefact, setSelectedArtefact] = useState(null);
  const [certificateModal, setCertificateModal] = useState(false);

  useEffect(() => {
    if (!selectedArtefact && !certificateModal) return undefined;
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return;
      setSelectedArtefact(null);
      setCertificateModal(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selectedArtefact, certificateModal]);

  const statuses = ['all', 'safe', 'missing', 'endangered', 'recovered'];
  const categories = [
    'all',
    'sculpture',
    'painting',
    'manuscript',
    'coin',
    'jewellery',
    'textile',
    'pottery',
    'other',
  ];

  // Filter artefacts
  const filteredArtefacts = artefacts.filter((item) => {
    const matchesSearch =
      (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.period || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.material || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.origin || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.id || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory =
      categoryFilter === 'all' || (item.category || 'sculpture').toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleToggleStatus = (artefact) => {
    const newStatus = artefact.status === 'safe' ? 'missing' : 'safe';
    updateArtefactStatus(artefact.id, newStatus);
    setSelectedArtefact((prev) => (prev ? { ...prev, status: newStatus } : null));
  };

  return (
    <div className="min-h-screen pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-saffron-400 font-mono text-xs uppercase tracking-widest mb-1">
            <HiOutlineSparkles /> Central Antiquities Repository
          </div>
          <h1 className="section-heading">National Heritage Registry</h1>
          <p className="text-heritage-300 text-sm mt-1">
            Browse, search, and monitor verified digital fingerprints for sacred Indian artefacts.
          </p>
        </div>
        <Link to="/register-artefact">
          <button className="btn-primary text-sm">
            <HiOutlinePlus className="text-lg" /> Register New Artefact
          </button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 sm:p-6 mb-8 border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search Box */}
          <div className="md:col-span-6 relative">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-heritage-400 text-lg" />
            <input
              type="text"
              placeholder="Search by name, era (Chola, Gupta), material, or ID..."
              className="input-field pl-11 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-heritage-400 hover:text-white text-xs px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="md:col-span-3 relative">
            <HiOutlineFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-heritage-400 text-lg" />
            <select
              className="input-field pl-11 pr-8 appearance-none cursor-pointer text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map((s) => (
                <option key={s} value={s} className="bg-[#18110b] text-white">
                  {s === 'all' ? 'All Statuses' : `Status: ${s.charAt(0).toUpperCase() + s.slice(1)}`}
                </option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              className="input-field appearance-none cursor-pointer text-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-[#18110b] text-white">
                  {c === 'all' ? 'All Categories' : `Category: ${c.charAt(0).toUpperCase() + c.slice(1)}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Filter Counts */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/10 text-xs text-heritage-300">
          <span className="font-semibold text-white">Showing {filteredArtefacts.length} of {artefacts.length} items</span>
          <span className="text-white/20">•</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-full border ${statusFilter === 'all' ? 'bg-white/10 border-saffron-500/50 text-saffron-300' : 'border-white/10 hover:bg-white/5'}`}
          >
            All ({artefacts.length})
          </button>
          <button
            onClick={() => setStatusFilter('safe')}
            className={`px-2.5 py-1 rounded-full border ${statusFilter === 'safe' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'border-white/10 hover:bg-white/5'}`}
          >
            Safe ({artefacts.filter((a) => a.status === 'safe').length})
          </button>
          <button
            onClick={() => setStatusFilter('missing')}
            className={`px-2.5 py-1 rounded-full border ${statusFilter === 'missing' ? 'bg-rose-500/20 border-rose-500/50 text-rose-300' : 'border-white/10 hover:bg-white/5'}`}
          >
            Missing ({artefacts.filter((a) => a.status === 'missing').length})
          </button>
          <button
            onClick={() => setStatusFilter('recovered')}
            className={`px-2.5 py-1 rounded-full border ${statusFilter === 'recovered' ? 'bg-saffron-500/20 border-saffron-500/50 text-saffron-300' : 'border-white/10 hover:bg-white/5'}`}
          >
            Recovered ({artefacts.filter((a) => a.status === 'recovered').length})
          </button>
        </div>
      </div>

      {/* Artefact Grid */}
      {filteredArtefacts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtefacts.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedArtefact(item)}
              className="glass-card hover:bg-white/[0.08] hover:border-saffron-500/50 p-4 rounded-2xl cursor-pointer transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-64 w-full overflow-hidden rounded-xl mb-4 bg-black/60">
                  <img
                    src={item.image || item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={item.status} />
                  </div>
                  {/* ID Tag */}
                  <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono text-saffron-300 border border-white/10">
                    {item.id}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-saffron-400 font-mono mb-1">
                  <span>{item.period}</span>
                  <span>•</span>
                  <span className="capitalize">{item.category || 'Sculpture'}</span>
                </div>

                <h3 className="font-display font-bold text-xl text-white group-hover:text-saffron-300 transition-colors mb-2">
                  {item.name}
                </h3>

                <p className="text-heritage-300 text-xs line-clamp-2 leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-heritage-400">
                <span className="truncate max-w-[180px]">{item.origin || item.templeName}</span>
                <span className="text-saffron-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Inspect Dossier →
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-16 text-center max-w-xl mx-auto border border-white/10">
          <HiOutlineSearch className="text-5xl text-heritage-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2">No Artefacts Found</h3>
          <p className="text-heritage-400 text-sm mb-6">
            We couldn't find any artefacts matching your query &quot;{searchTerm}&quot;.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setCategoryFilter('all');
            }}
            className="btn-secondary text-xs"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Comprehensive Artefact Detail Modal */}
      {selectedArtefact && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#140e09] border border-white/20 rounded-3xl max-w-3xl w-full p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedArtefact(null);
                setCertificateModal(false);
              }}
              className="absolute top-5 right-5 text-heritage-400 hover:text-white p-2 rounded-full bg-white/10 transition-colors"
            >
              <MdClose className="text-2xl" />
            </button>

            {!certificateModal ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image & Photo viewer */}
                <div>
                  <div className="rounded-2xl overflow-hidden bg-black/70 aspect-square border border-white/10 mb-4 relative">
                    <img
                      src={selectedArtefact.image || selectedArtefact.imageUrl}
                      alt={selectedArtefact.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-black/80 px-2.5 py-1 rounded text-xs font-mono text-saffron-400 border border-white/10">
                      PASSPORT ID: {selectedArtefact.id}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setCertificateModal(true)}
                      className="btn-secondary flex-1 text-xs py-2.5 flex items-center justify-center gap-1.5"
                    >
                      <HiOutlinePrinter className="text-base text-saffron-400" />
                      View Certificate
                    </button>
                    <button
                      onClick={() => handleToggleStatus(selectedArtefact)}
                      className={`flex-1 text-xs py-2.5 rounded-xl font-semibold transition-all border ${
                        selectedArtefact.status === 'safe'
                          ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25'
                          : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                      }`}
                    >
                      {selectedArtefact.status === 'safe' ? 'Report Missing' : 'Mark as Safe'}
                    </button>
                  </div>
                </div>

                {/* Metadata & Provenance */}
                <div className="flex flex-col justify-between">
                  <div>
                    <div className="mb-2">
                      <StatusBadge status={selectedArtefact.status} />
                      <span className="text-xs text-heritage-400 font-mono">
                        Reg: {selectedArtefact.registeredAt || '2022-04-10'}
                      </span>
                    </div>

                    <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mb-2">
                      {selectedArtefact.name}
                    </h2>

                    <div className="space-y-2.5 text-xs text-heritage-200 bg-black/40 p-4 rounded-xl border border-white/5 mb-4">
                      <p className="flex items-center gap-2">
                        <MdCalendarToday className="text-saffron-400" />
                        <strong>Era / Dynasty:</strong> {selectedArtefact.period}
                      </p>
                      <p className="flex items-center gap-2">
                        <MdOutlineMuseum className="text-saffron-400" />
                        <strong>Material:</strong> {selectedArtefact.material || 'Panchaloha / Stone'}
                      </p>
                      <p className="flex items-center gap-2">
                        <HiOutlineSparkles className="text-saffron-400" />
                        <strong>Dimensions:</strong> {selectedArtefact.dimensions || 'Standard Canon'}
                      </p>
                      <p className="flex items-center gap-2">
                        <MdLocationOn className="text-saffron-400" />
                        <strong>Origin Sanctuary:</strong> {selectedArtefact.origin || selectedArtefact.templeName}
                      </p>
                      <p className="flex items-center gap-2">
                        <HiOutlineShieldCheck className="text-saffron-400" />
                        <strong>Current Location:</strong> {selectedArtefact.currentLocation || 'ASI Registry Custody'}
                      </p>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-1">
                        Iconography & Curatorial Notes
                      </h4>
                      <p className="text-heritage-300 text-xs leading-relaxed max-h-36 overflow-y-auto">
                        {selectedArtefact.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs">
                    <span className="text-heritage-400">Authenticated by ASI Central Node</span>
                    <Link
                      to="/investigator-dashboard"
                      className="text-saffron-400 hover:underline font-semibold"
                    >
                      Run AI Cross-Match →
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              /* Printable Certificate of Digital Registration */
              <div className="p-6 bg-[#0f0a06] border-2 border-saffron-500/40 rounded-2xl text-center relative animate-fade-in">
                <div className="border border-saffron-500/20 p-6 rounded-xl">
                  <div className="flex justify-center mb-2">
                    <div className="w-12 h-12 rounded-full bg-saffron-500/20 border border-saffron-500/50 flex items-center justify-center text-saffron-400">
                      <HiOutlineShieldCheck className="text-2xl" />
                    </div>
                  </div>
                  <h3 className="font-display text-xl font-bold text-white mb-1">
                    Archaeological Survey of India & HeritageTrace
                  </h3>
                  <p className="text-[11px] text-saffron-300 uppercase font-mono tracking-widest mb-4">
                    Official Digital Antiquity Passport
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-left text-xs bg-black/40 p-4 rounded-xl border border-white/10 mb-4">
                    <div>
                      <p className="text-heritage-400">Artefact Name:</p>
                      <p className="text-white font-bold">{selectedArtefact.name}</p>
                    </div>
                    <div>
                      <p className="text-heritage-400">National ID:</p>
                      <p className="text-saffron-400 font-mono font-bold">{selectedArtefact.id}</p>
                    </div>
                    <div>
                      <p className="text-heritage-400">Era & Dynasty:</p>
                      <p className="text-white">{selectedArtefact.period}</p>
                    </div>
                    <div>
                      <p className="text-heritage-400">Material:</p>
                      <p className="text-white">{selectedArtefact.material}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-heritage-400">Verified Sanctuary of Origin:</p>
                      <p className="text-white">{selectedArtefact.origin}</p>
                    </div>
                  </div>

                  <p className="text-[10px] text-heritage-400 mb-6">
                    This digital record constitutes prima facie evidentiary proof of Indian provenance under the Antiquities and Art Treasures Act, 1972 and 1970 UNESCO Convention.
                  </p>

                  <div className="flex justify-between items-center text-xs">
                    <button
                      onClick={() => setCertificateModal(false)}
                      className="btn-secondary text-xs py-2 px-4"
                    >
                      ← Back to Dossier
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                    >
                      <HiOutlinePrinter /> Print Certificate
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtefactsPage;
