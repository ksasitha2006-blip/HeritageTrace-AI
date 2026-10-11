import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import TempleAdminDashboard from './pages/TempleAdminDashboard';
import RegisterArtefactPage from './pages/RegisterArtefactPage';
import InvestigatorDashboard from './pages/InvestigatorDashboard';
import UploadRecoveredArtefactPage from './pages/UploadRecoveredArtefactPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ASIExpertVerificationPage from './pages/ASIExpertVerificationPage';
import AuthorityAdminDashboard from './pages/AuthorityAdminDashboard';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/role-selection" element={<RoleSelectionPage />} />
            
            {/* Temple Admin Routes */}
            <Route path="/temple-dashboard" element={<TempleAdminDashboard />} />
            <Route path="/register-artefact" element={<RegisterArtefactPage />} />
            
            {/* Investigator Routes */}
            <Route path="/investigator-dashboard" element={<InvestigatorDashboard />} />
            <Route path="/upload-recovered" element={<UploadRecoveredArtefactPage />} />
            <Route path="/search-results" element={<SearchResultsPage />} />
            
            {/* ASI Expert Route */}
            <Route path="/asi-verification" element={<ASIExpertVerificationPage />} />
            
            {/* Authority Admin Route */}
            <Route path="/authority-dashboard" element={<AuthorityAdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
