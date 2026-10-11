import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GiIndianPalace } from 'react-icons/gi';
import {
  MdAccountBalance,
  MdSearch,
  MdVerifiedUser,
  MdAdminPanelSettings,
  MdLockOutline,
  MdMailOutline,
  MdArrowForward,
} from 'react-icons/md';
import { useArtefacts } from '../context/ArtefactContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setCurrentRole } = useArtefacts();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleCustomLogin = (e) => {
    e.preventDefault();
    // Navigate to role selection so the user can choose their workspace
    navigate('/role-selection');
  };

  const handleDemoLogin = (roleKey, targetPath) => {
    setCurrentRole(roleKey);
    navigate(targetPath);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-saffron-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="glass-card w-full max-w-xl relative z-10 p-8 sm:p-10 border border-white/15 shadow-2xl rounded-3xl">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-saffron-500 to-amber-600 flex items-center justify-center shadow-lg shadow-saffron-950/50 mb-4">
            <GiIndianPalace className="text-3xl text-black" />
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white mb-2">
            HeritageTrace <span className="gradient-text">AI</span>
          </h1>
          <p className="text-heritage-300 text-xs sm:text-sm max-w-sm">
            National Antiquity Registry & Inter-Agency Recovery Gateway
          </p>
        </div>

        {/* Regular Login Form */}
        <form className="space-y-4 mb-8" onSubmit={handleCustomLogin}>
          <div>
            <label className="block text-xs font-semibold text-heritage-200 mb-1.5 uppercase tracking-wider">
              Official Email
            </label>
            <div className="relative">
              <MdMailOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-heritage-400 text-lg" />
              <input
                type="email"
                placeholder="officer@agency.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-heritage-200 mb-1.5 uppercase tracking-wider">
              Access Token / Password
            </label>
            <div className="relative">
              <MdLockOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-heritage-400 text-lg" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10 text-sm"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full text-sm py-3 mt-2">
            Sign In with Credentials
          </button>
        </form>

        {/* Quick Demo Role Selector */}
        <div className="pt-6 border-t border-white/10">
          <p className="text-center text-xs font-mono text-saffron-400 uppercase tracking-widest mb-4">
            Quick Instant Demo Access
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleDemoLogin('temple-admin', '/temple-dashboard')}
              className="p-3 bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/40 rounded-xl text-left transition-all flex items-center gap-3 group"
            >
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
                <MdAccountBalance className="text-xl" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Temple Admin</p>
                <p className="text-[10px] text-heritage-400">Manage Sanctuary Vault</p>
              </div>
            </button>

            <button
              onClick={() => handleDemoLogin('investigator', '/investigator-dashboard')}
              className="p-3 bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/40 rounded-xl text-left transition-all flex items-center gap-3 group"
            >
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                <MdSearch className="text-xl" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Investigator</p>
                <p className="text-[10px] text-heritage-400">Seizure & AI Vision</p>
              </div>
            </button>

            <button
              onClick={() => handleDemoLogin('asi-expert', '/asi-verification')}
              className="p-3 bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/40 rounded-xl text-left transition-all flex items-center gap-3 group"
            >
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                <MdVerifiedUser className="text-xl" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">ASI Expert</p>
                <p className="text-[10px] text-heritage-400">Forensic Authentication</p>
              </div>
            </button>

            <button
              onClick={() => handleDemoLogin('authority-admin', '/authority-dashboard')}
              className="p-3 bg-white/5 hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/40 rounded-xl text-left transition-all flex items-center gap-3 group"
            >
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                <MdAdminPanelSettings className="text-xl" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Central Authority</p>
                <p className="text-[10px] text-heritage-400">Interpol Notices</p>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/role-selection"
            className="text-xs text-heritage-400 hover:text-white inline-flex items-center gap-1 transition-colors"
          >
            Explore Role Descriptions & Architecture <MdArrowForward />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
