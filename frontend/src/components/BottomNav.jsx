import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Award } from 'lucide-react';

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const navItems = [
        { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Academy', path: '/courses', icon: BookOpen },
        { name: 'Wallet', path: '/grants', icon: Award },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden px-4 pb-6 pt-2">
            <div className="mx-auto max-w-lg bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl shadow-black/40 flex items-center justify-around p-2">
                {navItems.map((item) => {
                    const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path.slice(0, -1)));
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.name}
                            onClick={() => navigate(item.path)}
                            className="flex flex-col items-center justify-center py-2 px-3 relative group"
                        >
                            {isActive && (
                                <div className="absolute -top-1 w-1 h-1 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                            )}
                            <Icon
                                className={`w-6 h-6 mb-1 transition-all duration-300 ${isActive ? 'text-brand-400 scale-110' : 'text-slate-500 group-active:scale-90'}`}
                            />
                            <span className={`text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${isActive ? 'text-white' : 'text-slate-600'}`}>
                                {item.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
