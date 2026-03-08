import { useState, useEffect } from 'react';
import { ShieldCheck, Heart, ExternalLink, ArrowDownRight, Globe, TrendingUp, Award, BarChart3, Info, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
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
        <div className="min-h-screen bg-[#0A0F1C] text-slate-100 font-sans pb-32">
            {/* Nav */}
            <nav className="px-6 md:px-10 flex justify-between items-center border-b border-white/5 bg-[#0A0F1C] sticky top-0 z-50 h-16">
                <div className="flex items-center gap-2 cursor-pointer h-full py-3" onClick={() => navigate('/')}>
                    <img src="/images/logo.svg" alt="HerFuture Chain Logo" className="h-full w-auto" />
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="text-xs font-semibold text-slate-500 hover:text-white transition-colors"
                >
                    ← Back
                </button>
            </nav>

            <div className="max-w-5xl mx-auto px-6 pt-10">

                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-black tracking-tight mb-2">Impact &amp; Audit</h1>
                    <p className="text-slate-500 text-sm max-w-lg leading-relaxed">
                        Every learning milestone is cryptographically mapped to a grant disbursement. Zero intermediary fees.
                    </p>
                </div>

                {/* Top Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {[
                        { label: 'Donor Treasury', val: formatNaira(toNaira(100000)), accent: 'text-amber-400' },
                        { label: 'Audit Score', val: '99.8%', accent: 'text-brand-400' },
                        { label: 'Total Disbursed', val: formatNaira(toNaira(stats.totalImpact)), accent: 'text-emerald-400' },
                        { label: 'Milestones', val: stats.grantsDistributed, accent: 'text-fuchsia-400' },
                    ].map((s, i) => (
                        <div key={i} className="bg-slate-900 border border-white/5 rounded-2xl p-5">
                            <div className={`text-2xl font-black mb-1 ${s.accent}`}>{s.val}</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Live Ledger */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white uppercase tracking-widest">Live Grant Ledger</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                            <span className="text-[10px] text-slate-600 uppercase tracking-widest">Distributed Ledger</span>
                        </div>

                        <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
                            {(recentGrants || []).map((grant, i) => (
                                <div key={i} className="bg-slate-900 border border-white/5 rounded-2xl p-5 flex items-center justify-between hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-slate-400 flex-shrink-0">
                                            {grant.student ? grant.student[0] : '?'}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-white">{grant.student || 'Unknown'}</div>
                                            <div className="text-[11px] text-slate-500 mt-0.5">{grant.track || 'Self-Leadership'} · {formatTime(grant.time)}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black text-emerald-400">+${grant.amount || 0}</div>
                                        <button
                                            onClick={() => grant.tx && window.open(`https://sepolia.celoscan.io/tx/${grant.tx}`, '_blank')}
                                            className="text-[9px] text-slate-600 hover:text-brand-400 transition-colors font-mono"
                                        >
                                            {grant.tx ? `${grant.tx.substring(0, 8)}...` : 'PENDING'}
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {hasMore && (
                                <button
                                    onClick={loadMore}
                                    disabled={loading}
                                    className="w-full py-4 rounded-2xl border border-dashed border-white/10 text-slate-600 text-xs font-semibold hover:text-white hover:border-white/20 transition-all disabled:opacity-40"
                                >
                                    {loading ? 'Loading...' : 'Load more'}
                                </button>
                            )}

                            {recentGrants.length === 0 && !loading && (
                                <div className="bg-slate-900 border border-white/5 rounded-2xl p-16 text-center">
                                    <ShieldCheck className="w-8 h-8 text-slate-700 mx-auto mb-4" />
                                    <p className="text-slate-500 text-sm font-semibold">Platform Initializing</p>
                                    <p className="text-slate-700 text-xs mt-1 uppercase tracking-widest">Syncing with Network</p>
                                </div>
                            )}

                            {recentGrants.length > 0 && recentGrants.length < 3 && (
                                <div className="bg-slate-900 border border-dashed border-white/5 rounded-2xl p-8 text-center text-slate-600 text-xs uppercase tracking-widest">
                                    Awaiting next proof
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="space-y-6">
                        {/* Growth Velocity */}
                        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-1">Growth Velocity</h3>
                            <p className="text-[11px] text-slate-500 mb-6 leading-relaxed">Conversion from aid-recipients to digital economy participants.</p>
                            <div className="space-y-5">
                                {[
                                    { label: 'Educational Engagement', val: 94 },
                                    { label: 'Blockchain Literacy', val: 78 },
                                    { label: 'Financial Independence', val: 62 },
                                ].map((track, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1.5">
                                            <span>{track.label}</span>
                                            <span className="text-slate-300">{track.val}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-magenta-500 rounded-full" style={{ width: `${track.val}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Verifiers */}
                        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-5">Ecosystem Verifiers</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Blockchain', letter: 'B', color: 'text-indigo-400' },
                                    { label: 'UNICEF', letter: 'U', color: 'text-blue-400' },
                                    { label: 'HerFuture', letter: 'H', color: 'text-slate-100' },
                                    { label: 'Gitcoin', letter: 'G', color: 'text-emerald-400' },
                                ].map((v, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-black text-sm ${v.color}`}>{v.letter}</div>
                                        <span className="text-[11px] text-slate-400 font-semibold">{v.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <BottomNav />
        </div>
    );
}
