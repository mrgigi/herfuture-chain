import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LoginSignup from './pages/LoginSignup';
import Certificates from './pages/Certificates';
import Grants from './pages/Grants';
import Verifier from './pages/Verifier';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/signup" replace />} />
          <Route path="/signup" element={<LoginSignup />} />
          <Route path="/verify" element={<Verifier />} />

          {/* Student Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/grants" element={<Grants />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
