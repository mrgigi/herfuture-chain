import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Gateway from './pages/Gateway';
import LoginSignup from './pages/LoginSignup';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import LessonPlayer from './pages/LessonPlayer';
import Certificates from './pages/Certificates';
import Grants from './pages/Grants';
import Verifier from './pages/Verifier';

import AdminDashboard from './pages/AdminDashboard';
import ImpactDashboard from './pages/ImpactDashboard';
import AppFooter from './components/AppFooter';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/gate" element={<Gateway />} />
          <Route path="/signup" element={<LoginSignup />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/impact" element={<ImpactDashboard />} />
          <Route path="/verify" element={<Verifier />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/lesson/:lessonId" element={<LessonPlayer />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/grants" element={<Grants />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
