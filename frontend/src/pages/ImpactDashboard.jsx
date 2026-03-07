import { useState, useEffect } from 'react';
import { ShieldCheck, Heart, ExternalLink, ArrowDownRight, Globe, TrendingUp, Award, BarChart3, Info } from 'lucide-react';
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
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImpactData = async (isLoadMore = false) => {
            try {
                const [statsRes, grantsRes] = await Promise.all([
                    api.get('/impact/stats'),
                    api.get(`/impact/recent-grants?page=${isLoadMore ? page + 1 : 1}&limit=10`)
                ]);

                setStats(statsRes.data);

                if (isLoadMore) {
                    setRecentGrants(prev => [...prev, ...grantsRes.data.grants]);
                    setPage(prev => prev + 1);
                } else {
                    setRecentGrants(grantsRes.data.grants);
                    setPage(1);
                }

                setHasMore(grantsRes.data.total > (isLoadMore ? (page + 1) * 10 : 10));
            } catch (error) {
                console.error("Error fetching impact data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchImpactData();
        const interval = setInterval(() => fetchImpactData(false), 30000); // Only refresh first page automatically
        return () => clearInterval(interval);
    }, []);

    const loadMore = async () => {
        setLoading(true);
        try {
            const grantsRes = await api.get(`/impact/recent-grants?page=${page + 1}&limit=10`);
            setRecentGrants(prev => [...prev, ...grantsRes.data.grants]);
            setPage(prev => prev + 1);
            setHasMore(grantsRes.data.total > (page + 1) * 10);
        } catch (error) {
            console.error("Error loading more grants:", error);
        } finally {
            setLoading(false);
        }
    };

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
            <nav className="p-4 md:p-6 flex justify-between items-center border-b border-white/5 bg-slate-900/20 backdrop-blur-md sticky top-0 z-50 h-20">
                <div className="flex items-center gap-2 cursor-pointer group h-full" onClick={() => navigate('/')}>
                    <img src="/images/logo.svg" alt="HerFuture Chain Logo" className="h-full w-auto" />
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
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16">
                    <div>
                        <h1 className="text-5xl font-black mb-4 tracking-tighter">Impact & Audit.</h1>
                        <p className="text-slate-400 max-w-xl text-lg leading-relaxed font-medium">
                            The HerFuture transparency engine. Every learning milestone is cryptographically mapped to a grant disbursement.
                            <span className="text-white block mt-2 underline decoration-brand-500/30">Zero intermediary fees. Total visibility.</span>
                        </p>
                    </div>
                    <div className="glass-panel p-6 rounded-[32px] border border-brand-500/20 bg-brand-500/5 min-w-[240px]">
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck className="w-5 h-5 text-brand-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Audit Score</span>
                        </div>
                        <div className="text-4xl font-black text-white mb-1">99.8%</div>
                        <div className="text-[10px] text-brand-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                            Proof-of-Reserve: ACTIVE
                        </div>
                    </div>
                </div>

                {/* Macro Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
                    {[
                        { label: 'Total Value', val: `$${stats.totalImpact}`, sub: 'Direct to Wallets', icon: <Heart className="text-pink-400 w-4 h-4 md:w-5 md:h-5" /> },
                        { label: 'Milestones', val: stats.grantsDistributed, sub: 'On-Chain Proof', icon: <TrendingUp className="text-emerald-400 w-4 h-4 md:w-5 md:h-5" /> },
                        { label: 'Graduates', val: stats.graduates, sub: 'DID Credentials', icon: <Award className="text-purple-400 w-4 h-4 md:w-5 md:h-5" /> },
                        { label: 'Efficiency', val: '100%', sub: 'No Fees', icon: <Globe className="text-blue-400 w-4 h-4 md:w-5 md:h-5" /> },
                    ].map((s, i) => (
                        <div key={i} className="glass-panel p-4 md:p-8 rounded-[32px] md:rounded-[40px] border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
                            <div className="flex justify-between items-start mb-4 md:mb-6">
                                <div className="p-2 md:p-3 bg-white/5 rounded-xl md:rounded-2xl">{s.icon}</div>
                                <ArrowDownRight className="w-3 h-3 md:w-4 md:h-4 text-slate-700" />
                            </div>
                            <div className="text-xl md:text-3xl font-black mb-1 text-white">{s.val}</div>
                            <div className="text-[8px] md:text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1 md:mb-2 leading-tight">{s.label}</div>
                            <div className="text-[8px] md:text-[10px] text-slate-600 font-bold uppercase tracking-tighter hidden sm:block">{s.sub}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
                    {/* Live Ledger */}
                    <div className="lg:col-span-2 flex flex-col h-full">
                        <div className="flex justify-between items-center px-4 mb-4">
                            <div className="flex items-center gap-3">
                                <h3 className="text-sm font-black uppercase tracking-widest text-white">Live Grant Ledger</h3>
                                <div className="flex items-center gap-1.5 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                                    <span className="text-[10px] text-brand-400 font-black uppercase tracking-widest">Live Sync</span>
                                </div>
                            </div>
                            <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Powered by <span className="text-celo">Celo</span> blockchain</span>
                        </div>

                        {/* Scrollable Container with fixed max height to match the right column */}
                        <div className="space-y-4 flex-grow max-h-[600px] lg:max-h-[1050px] overflow-y-auto pr-2 md:pr-4 custom-scrollbar lg:pb-10">
                            {recentGrants.map((grant, i) => (
                                <div key={i} className="glass-panel p-5 md:p-8 rounded-[32px] border border-white/5 flex flex-col md:flex-row items-center md:items-center justify-between group transition-all hover:bg-white/[0.04] hover:scale-[1.01] hover:shadow-[0_40px_60px_rgba(0,0,0,0.3)] gap-6 md:gap-0">
                                    <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto">
                                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-[#0D1525] to-[#0A0F1C] border border-white/10 flex items-center justify-center font-black text-slate-400 text-xl md:text-2xl shadow-inner relative overflow-hidden flex-shrink-0">
                                            <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            {grant.student ? grant.student[0] : '?'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold flex items-center gap-2 md:gap-3 text-white text-base md:text-lg tracking-tight">
                                                {grant.student || 'Unknown Participant'}
                                                <div className="flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded-lg border border-emerald-500/20">
                                                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                                                    <span className="text-[8px] text-emerald-400 uppercase tracking-widest font-black">DID</span>
                                                </div>
                                            </div>
                                            <div className="text-[11px] md:text-sm text-slate-500 mt-1 font-medium flex items-center flex-wrap gap-2">
                                                <Award className="w-3.5 h-3.5 text-brand-400/60 hidden sm:block" />
                                                <span className="text-slate-300">{grant.track || 'Self-Leadership'}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-700 sm:block hidden" />
                                                <span className="text-[10px] opacity-60 ml-auto md:ml-0">{formatTime(grant.time)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center md:text-right w-full md:w-auto flex md:flex-col items-center justify-between md:justify-end gap-2 border-t md:border-0 border-white/5 pt-4 md:pt-0">
                                        <div className="font-black text-white text-xl md:text-2xl tracking-tighter text-brand-400">+ ${grant.amount || 0}</div>
                                        <button
                                            onClick={() => grant.tx && window.open(`https://sepolia.celoscan.io/tx/${grant.tx}`, '_blank')}
                                            className="px-3 py-1.5 bg-white/5 rounded-xl flex items-center gap-2 text-[9px] text-slate-400 uppercase font-black hover:text-white hover:bg-brand-500/20 transition-all border border-white/5"
                                        >
                                            <span className="text-celo">CELO</span> {grant.tx ? `${grant.tx.substring(0, 10)}...` : 'PENDING'}
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {hasMore && (
                                <button
                                    onClick={loadMore}
                                    disabled={loading}
                                    className="w-full py-6 rounded-[32px] border border-dashed border-white/10 text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] hover:text-white hover:border-brand-500/30 hover:bg-brand-500/5 transition-all text-center mb-8 disabled:opacity-50"
                                >
                                    {loading ? 'Fetching More Proof...' : 'Download More Audit Proof ↓'}
                                </button>
                            )}

                            {recentGrants.length < 3 && (
                                <div className="glass-panel p-6 md:p-10 rounded-[32px] border border-dashed border-white/10 flex flex-col items-center justify-center text-center opacity-40 grayscale group hover:opacity-100 hover:grayscale-0 transition-all duration-700 mt-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                                        <Globe className="w-5 h-5 md:w-6 md:h-6 text-slate-400 animate-spin-slow" />
                                    </div>
                                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[8px] md:text-[10px]">Awaiting Next Proof</p>
                                </div>
                            )}

                            {recentGrants.length === 0 && !loading && (
                                <div className="glass-panel p-24 rounded-3xl border border-white/5 text-center bg-white/[0.01]">
                                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                                        <ShieldCheck className="w-10 h-10 text-slate-600" />
                                    </div>
                                    <p className="text-slate-400 font-bold text-lg">Platform Initializing...</p>
                                    <p className="text-[10px] text-slate-600 mt-4 uppercase tracking-[0.3em] font-black tracking-widest">Synchronizing Indexer with Celo Alfajores</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Impact Analytics & Stakeholders */}
                    <div className="space-y-8">
                        <div className="glass-panel rounded-[50px] border border-white/5 p-10 flex flex-col justify-between h-fit bg-gradient-to-br from-white/[0.02] to-transparent relative overflow-hidden group">
                            <img
                                src="/images/community.png"
                                className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity duration-1000 blur-[2px]"
                                alt="Impact"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-[#0A0F1C] via-[#0A0F1C]/80 to-transparent" />

                            <div className="relative z-10">
                                <div className="p-4 bg-brand-500/10 border border-brand-500/20 rounded-3xl w-fit mb-8 shadow-[0_0_30px_rgba(79,70,229,0.1)]">
                                    <BarChart3 className="w-8 h-8 text-brand-400" />
                                </div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-2xl font-black leading-tight text-white tracking-tight">Growth Velocity</h3>
                                    <div className="group/info relative">
                                        <div className="p-2 bg-white/5 rounded-full cursor-help hover:bg-white/10 transition-colors">
                                            <Info className="w-4 h-4 text-slate-500" />
                                        </div>
                                        {/* Premium Explainer Tooltip */}
                                        <div className="absolute top-0 right-10 w-64 p-5 glass-panel rounded-3xl border border-white/10 shadow-2xl opacity-0 translate-x-4 pointer-events-none group-hover/info:opacity-100 group-hover/info:translate-x-0 transition-all duration-300 z-50">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-400 mb-2">How we measure growth</h4>
                                            <p className="text-[11px] text-slate-300 leading-relaxed">
                                                When live, these metrics are aggregated in real-time from the blockchain and learning records:
                                            </p>
                                            <div className="mt-3 space-y-2">
                                                <div className="text-[9px] text-slate-500"><span className="text-white font-bold">Engagement:</span> Completion rate of assigned courses.</div>
                                                <div className="text-[9px] text-slate-500"><span className="text-white font-bold">Literacy:</span> Successful on-chain interactions & wallet usage.</div>
                                                <div className="text-[9px] text-slate-500"><span className="text-white font-bold">Independence:</span> Verified job placements and micro-business launches.</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-slate-400 text-sm leading-relaxed mb-10 font-medium">
                                    Tracking the conversion rate of teen moms from aid-recipients to participants in the digital economy.
                                </p>
                            </div>

                            <div className="space-y-6 relative z-10">
                                {[
                                    { label: 'Educational Engagement', val: 94 },
                                    { label: 'Blockchain Literacy', val: 78 },
                                    { label: 'Financial Independence', val: 62 },
                                ].map((track, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
                                            <span>{track.label}</span>
                                            <span className="text-brand-400">{track.val}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner p-[1px]">
                                            <div className="h-full bg-gradient-to-r from-brand-600 to-indigo-500 rounded-full" style={{ width: `${track.val}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stakeholder Logos / Verifiers */}
                        <div className="glass-panel p-8 rounded-[40px] border border-white/5">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8 border-b border-white/5 pb-4">Ecosystem Verifiers</h4>
                            <div className="grid grid-cols-2 gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center font-black italic text-xl text-yellow-300">C</div>
                                    <span className="text-[10px] uppercase font-black tracking-widest">Celo</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center font-black text-xl text-blue-400">U</div>
                                    <span className="text-[10px] uppercase font-black tracking-widest">UNICEF</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center font-black text-xl text-slate-100">H</div>
                                    <span className="text-[10px] uppercase font-black tracking-widest">HerFuture</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center font-black text-xl text-emerald-400">G</div>
                                    <span className="text-[10px] uppercase font-black tracking-widest">Gitcoin</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
