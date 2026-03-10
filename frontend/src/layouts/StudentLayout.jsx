import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import BottomNav from '../components/BottomNav';

// Map routes to the active sidebar key
const getActiveFromPath = (pathname) => {
    if (pathname.startsWith('/courses')) return 'academy';
    if (pathname.startsWith('/grants')) return 'reward history';
    if (pathname.startsWith('/certificates')) return 'achievements';
    return 'dashboard';
};

export default function StudentLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const active = getActiveFromPath(location.pathname);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#060912] font-sans text-slate-800 dark:text-slate-200 flex flex-col transition-colors duration-300">
            {/* Persistent Sidebar — mounts once, never re-renders on navigation */}
            <Sidebar
                active={active}
                onCollapseChange={setSidebarCollapsed}
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />

            {/* Persistent Topbar */}
            <Topbar
                sidebarCollapsed={sidebarCollapsed}
                onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            />

            {/* Outlet: only this area swaps on navigation */}
            <main
                className={`${sidebarCollapsed ? 'md:ml-[80px]' : 'md:ml-64'} flex-grow transition-all duration-300`}
            >
                <Outlet />
            </main>

            {/* Persistent Bottom Nav (mobile) */}
            <BottomNav />
        </div>
    );
}
