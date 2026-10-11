import { useNavigate, Link } from 'react-router-dom';
import {
  MdAccountBalance,
  MdSearch,
  MdVerifiedUser,
  MdAdminPanelSettings,
  MdArrowForward,
  MdShield,
} from 'react-icons/md';
import { useArtefacts } from '../context/ArtefactContext';

const roles = [
  {
    id: 'temple-admin',
    title: 'Temple Administrator',
    badge: 'Custodians & Trusts',
    icon: MdAccountBalance,
    path: '/temple-dashboard',
    color: 'from-amber-500/20 to-amber-950/40 text-amber-400 border-amber-500/30',
    desc: 'Register newly consecrated or conserved temple idols, log physical dimensions, and report theft or missing alerts immediately to the national database.',
    features: ['Immutable Digital Registry', 'Photo & Metadata Cataloguing', 'Status Toggle (Safe / Missing)'],
  },
  {
    id: 'investigator',
    title: 'Law Enforcement / DRI',
    badge: 'Customs, Police & DRI',
    icon: MdSearch,
    path: '/investigator-dashboard',
    color: 'from-blue-500/20 to-blue-950/40 text-blue-400 border-blue-500/30',
    desc: 'Upload photographs of seized idols from airport/seaport checkpoints. Run sub-second AI visual comparisons to flag matches for ASI confirmation.',
    features: ['AI Visual Feature Comparison', 'Seizure Logging & Dossiers', 'Direct Escalation to ASI'],
  },
  {
    id: 'asi-expert',
    title: 'ASI Expert Workbench',
    badge: 'Archaeological Survey of India',
    icon: MdVerifiedUser,
    path: '/asi-verification',
    color: 'from-emerald-500/20 to-emerald-950/40 text-emerald-400 border-emerald-500/30',
    desc: 'Perform scientific and stylistic authentication on flagged seizures. Verify metallurgical composition, iconographic canon, and sign official Certificates of Authenticity.',
    features: ['Forensic Checklist & Analysis', 'Side-by-Side Archive Overlay', 'Official Recovery Certificate'],
  },
  {
    id: 'authority-admin',
    title: 'Central Heritage Authority',
    badge: 'Ministry of Culture & Interpol Liaison',
    icon: MdAdminPanelSettings,
    path: '/authority-dashboard',
    color: 'from-purple-500/20 to-purple-950/40 text-purple-400 border-purple-500/30',
    desc: 'National oversight of recovery cases. Issue nationwide border alerts, generate Interpol Red/Yellow Notices, and export official dossiers for repatriation.',
    features: ['Interpol Red Notice Generator', 'National Emergency Alerts', 'Cross-Agency Audit Logs'],
  },
];

const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const { setCurrentRole } = useArtefacts();

  const handleSelectRole = (role) => {
    setCurrentRole(role.id);
    navigate(role.path);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-8 relative">
      <div className="text-center mb-12 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron-500/10 border border-saffron-500/30 text-saffron-400 text-xs font-mono mb-3">
          <MdShield /> Authorized Operational Portals
        </div>
        <h1 className="section-heading mb-3">Select Your Workspace</h1>
        <p className="text-heritage-300 text-sm sm:text-base leading-relaxed">
          Choose your authorized role to enter the appropriate operational workbench.
          You can switch roles at any time from the top navigation bar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl z-10 mb-12">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <div
              key={role.id}
              onClick={() => handleSelectRole(role)}
              className="glass-card hover:bg-white/[0.08] hover:border-saffron-500/50 p-6 sm:p-8 rounded-2xl cursor-pointer transition-all duration-300 group flex flex-col justify-between hover:-translate-y-1 relative"
            >
              <div>
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center border group-hover:scale-110 transition-transform`}>
                    <Icon className="text-3xl" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-heritage-200">
                    {role.badge}
                  </span>
                </div>

                <h2 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-saffron-300 transition-colors">
                  {role.title}
                </h2>
                <p className="text-heritage-300 text-xs sm:text-sm leading-relaxed mb-5">
                  {role.desc}
                </p>

                <div className="space-y-1.5 mb-6">
                  {role.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-heritage-400 font-mono">
                      <span className="text-saffron-400">✓</span> {feat}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-saffron-400 group-hover:translate-x-1 transition-transform">
                <span>Enter Workspace</span>
                <MdArrowForward className="text-base" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center text-xs text-heritage-400">
        Need to browse the open repository?{' '}
        <Link to="/artefacts" className="text-saffron-400 hover:underline font-semibold">
          Explore Public National Registry →
        </Link>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
