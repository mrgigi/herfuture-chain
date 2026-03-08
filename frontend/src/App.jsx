import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoadingScreen from './components/LoadingScreen';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Students = lazy(() => import('./pages/Students'));
const Technology = lazy(() => import('./pages/Technology'));
const HomeGate = lazy(() => import('./pages/HomeGate'));
const LoginSignup = lazy(() => import('./pages/LoginSignup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Courses = lazy(() => import('./pages/Courses'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const LessonPlayer = lazy(() => import('./pages/LessonPlayer'));
const Certificates = lazy(() => import('./pages/Certificates'));
const Grants = lazy(() => import('./pages/Grants'));
const Verifier = lazy(() => import('./pages/Verifier'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const ImpactDashboard = lazy(() => import('./pages/ImpactDashboard'));
const AvatarSelection = lazy(() => import('./pages/AvatarSelection'));
const StudentLayout = lazy(() => import('./layouts/StudentLayout'));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
          <ScrollToTop />
          <ErrorBoundary>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/" element={<HomeGate />} />
                <Route path="/gate" element={<HomeGate />} />
                <Route path="/students" element={<Students />} />
                <Route path="/tech" element={<Technology />} />
                <Route path="/signup" element={<LoginSignup />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/impact" element={<ImpactDashboard />} />
                <Route path="/verify" element={<Verifier />} />

                {/* Student Dashboard Shell */}
                <Route element={<StudentLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/courses/:courseId" element={<CourseDetail />} />
                  <Route path="/certificates" element={<Certificates />} />
                  <Route path="/grants" element={<Grants />} />
                </Route>

                <Route path="/lesson/:lessonId" element={<LessonPlayer />} />
                <Route path="/avatar-selection" element={<AvatarSelection />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
