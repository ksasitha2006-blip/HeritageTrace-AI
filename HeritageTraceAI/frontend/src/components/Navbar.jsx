import { Link, useLocation } from 'react-router-dom';
import { GiIndianPalace } from 'react-icons/gi';

const Navbar = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/' || location.pathname === '/role-selection';

  if (isAuthPage) return null;

  return (
    <nav className="bg-black/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/role-selection" className="flex items-center gap-2 group">
          <GiIndianPalace className="text-3xl text-saffron-500 group-hover:scale-110 transition-transform" />
          <span className="font-display font-bold text-xl text-white tracking-wide">HeritageTrace<span className="text-saffron-500">AI</span></span>
        </Link>
        <div className="flex gap-4">
          <Link to="/" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Logout</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
