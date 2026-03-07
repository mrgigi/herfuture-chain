import { useState, useEffect } from 'react';
import { Wallet, BookOpen, ArrowRight, CheckCircle, ExternalLink, Trophy } from 'lucide-react';
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

            <main className={`${sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64'} flex-grow p-4 md:p-8 max-w-7xl transition-all duration-300`}>
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold uppercase tracking-wider text-center">
                        {error}
                    </div>
                )}

                {/* Progress Card Section */}
                <div className="mb-8 mt-2 p-1 rounded-[32px] bg-gradient-to-tr from-brand-500/20 to-indigo-500/20 border border-white/5 shadow-2xl overflow-hidden">
                    <div className="bg-slate-900/90 backdrop-blur-xl rounded-[30px] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-brand-500/20 flex-shrink-0 rotate-3 group-hover:rotate-0 transition-transform">
                            {progress.percentage}%
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                                You've mastered <span className="text-brand-400">{progress.completedCount}</span> of <span className="text-brand-400">{progress.totalModules}</span> modules.
                            </h2>
                            <p className="text-slate-400 text-sm max-w-lg mb-6 leading-relaxed">
                                Jump back in and continue your journey. Each module completed unlocks on-chain grants and new skills.
                            </p>
                            <button
                                onClick={() => navigate('/courses')}
                                className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg shadow-brand-600/20 hover:scale-105 active:scale-95"
                            >
                                {buttonText}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Curriculum Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-brand-400" />
                                Curriculum Path
                            </h3>
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
                                const modulesPerTrack = Math.ceil(progress.totalModules / Math.max(1, courses.length));
                                const trackStartThreshold = idx * modulesPerTrack;
                                const isDone = progress.completedCount >= trackStartThreshold + modulesPerTrack;
                                const isActive = progress.completedCount >= trackStartThreshold && !isDone;

                                return (
                                    <div
                                        key={course.id}
                                        onClick={() => (isActive || isDone) && navigate('/courses')}
                                        className={`group p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${isActive
                                            ? 'bg-brand-500/5 border-brand-500/20 ring-1 ring-brand-500/10 shadow-sm shadow-brand-500/10'
                                            : isDone
                                                ? 'bg-slate-900 border-slate-700 hover:bg-slate-800'
                                                : 'bg-slate-950/50 border-white/5 opacity-50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-5">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-sm transition-transform group-hover:-translate-y-1 ${isActive ? 'bg-brand-500 text-white' : isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                                                    }`}>
                                                    {isDone ? <CheckCircle className="w-5 h-5" /> : (idx + 1)}
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1 group-hover:text-slate-400 transition-colors">Track {course.track_number}</div>
                                                    <h4 className={`text-base font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>{course.title}</h4>
                                                </div>
                                            </div>

                                            {isActive && (
                                                <div className="hidden sm:flex items-center gap-4 text-brand-400 text-xs font-medium">
                                                    <span>Active</span>
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            )}
                                            {isDone && (
                                                <div className="hidden sm:flex items-center gap-4 text-emerald-400/50 text-xs font-medium">
                                                    <span>Completed</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Info Column */}
                    <div className="space-y-6">
                        {/* Financial Card: Payout Ledger & Grants */}
                        <div className="bg-slate-900 border border-slate-800 rounded-[28px] p-8 space-y-8">
                            {/* Total Grants */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                        <Wallet className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/5 py-1.5 px-3 rounded-full border border-emerald-500/10">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Verified
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Grants Received</span>
                                <div className="text-4xl font-bold text-white mt-1">
                                    ${totalGrantsReceived}<span className="text-lg text-slate-500">.00</span>
                                </div>
                            </div>

                            <div className="h-px bg-slate-800/60 w-full" />

                            {/* Next Milestone */}
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">Next Milestone</span>
                                <div className="text-3xl font-bold text-white mb-1">$150<span className="text-sm font-medium text-slate-500 ml-1">cUSD</span></div>
                                <p className="text-xs text-slate-500 mb-6 leading-relaxed">Unlock after completing Track 2 curriculum.</p>
                                <button
                                    onClick={() => navigate('/grants')}
                                    className="w-full py-3.5 rounded-xl border border-slate-800 bg-slate-950/50 flex items-center justify-center gap-2 text-xs font-bold text-slate-100 hover:bg-slate-800 transition-all border-dashed"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    VIEW PAYOUT LEDGER
                                </button>
                            </div>
                        </div>

                        {/* Skills Hub */}
                        <div className="bg-slate-900 border border-slate-800 rounded-[28px] p-8">
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Trophy className="w-3.5 h-3.5 text-brand-400" />
                                Skills Hub
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-slate-950/30 border border-white/5 flex items-center justify-between">
                                    <div className="text-sm font-medium text-slate-400">Certificates Earned</div>
                                    <div className="text-lg font-bold text-brand-400">{Math.floor(progress.completedCount / 4)}</div>
                                </div>
                                <button
                                    onClick={() => navigate('/certificates')}
                                    className="w-full py-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-bold hover:bg-brand-500 hover:text-white transition-all"
                                >
                                    My Credentials
                                </button>
                            </div>
                        </div>

                        {/* Network Status */}
                        <div className="px-5 py-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between shadow-2xl">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[2px]">Network</span>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-celo" />
                                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Mainnet Protocol</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
