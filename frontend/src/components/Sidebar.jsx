import { Home, Award, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ active }) {
    const navigate = useNavigate();

    const menu = [
        { name: 'Dashboard', icon: Home, path: '/dashboard' },
        { name: 'Certificates', icon: Award, path: '/certificates' },
        { name: 'Grant History', icon: Database, path: '/grants' },
    ];

    return (
        <div className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col h-full fixed top-0 left-0 z-40">
            <div className="p-6 h-20 flex items-center">
                <img src="/images/logo.svg" alt="HerFuture Chain Logo" className="h-full w-auto cursor-pointer" onClick={() => navigate('/')} />
            </div>

            <nav className="flex-1 mt-6">
                {menu.map((item) => {
                    const isActive = active === item.name.toLowerCase();
                    return (
                        <button
                            key={item.name}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-6 py-4 transition-all duration-300 ${isActive
                                ? 'bg-slate-800 text-brand-400 border-r-4 border-brand-500'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-brand-400' : 'text-slate-500'}`} />
                            <span className="font-medium">{item.name}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-6">
                <div className="bg-slate-800 p-4 rounded-xl">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">My Network</p>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-sm font-medium text-slate-300"><span className="text-celo">Celo</span> Sepolia</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
