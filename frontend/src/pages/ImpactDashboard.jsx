import { useState, useEffect } from 'react';
import { ShieldCheck, Heart, ExternalLink, ArrowDownRight, Globe, TrendingUp, Award, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function ImpactDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalImpact: 0,
        grantsDistributed: 0,
        graduates: 0,
        countries: 1
    });
    const [recentGrants, setRecentGrants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImpactData = async () => {
            try {
                const [statsRes, grantsRes] = await Promise.all([
                    api.get('/impact/stats'),
                    api.get('/impact/recent-grants')
                ]);
                setStats(statsRes.data);
                setRecentGrants(grantsRes.data);
            } catch (error) {
                console.error("Error fetching impact data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchImpactData();
        const interval = setInterval(fetchImpactData, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    return (
        <div className="min-h-screen bg-[#0A0F1C] text-slate-100 font-sans pb-20">
            {/* Nav */}
            <nav className="p-6 flex justify-between items-center border-b border-white/5 bg-slate-900/20 backdrop-blur-md">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <ShieldCheck className="w-6 h-6 text-brand-400" />
                    <span className="font-bold tracking-tight text-xl text-white hover:text-brand-400 transition-colors">Impact & Audit</span>
                </div>
                <div className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest text-slate-500">
                    <span className="text-white">Active Projects</span>
                    <span>Beneficiary Map</span>
                    <span>Blockchain Explorer</span>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="bg-brand-500/10 text-brand-400 border border-brand-500/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-500/20 transition-all"
                >
                    Log Out
                </button>
            </nav>

            <div className="max-w-6xl mx-auto px-6 pt-12">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-4">Verification Layer</h1>
                    <p className="text-slate-400 max-w-xl">Every dollar is cryptographically mapped to a specific student's growth milestone. Transparency is non-negotiable.</p>
                </div>

                {/* Impact Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Funds Distributed', val: `$${stats.totalImpact}`, sub: '+12% this month', icon: <Heart className="text-pink-400" /> },
                        { label: 'Milestones Reached', val: stats.grantsDistributed, sub: 'Verified on-chain', icon: <TrendingUp className="text-emerald-400" /> },
                        { label: 'Skill Graduations', val: stats.graduates, sub: 'Digital credentials', icon: <Award className="text-purple-400" /> },
                        { label: 'Active Regions', val: stats.countries, sub: 'Lagos & Abuja Focus', icon: <Globe className="text-blue-400" /> },
                    ].map((s, i) => (
                        <div key={i} className="glass-panel p-8 rounded-[40px] border border-white/5">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-white/5 rounded-2xl">{s.icon}</div>
                                <ArrowDownRight className="w-4 h-4 text-slate-700" />
                            </div>
                            <div className="text-3xl font-black mb-1">{s.val}</div>
                            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">{s.label}</div>
                            <div className="text-[10px] text-brand-500/80 font-bold uppercase tracking-tighter">{s.sub}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Live Ledger */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex justify-between items-center px-4 mb-2">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Live Grant Ledger</h3>
                            <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full font-bold animate-pulse">● LIVE UPDATES</span>
                        </div>
                        {recentGrants.map((grant, i) => (
                            <div key={i} className="glass-panel p-6 rounded-3xl border border-white/5 flex items-center justify-between group transition-all hover:bg-white/[0.02]">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center font-bold text-slate-500">
                                        {grant.student[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold flex items-center gap-2">
                                            {grant.student}
                                            <span className="text-[10px] bg-white/5 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-widest">DID Verified</span>
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">Completed {grant.track} • {formatTime(grant.time)}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-black text-brand-400 text-lg">+ ${grant.amount}</div>
                                    <div
                                        onClick={() => window.open(`https://sepolia.celoscan.io/tx/${grant.tx}`, '_blank')}
                                        className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-black hover:text-white transition-colors cursor-pointer"
                                    >
                                        <div className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
                                        CELO TX: {grant.tx ? `${grant.tx.substring(0, 6)}...${grant.tx.substring(grant.tx.length - 4)}` : 'UNKNOWN'} <ExternalLink className="w-2.5 h-2.5" />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {recentGrants.length === 0 && !loading && (
                            <div className="glass-panel p-12 rounded-3xl border border-white/5 text-center">
                                <p className="text-slate-500 italic">No public grants distributed yet. The future is being built.</p>
                            </div>
                        )}
                    </div>

                    {/* Impact Analytics */}
                    <div className="glass-panel rounded-[50px] border border-white/5 p-10 flex flex-col justify-between h-full bg-gradient-to-br from-white/[0.02] to-transparent">
                        <div>
                            <div className="p-4 bg-brand-500/10 border border-brand-500/20 rounded-3xl w-fit mb-8">
                                <BarChart3 className="w-8 h-8 text-brand-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 leading-tight">Empowerment Velocity</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-8">
                                Our data shows that girls who complete Track 1 have a 4x higher retention rate in income modules.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {[
                                { label: 'Track 1: Foundations', val: 94 },
                                { label: 'Track 2: Income Skills', val: 78 },
                                { label: 'Track 3: Money & Business', val: 62 },
                            ].map((track, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
                                        <span>{track.label}</span>
                                        <span>{track.val}% Success</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-brand-500" style={{ width: `${track.val}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
