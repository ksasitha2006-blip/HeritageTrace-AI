import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineSearch,
  HiOutlineShieldCheck,
  HiOutlineGlobe,
  HiOutlineArrowRight,
  HiOutlineSparkles,
} from 'react-icons/hi';
import {
  MdAccountBalance,
  MdSearch,
  MdVerifiedUser,
  MdAdminPanelSettings,
  MdFingerprint,
  MdOutlineSecurity,
  MdClose,
} from 'react-icons/md';
import { GiIndianPalace } from 'react-icons/gi';
import { useArtefacts } from '../context/ArtefactContext';
import StatusBadge from '../components/StatusBadge';

const HomePage = () => {
  const navigate = useNavigate();
  const { artefacts, setCurrentRole } = useArtefacts();
  const [selectedArtefact, setSelectedArtefact] = useState(null);

  useEffect(() => {
    if (!selectedArtefact) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSelectedArtefact(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selectedArtefact]);

  // Compute live stats
  const total = artefacts.length;
  const safe = artefacts.filter((a) => a.status === 'safe').length;
  const missing = artefacts.filter((a) => a.status === 'missing').length;
  const recovered = artefacts.filter((a) => a.status === 'recovered').length;

  const handleRoleClick = (roleKey) => {
    setCurrentRole(roleKey);
    navigate('/login');
  };

  const rolePortals = [
    {
      id: 'temple-admin',
      title: 'Temple Admin',
      subtitle: 'Cataloguing & Physical Stewardship',
      icon: MdAccountBalance,
      color: 'from-amber-500/20 to-amber-900/30 text-amber-400 border-amber-500/30',
      badge: 'Temple Trust',
      desc: 'Create immutable digital records, upload high-res imagery, log ritual movements, and instantly flag suspicious disappearances.',
      path: '/temple-dashboard',
    },
    {
      id: 'investigator',
      title: 'Investigator / Law Enforcement',
      subtitle: 'AI Visual Match & Seizure Processing',
      icon: MdSearch,
      color: 'from-blue-500/20 to-blue-900/30 text-blue-400 border-blue-500/30',
      badge: 'DRI / Police / Customs',
      desc: 'Upload confiscated contraband at ports or checkpoints and run sub-second AI visual feature matching against stolen art registries.',
      path: '/investigator-dashboard',
    },
    {
      id: 'asi-expert',
      title: 'ASI Expert',
      subtitle: 'Archaeological Survey of India',
      icon: MdVerifiedUser,
      color: 'from-emerald-500/20 to-emerald-900/30 text-emerald-400 border-emerald-500/30',
      badge: 'Epigraphists & Curators',
      desc: 'Forensic metallurgical inspection, stylistic era assessment, and issuing official Certificate of Authenticity (COA) dockets.',
      path: '/asi-verification',
    },
    {
      id: 'authority-admin',
      title: 'System Admin',
      subtitle: 'National Command & Interpol Liaison',
      icon: MdAdminPanelSettings,
      color: 'from-purple-500/20 to-purple-900/30 text-purple-400 border-purple-500/30',
      badge: 'Ministry of Culture',
      desc: 'Generate Interpol Red/Yellow Notices, broadcast emergency alerts across border posts, and maintain national audit trails.',
      path: '/authority-dashboard',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-saffron-600/15 via-amber-700/5 to-transparent rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="absolute top-[800px] -left-60 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute top-[1400px] -right-60 w-96 h-96 bg-saffron-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      {/* Hero Section */}
      <section className="pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative">
        {/* National Initiative Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-saffron-500/10 border border-saffron-500/30 text-saffron-300 text-xs sm:text-sm font-semibold mb-8 backdrop-blur-md shadow-lg shadow-saffron-950/40">
          <GiIndianPalace className="text-lg text-saffron-400" />
          <span>National Digital Protection Network for Indian Antiquities</span>
          <span className="w-1.5 h-1.5 rounded-full bg-saffron-400 animate-ping"></span>
        </div>

        {/* Hero Title */}
        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-5xl mx-auto mb-6 leading-[1.1]">
          Guardians of Our <span className="section-heading">Sacred Legacy</span>, Powered by{' '}
          <span className="gradient-text">AI Vision</span>.
        </h1>

        {/* Hero Subtitle */}
        <p className="text-heritage-200 text-base sm:text-xl max-w-3xl mx-auto mb-10 leading-relaxed font-light">
          HeritageTrace AI assigns immutable digital identities to sacred idols, sculptures, and manuscripts.
          Connecting temple trusts, law enforcement, the Archaeological Survey of India (ASI), and Interpol to prevent trafficking and repatriate looted treasures.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link to="/artefacts" className="btn-primary text-base sm:text-lg px-8 py-4 w-full sm:w-auto">
            <HiOutlineSearch className="text-xl" /> Browse National Registry
          </Link>
          <Link to="/login" className="btn-secondary text-base sm:text-lg px-8 py-4 w-full sm:w-auto">
            <MdFingerprint className="text-xl text-saffron-400" /> Access Role Workspace
          </Link>
        </div>

        {/* Live National Registry Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
          <div className="text-center p-3 border-r border-white/5 last:border-0">
            <p className="font-display text-3xl sm:text-4xl font-black text-white mb-1">{total}</p>
            <p className="text-xs uppercase tracking-wider text-heritage-300 font-medium">Tracked Artefacts</p>
          </div>
          <div className="text-center p-3 border-r border-white/5 last:border-0">
            <p className="font-display text-3xl sm:text-4xl font-black text-emerald-400 mb-1">{safe}</p>
            <p className="text-xs uppercase tracking-wider text-heritage-300 font-medium">Safe in Sanctuaries</p>
          </div>
          <div className="text-center p-3 border-r border-white/5 last:border-0">
            <p className="font-display text-3xl sm:text-4xl font-black text-rose-400 mb-1">{missing}</p>
            <p className="text-xs uppercase tracking-wider text-heritage-300 font-medium">Active Missing / Stolen</p>
          </div>
          <div className="text-center p-3">
            <p className="font-display text-3xl sm:text-4xl font-black text-saffron-400 mb-1">{recovered}</p>
            <p className="text-xs uppercase tracking-wider text-heritage-300 font-medium">Repatriated / Recovered</p>
          </div>
        </div>
      </section>

      {/* Role-Based Portals Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-saffron-400 font-mono text-xs uppercase tracking-widest mb-2">
            <HiOutlineSparkles /> Multi-Agency Coordination Hub
          </div>
          <h2 className="section-heading">Operational Role Portals</h2>
          <p className="text-heritage-300 text-sm sm:text-base max-w-2xl mx-auto mt-2">
            Tailored digital workflows for every stakeholder in India’s antiquities preservation ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rolePortals.map((portal) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.id}
                onClick={() => handleRoleClick(portal.id, portal.path)}
                className="glass-card hover:bg-white/[0.07] border border-white/10 hover:border-saffron-500/40 p-8 rounded-2xl cursor-pointer transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${portal.color} flex items-center justify-center border group-hover:scale-110 transition-transform`}>
                    <Icon className="text-3xl" />
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-heritage-200">
                    {portal.badge}
                  </span>
                </div>

                <h3 className="font-display text-2xl font-bold text-white mb-1 group-hover:text-saffron-300 transition-colors">
                  {portal.title}
                </h3>
                <p className="text-xs text-saffron-400 font-mono mb-3 uppercase tracking-wider">
                  {portal.subtitle}
                </p>
                <p className="text-heritage-300 text-sm leading-relaxed mb-6">
                  {portal.desc}
                </p>

                <div className="flex items-center text-sm font-semibold text-saffron-400 group-hover:translate-x-1 transition-transform gap-1">
                  Launch Workspace <HiOutlineArrowRight />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Masterpieces from Registry */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-saffron-400 font-mono text-xs uppercase tracking-widest mb-2">
              <MdOutlineSecurity /> National Heritage Ledger
            </div>
            <h2 className="section-heading">Featured Antiquities</h2>
            <p className="text-heritage-300 text-sm mt-1">
              High-priority catalogued artefacts monitored through the digital fingerprint repository.
            </p>
          </div>
          <Link to="/artefacts" className="btn-secondary text-sm py-2.5 px-5">
            View All ({artefacts.length}) Artefacts →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {artefacts.slice(0, 3).map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedArtefact(item)}
              className="glass-card hover:bg-white/[0.08] hover:border-saffron-500/40 p-4 rounded-2xl cursor-pointer transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-60 w-full overflow-hidden rounded-xl mb-4 bg-black/50">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono text-heritage-200">
                    ID: {item.id}
                  </div>
                </div>

                <h3 className="font-display font-bold text-xl text-white group-hover:text-saffron-300 transition-colors mb-1">
                  {item.name}
                </h3>
                <p className="text-xs text-saffron-400 font-mono mb-2">{item.period}</p>
                <p className="text-heritage-300 text-xs line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-heritage-400">
                <span>{item.material}</span>
                <span className="text-saffron-400 font-semibold group-hover:underline">Inspect Details →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Vision & Recovery Engine Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="glass-card p-8 md:p-12 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron-500/10 text-saffron-400 text-xs font-mono mb-4 border border-saffron-500/30">
                <HiOutlineSparkles /> Neural Visual Verification
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                Computer Vision Tailored for <span className="gradient-text">Indian Iconography</span>
              </h2>
              <p className="text-heritage-300 text-sm sm:text-base leading-relaxed mb-6 font-light">
                Traditional generic image search fails with ancient antiquities due to weathered stone, tarnished bronze patinas, and fractured ornamentation. HeritageTrace AI utilizes bespoke deep visual feature extraction trained on classical canons like <em>Talamana Shastra</em> and Chola metallurgy.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-saffron-500/20 text-saffron-400 mt-1">
                    <MdFingerprint className="text-xl" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Keypoint Geometry & Iconographic Alignment</h4>
                    <p className="text-heritage-400 text-xs">Identifies unique chiseled contours, mudra angles, and flame aureole geometry resistant to surface cleaning or defacement.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 mt-1">
                    <HiOutlineShieldCheck className="text-xl" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">ASI Multi-Tier Forensic Corroboration</h4>
                    <p className="text-heritage-400 text-xs">Flags seized items directly into ASI Epigraphist queues for XRF spectrometry and provenance cross-referencing.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 mt-1">
                    <HiOutlineGlobe className="text-xl" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Global Interpol Red/Yellow Notice Docket</h4>
                    <p className="text-heritage-400 text-xs">Instantly generates standardized police seizure files with high-res comparative exhibits ready for international court repatriation.</p>
                  </div>
                </div>
              </div>

              <Link to="/upload-recovered" className="btn-primary text-sm">
                Try AI Visual Search Tool →
              </Link>
            </div>

            {/* Visual AI Scan Mockup */}
            <div className="relative rounded-2xl overflow-hidden border border-saffron-500/30 bg-black/60 shadow-2xl p-4">
              <div className="relative rounded-xl overflow-hidden aspect-[4/3]">
                <img
                  src="/images/nataraja.jpg"
                  alt="AI Scanning Target"
                  className="w-full h-full object-cover"
                />
                {/* Laser scan line */}
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-saffron-400 to-transparent shadow-[0_0_15px_#f97316] animate-laser-scan z-10"></div>
                <div className="absolute inset-0 bg-saffron-500/10 pointer-events-none"></div>

                {/* Target reticles */}
                <div className="absolute top-1/4 left-1/3 w-16 h-16 border-2 border-saffron-400/80 rounded-lg flex items-center justify-center pointer-events-none">
                  <span className="text-[9px] font-mono text-saffron-300 absolute -top-4 left-0 bg-black/80 px-1 rounded">
                    Damaru (99.2%)
                  </span>
                </div>
                <div className="absolute bottom-1/4 right-1/3 w-20 h-20 border-2 border-emerald-400/80 rounded-lg flex items-center justify-center pointer-events-none">
                  <span className="text-[9px] font-mono text-emerald-300 absolute -top-4 left-0 bg-black/80 px-1 rounded">
                    Apasmara Base (98.6%)
                  </span>
                </div>

                {/* Match readout overlay */}
                <div className="absolute bottom-3 left-3 right-3 bg-black/85 backdrop-blur-md p-3 rounded-xl border border-white/10 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-emerald-400 font-bold font-mono">MATCH CONFIRMED: 98.4%</span>
                    <p className="text-white text-[11px] font-medium">Chola Nataraja (HT-49281)</p>
                  </div>
                  <span className="bg-saffron-500 text-black px-2 py-1 rounded text-[10px] font-bold">
                    FLAGGED FOR ASI
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Artefact Detail Modal */}
      {selectedArtefact && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#140e09] border border-white/20 rounded-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedArtefact(null)}
              className="absolute top-4 right-4 text-heritage-400 hover:text-white p-1 rounded-full bg-white/10"
            >
              <MdClose className="text-2xl" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl overflow-hidden bg-black/50 aspect-square">
                <img
                  src={selectedArtefact.image}
                  alt={selectedArtefact.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-saffron-400">{selectedArtefact.id}</span>
                  <StatusBadge status={selectedArtefact.status} />
                </div>

                <h3 className="font-display font-bold text-2xl text-white mb-1">
                  {selectedArtefact.name}
                </h3>
                <p className="text-xs text-saffron-300 font-mono mb-4">{selectedArtefact.period}</p>

                <div className="space-y-2 text-xs text-heritage-300 mb-6">
                  <p><strong className="text-white">Material:</strong> {selectedArtefact.material}</p>
                  <p><strong className="text-white">Dimensions:</strong> {selectedArtefact.dimensions}</p>
                  <p><strong className="text-white">Origin:</strong> {selectedArtefact.origin}</p>
                  <p><strong className="text-white">Current Status:</strong> {selectedArtefact.currentLocation}</p>
                </div>

                <p className="text-xs text-heritage-400 leading-relaxed mb-6">
                  {selectedArtefact.description}
                </p>

                <Link
                  to="/artefacts"
                  className="btn-primary w-full text-center text-xs py-2.5"
                  onClick={() => setSelectedArtefact(null)}
                >
                  View in Registry Explorer
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
