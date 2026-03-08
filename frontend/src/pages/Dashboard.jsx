import { useState, useEffect } from 'react';
import { Wallet, BookOpen, ArrowRight, CheckCircle, ExternalLink, Trophy, Activity, ChevronRight } from 'lucide-react';
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
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

    const name = participant?.first_name || "Student";
    const totalGrantsReceived = progress.completedCount * 30;
    const buttonText = progress.completedCount === 0 ? "Get Started" : "Resume Learning";

    return (
        <div className="min-h-screen bg-[#060912] font-sans text-slate-200 flex flex-col">
            <Sidebar active="dashboard" onCollapseChange={setSidebarCollapsed} />
            <Topbar
                userName={name}
                sidebarCollapsed={sidebarCollapsed}
            />

            <main className={`${sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64'} flex-grow p-4 md:p-8 transition-all duration-300`}>
                <div className="max-w-7xl mx-auto space-y-8">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold uppercase tracking-wider text-center">
                            {error}
                        </div>
                    )}

                    {/* Compact Luxury Stats Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            {
                                label: 'Total Grants',
                                value: `$${totalGrantsReceived}.00`,
                                icon: <Wallet className="w-4 h-4 text-emerald-400" />,
                                badge: 'Verified',
                                badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            },
                            {
                                label: 'Learning Progress',
                                value: `${progress.percentage}%`,
                                icon: <BookOpen className="w-4 h-4 text-fuchsia-400" />,
                                badge: `${progress.completedCount}/${progress.totalModules} Units`,
                                badgeColor: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20'
                            },
                            {
                                label: 'Certificates',
                                value: Math.floor(progress.completedCount / 4),
                                icon: <Trophy className="w-4 h-4 text-magenta-400" />,
                                badge: 'On-Chain',
                                badgeColor: 'bg-magenta-500/10 text-magenta-400 border-magenta-500/20'
                            },
                            {
                                label: 'Network',
                                value: 'Protocol',
                                icon: <Activity className="w-4 h-4 text-brand-400" />,
                                badge: 'Mainnet',
                                badgeColor: 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                            }
                        ].map((stat, i) => (
                            <div key={i} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-5 rounded-[28px] hover:border-white/10 transition-all group">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2 rounded-xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">
                                        {stat.icon}
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${stat.badgeColor}`}>
                                        {stat.badge}
                                    </span>
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{stat.label}</div>
                                <div className="text-2xl font-black text-white tracking-tight">{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Main Learning Hub (Left 8 cols) */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Active Module Hero */}
                            <div className="relative group overflow-hidden rounded-[32px] p-1 bg-gradient-to-tr from-fuchsia-500/20 to-magenta-500/20 border border-white/5">
                                <div className="bg-[#0D121F]/90 backdrop-blur-3xl rounded-[30px] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-fuchsia-500/10 transition-colors pointer-events-none" />

                                    <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-fuchsia-500 to-magenta-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-fuchsia-500/40 flex-shrink-0 -rotate-3 group-hover:rotate-0 transition-all duration-500">
                                        {progress.percentage}%
                                    </div>

                                    <div className="flex-1 text-center md:text-left">
                                        <div className="flex items-center gap-3 mb-3 justify-center md:justify-start">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-fuchsia-400">Current Progress</span>
                                            <div className="w-1 h-1 rounded-full bg-slate-700" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{progress.completedCount} Modules Mastered</span>
                                        </div>
                                        <h2 className="text-3xl font-black text-white mb-4 tracking-tighter leading-none">
                                            Ready for your <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-magenta-400">next milestone?</span>
                                        </h2>
                                        <p className="text-slate-400 text-sm max-w-lg mb-8 leading-relaxed font-medium">
                                            Continue your journey where you left off. Every module completed syncs direct grants to your Celo wallet.
                                        </p>
                                        <button
                                            onClick={() => navigate('/courses')}
                                            className="px-8 py-4 bg-brand-500 hover:bg-fuchsia-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-brand-500/20 hover:shadow-fuchsia-500/30 hover:-translate-y-1 flex items-center gap-3 mx-auto md:mx-0"
                                        >
                                            {buttonText} <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Curriculum Grid (2-column dense) */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-fuchsia-500" />
                                        Curriculum Path
                                    </h3>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        {courses.length} Tracks Available
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {courses.map((course, idx) => {
                                        const modulesPerTrack = Math.ceil(progress.totalModules / Math.max(1, courses.length));
                                        const trackStartThreshold = idx * modulesPerTrack;
                                        const isDone = progress.completedCount >= trackStartThreshold + modulesPerTrack;
                                        const isActive = progress.completedCount >= trackStartThreshold && !isDone;

                                        return (
                                            <div
                                                key={course.id}
                                                onClick={() => (isActive || isDone) && navigate('/courses')}
                                                className={`group p-6 rounded-[28px] border transition-all duration-300 relative overflow-hidden ${isActive
                                                    ? 'bg-fuchsia-500/[0.03] border-fuchsia-500/30 shadow-2xl shadow-fuchsia-500/5 ring-1 ring-fuchsia-500/10'
                                                    : isDone
                                                        ? 'bg-slate-900 border-white/5 hover:border-white/10 grayscale-[0.5]'
                                                        : 'bg-black/40 border-white/[0.02] opacity-40 grayscale pointer-events-none'
                                                    } cursor-pointer`}
                                            >
                                                <div className="flex items-center gap-4 relative z-10">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-500 group-hover:scale-110 ${isActive ? 'bg-fuchsia-500 text-white shadow-xl shadow-fuchsia-500/40' : isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                                                        }`}>
                                                        {isDone ? <CheckCircle className="w-5 h-5" /> : (idx + 1)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Track {course.track_number}</div>
                                                        <h4 className={`text-sm font-black uppercase tracking-tight ${isActive ? 'text-white' : 'text-slate-400'}`}>{course.title}</h4>
                                                    </div>
                                                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-pulse" />}
                                                </div>
                                                {isActive && (
                                                    <div className="mt-4 pt-4 border-t border-fuchsia-500/10 flex items-center justify-between">
                                                        <span className="text-[9px] font-black text-fuchsia-400 uppercase tracking-widest">In Progress</span>
                                                        <ArrowRight className="w-3 h-3 text-fuchsia-400" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Secondary Context (Right 4 cols) */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Next Milestone Card */}
                            <div className="bg-[#0D121F] border border-white/5 rounded-[32px] p-8 relative overflow-hidden group">
                                <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full translate-y-1/2 translate-x-1/2" />

                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Next Reward Milestone</div>
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-4xl font-black text-white tracking-tighter">$150</span>
                                    <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">cUSD</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed mb-8">
                                    Complete <span className="text-white font-bold">Track 2</span> to trigger this automated on-chain disbursement.
                                </p>

                                <button
                                    onClick={() => navigate('/grants')}
                                    className="w-full py-4 rounded-2xl bg-white/[0.03] border border-white/5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/[0.06] hover:border-white/10 transition-all flex items-center justify-center gap-2 group/btn"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                                    View Payout Ledger
                                </button>
                            </div>

                            {/* Credentials & Support */}
                            <div className="bg-slate-900 border border-slate-800/50 rounded-[32px] overflow-hidden">
                                <div className="p-8 space-y-8">
                                    <div>
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-3">
                                            <Trophy className="w-3.5 h-3.5 text-magenta-400" />
                                            Skills Hub
                                        </h3>
                                        <div className="p-5 rounded-2xl bg-black/20 border border-white/5 flex items-center justify-between mb-4">
                                            <span className="text-xs font-bold text-slate-400">Verifiable Credentials</span>
                                            <span className="text-lg font-black text-fuchsia-400">{Math.floor(progress.completedCount / 4)}</span>
                                        </div>
                                        <button
                                            onClick={() => navigate('/certificates')}
                                            className="w-full py-4 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 text-[10px] font-black uppercase tracking-widest hover:bg-fuchsia-500 hover:text-white transition-all shadow-lg shadow-fuchsia-500/5"
                                        >
                                            My Credentials
                                        </button>
                                    </div>

                                    <div className="pt-8 border-t border-white/5">
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Support & Academy</h3>
                                        <div className="space-y-2">
                                            <button className="w-full p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/5 transition-all text-left text-xs font-bold text-slate-400 flex items-center justify-between group">
                                                Knowledge Base
                                                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                                            </button>
                                            <button className="w-full p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/5 transition-all text-left text-xs font-bold text-slate-400 flex items-center justify-between group">
                                                Community Forum
                                                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
