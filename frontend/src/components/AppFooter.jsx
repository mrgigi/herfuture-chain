import { Shield, HelpCircle, Book, Activity, Globe, MessageSquare } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function AppFooter() {
    const location = useLocation();

    // Determine context based on URL
    const isStudent = location.pathname.includes('/dashboard') || location.pathname.includes('/academy');
    const isAdmin = location.pathname.includes('/admin');
    const isImpact = location.pathname.includes('/impact');

    if (!isStudent && !isAdmin && !isImpact) return null;

    const accentColor = isStudent ? 'text-emerald-400' : isAdmin ? 'text-purple-400' : 'text-amber-400';
    const accentBg = isStudent ? 'bg-emerald-500/10' : isAdmin ? 'bg-purple-500/10' : 'bg-amber-500/10';

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-auto max-w-[95vw]">
            <div className="glass-panel backdrop-blur-2xl bg-slate-900/40 border border-white/5 px-6 py-3 rounded-2xl flex items-center gap-8 shadow-2xl">
                {/* Network Status */}
                <div className="flex items-center gap-3 pr-8 border-r border-white/5">
                    <div className="relative">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${isStudent ? 'bg-emerald-400' : isAdmin ? 'bg-purple-400' : 'bg-amber-400'}`}></div>
                        <div className={`absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-30 ${isStudent ? 'bg-emerald-400' : isAdmin ? 'bg-purple-400' : 'bg-amber-400'}`}></div>
                    </div>
                    <div>
                        <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] leading-none mb-1">Network Status</div>
                        <div className="text-[10px] font-bold text-white flex items-center gap-1.5 whitespace-nowrap">
                            <span className="text-celo">Celo</span> Sepolia <Shield className={`w-3 h-3 ${accentColor}`} />
                        </div>
                    </div>
                </div>

                {/* Quick Utility Links */}
                <div className="hidden md:flex items-center gap-6">
                    <button className="flex items-center gap-2 text-[10px] font-black text-white/50 hover:text-white uppercase tracking-widest transition-all group">
                        <HelpCircle className="w-3.5 h-3.5 group-hover:text-brand-400" />
                        Help
                    </button>
                    <button className="flex items-center gap-2 text-[10px] font-black text-white/50 hover:text-white uppercase tracking-widest transition-all group">
                        <Book className="w-3.5 h-3.5 group-hover:text-brand-400" />
                        Guidelines
                    </button>
                    <button className="flex items-center gap-2 text-[10px] font-black text-white/50 hover:text-white uppercase tracking-widest transition-all group">
                        <Activity className="w-3.5 h-3.5 group-hover:text-brand-400" />
                        Activity
                    </button>
                </div>

                {/* Ticker / Pulse */}
                <div className={`hidden lg:flex items-center gap-3 px-4 py-1.5 rounded-full ${accentBg} border border-white/5`}>
                    <Globe className={`w-3 h-3 ${accentColor} animate-spin-slow`} />
                    <div className="text-[9px] font-bold text-white/80 whitespace-nowrap tracking-tight">
                        Proof-of-Learn Mining Active
                    </div>
                </div>

                {/* Support Bubble (Hidden on small mobile) */}
                <button className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-lg ${isStudent ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20' : isAdmin ? 'bg-purple-500 hover:bg-purple-400 shadow-purple-500/20' : 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20'}`}>
                    <MessageSquare className="w-4 h-4 text-white" />
                </button>
            </div>
        </div>
    );
}
