import { Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ArtefactsPage from './pages/ArtefactsPage';
import DashboardPage from './pages/DashboardPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import TempleAdminDashboard from './pages/TempleAdminDashboard';
import RegisterArtefactPage from './pages/RegisterArtefactPage';
import InvestigatorDashboard from './pages/InvestigatorDashboard';
import UploadRecoveredArtefactPage from './pages/UploadRecoveredArtefactPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ASIExpertVerificationPage from './pages/ASIExpertVerificationPage';
import AuthorityAdminDashboard from './pages/AuthorityAdminDashboard';
import NotFoundPage from './pages/NotFoundPage';
import { ArtefactProvider, useArtefacts } from './context/ArtefactContext';

class RouteErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Page rendering error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section role="alert" className="max-w-3xl mx-auto px-4 py-20 text-center">
          <p className="text-rose-300 font-semibold mb-4">This page could not be displayed.</p>
          <button className="btn-secondary" onClick={() => window.location.reload()}>
            Reload page
          </button>
        </section>
      );
    }
    return this.props.children;
  }
}

function AppRoutes() {
  const { loadError, backendWarning, reloadData } = useArtefacts();

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[#0b0805] text-[#f5ebe0]">
        <Navbar />
        <main className="flex-1">
          {loadError && (
            <div role="alert" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-rose-400/40 bg-rose-950/40 p-4 text-sm text-rose-100">
                <p>{loadError}</p>
                <button type="button" className="btn-secondary text-xs py-2" onClick={reloadData}>
                  Retry
                </button>
              </div>
            </div>
          )}
          {backendWarning && !loadError && (
            <p role="status" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 text-sm text-amber-100">
              Backend API unavailable; this session is using local demo data.
            </p>
          )}
          <RouteErrorBoundary>
            <Routes>
              {/* Public Portal Routes */}
 
              <Route path="/" element={<HomePage />} />
              <Route path="/artefacts" element={<ArtefactsPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/about" element={<AboutPage />} />

              {/* Authentication & Role Selection */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/role-selection" element={<RoleSelectionPage />} />

              {/* Temple Administrator Workspace */}
              <Route path="/temple-dashboard" element={<TempleAdminDashboard />} />
              <Route path="/register-artefact" element={<RegisterArtefactPage />} />

              {/* Investigator & Enforcement Portal */}
              <Route path="/investigator-dashboard" element={<InvestigatorDashboard />} />
              <Route path="/upload-recovered" element={<UploadRecoveredArtefactPage />} />
              <Route path="/search-results" element={<SearchResultsPage />} />

              {/* ASI Expert Authentication Workbench */}
              <Route path="/asi-verification" element={<ASIExpertVerificationPage />} />

              {/* Central Authority & Interpol Liaison */}
              <Route path="/authority-dashboard" element={<AuthorityAdminDashboard />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </RouteErrorBoundary>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <ArtefactProvider>
      <AppRoutes />
    </ArtefactProvider>
  );
}

export default App;
