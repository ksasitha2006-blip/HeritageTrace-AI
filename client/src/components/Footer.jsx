import { GiIndianPalace } from 'react-icons/gi';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#0b0805] border-t border-white/10 mt-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <GiIndianPalace className="text-3xl text-saffron-400" />
              <span className="font-display font-bold text-xl gradient-text">
                HeritageTrace AI
              </span>
            </div>
            <p className="text-heritage-300 text-sm leading-relaxed max-w-md">
              A national digital identity, visual intelligence, and recovery network for vulnerable Indian heritage artefacts. Preserving our civilizational legacy through immutable provenance and AI vision.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-heritage-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              Simulated integration (demo)
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-heritage-400 hover:text-saffron-400 text-sm transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/artefacts" className="text-heritage-400 hover:text-saffron-400 text-sm transition-colors">
                  National Registry Explorer
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-heritage-400 hover:text-saffron-400 text-sm transition-colors">
                  Analytics & Metrics
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-heritage-400 hover:text-saffron-400 text-sm transition-colors">
                  About Mission & Technology
                </Link>
              </li>
            </ul>
          </div>

          {/* Workspaces */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-wider">Portals</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/temple-dashboard" className="text-heritage-400 hover:text-saffron-400 text-sm transition-colors">
                  Temple Administration
                </Link>
              </li>
              <li>
                <Link to="/investigator-dashboard" className="text-heritage-400 hover:text-saffron-400 text-sm transition-colors">
                  Investigator AI Search
                </Link>
              </li>
              <li>
                <Link to="/asi-verification" className="text-heritage-400 hover:text-saffron-400 text-sm transition-colors">
                  ASI Expert Workbench
                </Link>
              </li>
              <li>
                <Link to="/authority-dashboard" className="text-heritage-400 hover:text-saffron-400 text-sm transition-colors">
                  Central Authority
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-heritage-400 text-xs gap-4">
          <p>© {new Date().getFullYear()} HeritageTrace AI. Developed for Cultural Heritage Preservation.</p>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer">Security Protocol</span>
            <span className="hover:text-white cursor-pointer">Antiquities Act Compliance</span>
            <span className="hover:text-white cursor-pointer">API Documentation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
