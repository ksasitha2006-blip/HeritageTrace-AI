import { Link } from 'react-router-dom';
import { MdAdminPanelSettings, MdSearch, MdVerifiedUser, MdAccountBalance } from 'react-icons/md';

const roles = [
  { id: 'temple-admin', title: 'Temple Admin', icon: MdAccountBalance, path: '/temple-dashboard', desc: 'Register and manage temple artefacts' },
  { id: 'investigator', title: 'Investigator', icon: MdSearch, path: '/investigator-dashboard', desc: 'Search and upload recovered items' },
  { id: 'asi-expert', title: 'ASI Expert', icon: MdVerifiedUser, path: '/asi-verification', desc: 'Verify and authenticate recovered artefacts' },
  { id: 'authority', title: 'Authority Admin', icon: MdAdminPanelSettings, path: '/authority-dashboard', desc: 'System-wide overview and analytics' }
];

const RoleSelectionPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-saffron-900/20 to-transparent pointer-events-none"></div>
      
      <div className="text-center mb-12 z-10">
        <h1 className="heading-display text-4xl md:text-5xl mb-4">Select Your Role</h1>
        <p className="text-heritage-300 text-lg max-w-xl mx-auto">Choose your workspace to proceed to the respective dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl z-10">
        {roles.map((role) => (
          <Link key={role.id} to={role.path} className="group">
            <div className="glass-card hover:bg-white/10 transition-colors h-full flex flex-col items-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-saffron-500/20 text-saffron-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <role.icon className="text-3xl" />
              </div>
              <h2 className="text-2xl font-display font-semibold text-white mb-2">{role.title}</h2>
              <p className="text-heritage-400">{role.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RoleSelectionPage;
