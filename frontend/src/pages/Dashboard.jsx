import { useState, useEffect } from 'react';
import { Layout, Award, DollarSign, Wallet, ShieldCheck, ExternalLink, BookOpen, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { getParticipant, getProgressOverview, getCourses } from '../lib/api';

export default function Dashboard() {
    const [participant, setParticipant] = useState(null);
    const [progress, setProgress] = useState({ percentage: 0, completedCount: 0, totalModules: 16 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [courses, setCourses] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            const phone = localStorage.getItem('userPhone');
            if (!phone) {
                setLoading(false);
                setError('No user logged in');
                return;
            }

            try {
                const pData = await getParticipant(phone);
                setParticipant(pData);

                if (pData?.id) {
                    const [progData, cData] = await Promise.all([
                        getProgressOverview(pData.id),
                        getCourses()
                    ]);
                    setProgress(progData);
                    const published = Array.isArray(cData) ? cData.filter(c => c.is_published) : [];
                    setCourses(published);
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setError('Failed to fetch profile data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="h-12 w-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
    );

    const walletAddress = participant?.wallet_address || "0x000...000";
    const name = participant?.first_name || "Student";
    const remaining = progress.totalModules - progress.completedCount;

    return (
        <div className="min-h-screen bg-[#060912] font-sans text-slate-200">
            <Sidebar active="dashboard" />

            <div className="md:ml-64 flex flex-col min-h-screen">
                <Topbar title="Overview" />

                <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold uppercase tracking-wider text-center">
                            {error}
                        </div>
                    )}

                    {/* Hero Welcome Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-brand-600/20 to-indigo-600/5 rounded-[40px] border border-white/5 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-[100px] -mr-32 -mt-32 rounded-full" />

                            <div className="relative z-10 w-28 h-28 md:w-32 md:h-32 rounded-[32px] overflow-hidden border-4 border-white/10 shadow-2xl flex-shrink-0 group-hover:scale-105 transition-transform duration-700">
                                <div className="w-full h-full bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-3xl font-black text-white italic">
                                    {name.substring(0, 1)}
                                </div>
                            </div>

                            <div className="relative z-10 text-center md:text-left">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-400 mb-3 block">Participant Dashboard</span>
                                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter leading-tight">
                                    Welcome, <span className="text-brand-400">{name}</span>.
                                </h2>
                                <p className="text-slate-400 text-sm md:text-base max-w-md leading-relaxed">
                                    You've mastered <span className="text-white font-bold">{progress.completedCount}</span> of <span className="text-white font-bold">{progress.totalModules}</span> modules.
                                    Ready to unlock your next milestone?
                                </p>
                            </div>
                        </div>

                        {/* Financial Snapshot */}
                        <div className="bg-[#0D121F] rounded-[40px] border border-white/5 p-8 flex flex-col justify-center relative overflow-hidden group">
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/5 blur-[50px] rounded-full" />
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                    <Wallet className="w-5 h-5 text-emerald-400" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Blockchain Earnings</span>
                            </div>
                            <div className="text-5xl font-black text-white tracking-tighter mb-2 group-hover:scale-105 transition-transform origin-left">
                                ${progress.completedCount * 50}<span className="text-xl text-slate-500 font-medium italic">.00</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/5 py-1 px-3 rounded-full w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                CELO MAINNET READY
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Simplified Curriculum Path */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-lg font-bold text-white tracking-tight">Curriculum Path</h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-brand-500 transition-all duration-1000"
                                            style={{ width: `${progress.percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">{progress.percentage}%</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {courses.map((course, idx) => {
                                    const courseThresholds = [0, 31, 68];
                                    const threshold = courseThresholds[idx] || 0;
                                    const isDone = progress.percentage > (courseThresholds[idx + 1] || 100);
                                    const isActive = progress.percentage >= threshold && !isDone;

                                    return (
                                        <div
                                            key={course.id}
                                            onClick={() => (isActive || isDone) && navigate('/courses')}
                                            className={`group relative overflow-hidden p-6 rounded-[32px] border transition-all duration-500 cursor-pointer ${isActive
                                                    ? 'bg-brand-500/5 border-brand-500/30 ring-1 ring-brand-500/10 shadow-[0_0_30px_rgba(59,130,246,0.1)]'
                                                    : isDone
                                                        ? 'bg-slate-900/40 border-slate-800 hover:bg-slate-900/60'
                                                        : 'bg-slate-950/20 border-white/5 opacity-40 shadow-none'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between relative z-10">
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black italic shadow-inner transition-transform group-hover:scale-110 duration-500 ${isActive ? 'bg-brand-500 text-white' : isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                                                        }`}>
                                                        {isDone ? <CheckCircle className="w-6 h-6" /> : (idx + 1)}
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Track {course.track_number}</div>
                                                        <h4 className={`text-lg font-bold tracking-tight ${isActive ? 'text-white' : 'text-slate-300'}`}>{course.title}</h4>
                                                    </div>
                                                </div>

                                                {isActive && (
                                                    <div className="flex items-center gap-3">
                                                        <span className="hidden md:block text-[10px] font-black text-brand-400 tracking-widest uppercase animate-pulse">Your Current Step</span>
                                                        <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white">
                                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {courses.length === 0 && (
                                    <div className="p-12 text-center bg-slate-900/20 rounded-[40px] border border-dashed border-white/5">
                                        <div className="text-slate-500 text-sm font-medium">Curriculum structure pending activation.</div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => navigate('/courses')}
                                className="w-full py-5 rounded-[28px] bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-slate-300 text-xs font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 group"
                            >
                                Browse All Tracks <LayoutGrid className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>

                        {/* Simplified Side Actions */}
                        <div className="space-y-6">
                            <div className="bg-[#0D121F] rounded-[40px] border border-white/5 p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Award className="w-32 h-32" />
                                </div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Skills Hub</h3>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between">
                                        <div className="text-xs font-bold text-slate-300">Total Certificates</div>
                                        <div className="text-xl font-black text-brand-400">{Math.floor(progress.completedCount / 4)}</div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/certificates')}
                                        className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-400 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-brand-500/20"
                                    >
                                        My Certificates
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-[40px] border border-white/5 p-8">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">Next Grant</h3>
                                <div className="text-3xl font-black text-emerald-400 mb-2">$150<span className="text-sm font-medium text-slate-500 italic ml-1">cUSD</span></div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-6 leading-relaxed">Required: Complete Track 2</p>
                                <button
                                    onClick={() => navigate('/grants')}
                                    className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2"
                                >
                                    View Payout Ledger <ExternalLink className="w-3 h-3" />
                                </button>
                            </div>

                            <div className="px-6 py-4 rounded-3xl bg-brand-500/5 border border-brand-500/10 flex items-center gap-4">
                                <div className="w-2 h-2 rounded-full bg-celo animate-pulse" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Secure: <span className="text-celo">Celo</span></span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
