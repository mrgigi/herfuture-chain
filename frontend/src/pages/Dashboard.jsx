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
                    setCourses(cData.filter(c => c.is_published));
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
        <div className="min-h-screen bg-slate-950 font-sans">
            <Sidebar active="dashboard" />
            <Topbar title="Overview" />

            <main className="md:ml-64 p-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-950/30 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium">
                        {error}
                    </div>
                )}

                {/* VIP Stats Strip */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* Welcome Card */}
                    <div className="md:col-span-2 glass-panel rounded-[32px] p-8 relative overflow-hidden flex items-center gap-6 min-h-[160px]">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                            <ShieldCheck className="w-32 h-32 rotate-12 text-brand-400" />
                        </div>

                        {/* Profile Image */}
                        <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-brand-500/30 shadow-2xl flex-shrink-0 z-10 transition-transform hover:scale-105 duration-500">
                            {participant?.avatar_url ? (
                                <img src={participant.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-2xl font-black text-white italic">
                                    {name.substring(0, 1)}
                                </div>
                            )}
                        </div>

                        <div className="z-10">
                            <h2 className="text-3xl font-black text-white mb-1 leading-tight tracking-tight">Welcome, {name}!</h2>
                            <p className="text-slate-400 text-sm max-w-[240px] leading-relaxed">
                                You've unlocked <span className="text-brand-400 font-bold">{progress.completedCount} modules</span>.
                                Your next grant is waiting in Track 2.
                            </p>
                        </div>
                    </div>

                    {/* Earnings Card */}
                    <div className="glass-panel rounded-[32px] p-8 border border-emerald-500/20 bg-emerald-500/5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl">
                                <DollarSign className="w-5 h-5 text-emerald-400" />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded tracking-widest uppercase">cUSD</span>
                        </div>
                        <div className="text-3xl font-black text-white">${progress.completedCount * 50}.00</div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-1">Total Earnings</div>
                    </div>

                    {/* Skills Card */}
                    <div className="glass-panel rounded-[32px] p-8 border border-brand-500/20 bg-brand-500/5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-brand-500/10 rounded-2xl">
                                <Award className="w-5 h-5 text-brand-400" />
                            </div>
                            <span className="text-[10px] font-bold text-brand-400 bg-brand-400/10 px-2 py-0.5 rounded tracking-widest uppercase">Badges</span>
                        </div>
                        <div className="text-3xl font-black text-white">{Math.floor(progress.completedCount / 4)} Certificates</div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-1">Skills Verified</div>
                    </div>
                </div>

                {/* Course Progress & Stats grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Academy Card */}
                    <div
                        className="glass-panel p-6 rounded-3xl relative overflow-hidden group cursor-pointer border border-brand-500/20 hover:border-brand-500/50 transition-all"
                        onClick={() => navigate('/courses')}
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                            <BookOpen className="w-20 h-20 text-brand-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-2">The Academy</h3>
                        <p className="text-2xl font-bold text-white mb-2">Start Learning</p>
                        <p className="text-xs text-slate-400">Master blockchain basics and earn cUSD grants.</p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-brand-400">
                            ENTER CLASSROOM <ArrowRight className="w-3 h-3" />
                        </div>
                    </div>

                    {/* Main Progress Tracker */}
                    <div className="lg:col-span-2 glass-panel rounded-3xl p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-white">Curriculum Path</h3>
                            <span className="text-brand-400 text-sm font-medium">{progress.percentage}% Complete</span>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden mb-8 shadow-inner relative">
                            <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-600 to-indigo-500 rounded-full transition-all duration-1000 ease-in-out"
                                style={{ width: `${progress.percentage}%` }}
                            >
                                <div className="absolute top-0 right-0 bottom-0 w-[50px] bg-gradient-to-r from-transparent to-white/20 animate-pulse" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {courses.map((course, idx) => {
                                // Simplified status logic for demo
                                // In a real app, this would be based on per-course progress
                                const courseThresholds = [0, 31, 68]; // Rough thresholds for Track 1, 2, 3
                                const threshold = courseThresholds[idx] || 0;
                                const isDone = progress.percentage > (courseThresholds[idx + 1] || 100);
                                const isActive = progress.percentage >= threshold && !isDone;
                                const isPending = !isDone && !isActive;

                                return (
                                    <div
                                        key={course.id}
                                        onClick={() => (isActive || isDone) && navigate('/courses')}
                                        className={`p-4 rounded-xl border flex items-center justify-between transition-all ${isDone ? 'bg-slate-800/50 border-slate-700/50 cursor-pointer' :
                                            isActive ? 'bg-brand-900/20 border-brand-500/30 ring-1 ring-brand-500/20 cursor-pointer hover:bg-brand-900/30' :
                                                'bg-slate-900/50 border-slate-800 opacity-60'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isDone ? 'bg-green-500/20 text-green-400' :
                                                isActive ? 'bg-brand-500/20 text-brand-400 animate-pulse' :
                                                    'bg-slate-800 text-slate-500'
                                                }`}>
                                                {isDone ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                                            </div>
                                            <span className={`font-medium ${isActive ? 'text-white' : 'text-slate-300'}`}>
                                                {course.track_number}.1 {course.title}
                                            </span>
                                        </div>

                                        {isActive && (
                                            <button
                                                className="text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg transition-colors"
                                            >
                                                Resume Track
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                            {courses.length === 0 && (
                                <div className="p-8 text-center text-slate-500 italic text-sm">
                                    No active tracks available in your region.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats sidebar */}
                    <div className="space-y-8">
                        {/* Recent Credentials Card */}
                        <div className="glass-panel rounded-3xl p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2 bg-indigo-500/10 rounded-lg">
                                    <Award className="w-5 h-5 text-indigo-400" />
                                </div>
                                <h3 className="font-semibold text-white">Latest Credential</h3>
                            </div>

                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-5 rounded-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Award className="w-24 h-24" />
                                </div>
                                <span className="text-xs font-mono text-indigo-400 bg-indigo-950/50 px-2 py-1 rounded">Verified on <span className="text-celo">Celo</span></span>
                                <h4 className="text-lg font-bold text-white mt-4 mb-1">React Developer</h4>
                                <p className="text-xs text-slate-400 mb-6">Issued: March 6th, 2026</p>

                                <button className="flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 group/btn">
                                    View on IPFS <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                </button>
                            </div>
                        </div>

                        <div className="glass-panel rounded-3xl p-6 bg-brand-900/10 border-brand-800/30">
                            <h3 className="font-semibold text-white mb-2">Next Milestone Grant</h3>
                            <p className="text-sm text-slate-400 mb-4">Complete "Smart Contract Deployment" to unlock your next tranche.</p>

                            <div className="text-3xl font-bold text-brand-400 mb-2">$150.00 cUSD</div>
                            <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition-colors">
                                View Grant Details
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
