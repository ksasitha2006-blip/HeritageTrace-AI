import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GiIndianPalace } from 'react-icons/gi';
import {
  MdAccountBalance,
  MdSearch,
  MdVerifiedUser,
  MdAdminPanelSettings,
  MdKeyboardArrowDown,
  MdMenu,
  MdClose,
  MdShield,
  MdNotifications,
} from 'react-icons/md';
import { useArtefacts } from '../context/ArtefactContext';

const roleMeta = {
  'temple-admin': { label: 'Temple Admin', icon: MdAccountBalance, color: 'text-amber-400', bg: 'bg-amber-500/15', path: '/temple-dashboard' },
  'investigator': { label: 'Investigator / Law Enforcement', icon: MdSearch, color: 'text-blue-400', bg: 'bg-blue-500/15', path: '/investigator-dashboard' },
  'asi-expert': { label: 'ASI Expert', icon: MdVerifiedUser, color: 'text-emerald-400', bg: 'bg-emerald-500/15', path: '/asi-verification' },
  'authority-admin': { label: 'System Admin', icon: MdAdminPanelSettings, color: 'text-purple-400', bg: 'bg-purple-500/15', path: '/authority-dashboard' },
  'guest': { label: 'Public Portal', icon: MdShield, color: 'text-saffron-400', bg: 'bg-saffron-500/15', path: '/login' },
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentRole, setCurrentRole, pendingMatchCount } = useArtefacts();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentRoleInfo = roleMeta[currentRole] || roleMeta.guest;
  const RoleIcon = currentRoleInfo.icon;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Artefact Registry', path: '/artefacts' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'About', path: '/about' },
  ];

  const handleSelectRole = (roleKey, path) => {
    setCurrentRole(roleKey);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <nav className="bg-[#0e0a06]/85 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-saffron-500 to-amber-600 flex items-center justify-center shadow-lg shadow-saffron-950/50 group-hover:scale-105 transition-transform">
            <GiIndianPalace className="text-2xl text-black" />
          </div>
          <div>
            <span className="font-display font-black text-2xl text-white tracking-tight flex items-center gap-1">
              HeritageTrace <span className="text-saffron-400 font-extrabold">AI</span>
            </span>
            <p className="text-[10px] text-heritage-400 tracking-widest uppercase font-mono hidden sm:block">
              Artefact Recovery &amp; Tracking System
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 bg-white/[0.03] px-3 py-1.5 rounded-full border border-white/10">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-saffron-500 text-black font-semibold shadow-md'
                    : 'text-heritage-200 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Role Switcher & Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Demo Mode Badge + Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/15 hover:border-saffron-500/50 transition-all text-sm font-medium ${currentRoleInfo.bg}`}
            >
              {/* Demo Mode badge */}
              <span className="bg-saffron-500/20 text-saffron-400 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-saffron-500/30">
                Demo
              </span>
              <RoleIcon className={`text-lg ${currentRoleInfo.color}`} />
              <span className="text-white text-xs md:text-sm font-semibold">{currentRoleInfo.label}</span>
              {pendingMatchCount > 0 && (
                <span className="relative flex items-center">
                  <MdNotifications className="text-base text-rose-400" />
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {pendingMatchCount}
                  </span>
                </span>
              )}
              <MdKeyboardArrowDown className={`text-heritage-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-[#140e09] border border-white/15 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in divide-y divide-white/5"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="px-4 py-2">
                  <p className="text-[11px] font-semibold text-heritage-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="bg-saffron-500/20 text-saffron-400 text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-saffron-500/30">
                      Demo Mode
                    </span>
                    Switch Role
                  </p>
                </div>

                <div className="py-1">
                  {Object.entries(roleMeta).filter(([k]) => k !== 'guest').map(([key, meta]) => {
                    const Icon = meta.icon;
                    const isActive = currentRole === key;
                    const descriptions = {
                      'temple-admin': 'Add & protect temple artefacts',
                      'investigator': 'Search & track stolen artefacts',
                      'asi-expert': 'Review & verify artefact matches',
                      'authority-admin': 'Manage alerts & global notices',
                    };
                    return (
                      <button
                        key={key}
                        onClick={() => handleSelectRole(key, meta.path)}
                        className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-white/5 text-left transition-colors ${isActive ? 'bg-white/5' : ''}`}
                      >
                        <div className={`p-2 rounded-lg ${meta.bg} ${meta.color}`}>
                          <Icon className="text-lg" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-white">{meta.label}</p>
                            {key === 'asi-expert' && pendingMatchCount > 0 && (
                              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 rounded-full">
                                {pendingMatchCount}
                              </span>
                            )}
                            {isActive && (
                              <span className="text-[9px] text-saffron-400 font-bold">● ACTIVE</span>
                            )}
                          </div>
                          <p className="text-[11px] text-heritage-400">{descriptions[key]}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 px-3 pb-1">
                  <Link
                    to="/role-selection"
                    onClick={() => setDropdownOpen(false)}
                    className="block text-center text-xs text-saffron-400 hover:text-saffron-300 py-1.5 font-medium"
                  >
                    View All Roles →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Quick Portal Switch / Login */}
          <Link
            to="/login"
            className="btn-primary text-xs md:text-sm py-2 px-4 shadow-none"
          >
            Sign In
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="lg:hidden flex items-center gap-2">
          {pendingMatchCount > 0 && (
            <span className="relative sm:hidden">
              <MdNotifications className="text-xl text-heritage-300" />
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {pendingMatchCount}
              </span>
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-heritage-200 hover:text-white rounded-lg bg-white/5"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#100b07] border-b border-white/10 px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === link.path ? 'bg-saffron-500/20 text-saffron-300' : 'text-heritage-200'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-white/10">
            <p className="text-xs font-semibold text-heritage-400 uppercase mb-2 flex items-center gap-2">
              <span className="bg-saffron-500/20 text-saffron-400 text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-saffron-500/30">
                Demo
              </span>
              Switch Role
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSelectRole('temple-admin', '/temple-dashboard')}
                className={`p-2.5 rounded-xl text-xs font-medium text-left flex items-center gap-2 ${currentRole === 'temple-admin' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'bg-white/5 text-heritage-200 hover:text-white'}`}
              >
                <MdAccountBalance className="text-amber-400" /> Temple
              </button>
              <button
                onClick={() => handleSelectRole('investigator', '/investigator-dashboard')}
                className={`p-2.5 rounded-xl text-xs font-medium text-left flex items-center gap-2 ${currentRole === 'investigator' ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30' : 'bg-white/5 text-heritage-200 hover:text-white'}`}
              >
                <MdSearch className="text-blue-400" /> Investigator
              </button>
              <button
                onClick={() => handleSelectRole('asi-expert', '/asi-verification')}
                className={`p-2.5 rounded-xl text-xs font-medium text-left flex items-center gap-2 relative ${currentRole === 'asi-expert' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-heritage-200 hover:text-white'}`}
              >
                <MdVerifiedUser className="text-emerald-400" /> ASI Expert
                {pendingMatchCount > 0 && (
                  <span className="bg-rose-500 text-white text-[9px] font-bold px-1 rounded-full ml-auto">{pendingMatchCount}</span>
                )}
              </button>
              <button
                onClick={() => handleSelectRole('authority-admin', '/authority-dashboard')}
                className={`p-2.5 rounded-xl text-xs font-medium text-left flex items-center gap-2 ${currentRole === 'authority-admin' ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' : 'bg-white/5 text-heritage-200 hover:text-white'}`}
              >
                <MdAdminPanelSettings className="text-purple-400" /> System Admin
              </button>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary w-full text-center text-xs py-2.5 block"
              >
                Sign In to Portal
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;