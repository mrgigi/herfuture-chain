import { useState, useEffect } from 'react';
import { Wallet, BookOpen, ArrowRight, CheckCircle, ExternalLink, Trophy, Activity, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import LoadingScreen from '../components/LoadingScreen';
import BottomNav from '../components/BottomNav';
import { getParticipant, getProgressOverview, getCourses } from '../lib/api';

export default function Dashboard() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const phone = localStorage.getItem('userPhone');

    // Queries
    const { data: participant, isLoading: participantLoading } = useQuery({
        queryKey: ['participant', phone],
        queryFn: () => getParticipant(phone),
        enabled: !!phone
    });

    const { data: progress = { percentage: 0, completedCount: 0, totalModules: 16 }, isLoading: progressLoading } = useQuery({
        queryKey: ['progress-overview', participant?.id],
        queryFn: () => getProgressOverview(participant.id),
        enabled: !!participant?.id
    });

    const { data: coursesData = [], isLoading: coursesLoading } = useQuery({
        queryKey: ['courses'],
        queryFn: getCourses,
        select: (data) => Array.isArray(data) ? data.filter(c => c.is_published) : []
    });

    useEffect(() => {
        if (!localStorage.getItem('userAvatar')) {
            navigate('/avatar-selection');
        }
    }, [navigate]);

    const loading = participantLoading || progressLoading || coursesLoading;
    const error = !phone ? 'No user logged in' : null;
    const courses = coursesData;

    if (loading) return <LoadingScreen message="Personalizing Your Dashboard..." />;

    const name = participant?.first_name || "{First Name}";
    const totalGrantsReceived = progress.completedCount * 30;
    const buttonText = progress.completedCount === 0 ? "Get Started" : "Resume Learning";

    return (
        <div className="min-h-screen bg-[#060912] font-sans text-slate-200 flex flex-col">
            <Sidebar
                active="dashboard"
                onCollapseChange={setSidebarCollapsed}
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />
            <Topbar
                userName={name}
                sidebarCollapsed={sidebarCollapsed}
                onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            />

            <main className={`${sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64'} flex-grow p-4 md:p-8 transition-all duration-300`}>
                <div className="max-w-7xl mx-auto space-y-8">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold uppercase tracking-wider text-center">
                            {error}
                        </div>
                    )}

                    {/* Compact Luxury Stats Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            {
                                label: 'Total Grants',
                                value: `$${totalGrantsReceived}.00`,
                                icon: <Wallet className="w-4 h-4 text-emerald-400" />,
                                badge: 'Verified',
                                badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            },
                            {
                                label: 'Upcoming Grant',
                                value: `$150.00`,
                                icon: <Trophy className="w-4 h-4 text-brand-400" />,
                                badge: 'Next Milestone',
                                badgeColor: 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                            }
                        ].map((stat, i) => (
                            <div key={i} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-[32px] hover:border-white/10 transition-all group">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">
                                        {stat.icon}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${stat.badgeColor}`}>
                                        {stat.badge}
                                    </span>
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{stat.label}</div>
                                <div className="text-3xl font-black text-white tracking-tight">{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-8">
                        {/* Active Module Hero */}
                        <div className="relative group overflow-hidden rounded-[40px] p-1 bg-gradient-to-tr from-fuchsia-500/20 to-magenta-500/20 border border-white/5">
                            <div className="bg-[#0D121F]/90 backdrop-blur-3xl rounded-[38px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-fuchsia-500/10 transition-colors pointer-events-none" />

                                {/* Progress Circle */}
                                <div className="relative flex-shrink-0">
                                    <div className="absolute -inset-10 flex items-center justify-center text-[160px] font-black text-white/5 pointer-events-none select-none">
                                        {progress.percentage}%
                                    </div>
                                    <div className="w-32 h-32 rounded-[36px] bg-gradient-to-br from-fuchsia-500 to-magenta-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-fuchsia-500/40 relative z-10 -rotate-3 group-hover:rotate-0 transition-all duration-500">
                                        {progress.percentage}%
                                    </div>
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                                        <span className="text-[11px] font-black uppercase tracking-widest text-fuchsia-400">Current Progress</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">{progress.completedCount} Modules Mastered</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter leading-none">
                                        Start your <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-magenta-400 italic">first lesson.</span>
                                    </h2>
                                    <p className="text-slate-400 text-base max-w-xl mb-10 leading-relaxed font-medium">
                                        Complete lessons and quizzes to earn verifiable credentials and unlock direct-to-wallet grants.
                                    </p>
                                    <button
                                        onClick={() => navigate('/courses')}
                                        className="px-10 py-5 bg-brand-500 hover:bg-fuchsia-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-2xl shadow-brand-500/30 hover:shadow-fuchsia-500/40 hover:-translate-y-1 flex items-center gap-4 mx-auto md:mx-0"
                                    >
                                        {buttonText} <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Mobile/Small Screen Milestone Card */}
                        <div className="lg:hidden bg-emerald-500/5 border border-emerald-500/10 rounded-[32px] p-8 text-center">
                            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 mb-2">Upcoming Reward</div>
                            <div className="text-4xl font-black text-white mb-2">$150 <span className="text-xs text-emerald-400">cUSD</span></div>
                            <p className="text-xs text-slate-500 mb-6">Complete Track 2 to trigger automated grant.</p>
                            <button onClick={() => navigate('/grants')} className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-white transition-colors">
                                View Payout History →
                            </button>
                        </div>

                        {/* Curriculum Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                            {courses.map((course, idx) => {
                                const modulesPerTrack = Math.ceil(progress.totalModules / Math.max(1, courses.length));
                                const trackStartThreshold = idx * modulesPerTrack;
                                const isDone = progress.completedCount >= trackStartThreshold + modulesPerTrack;
                                const isActive = progress.completedCount >= trackStartThreshold && !isDone;

                                return (
                                    <div
                                        key={course.id}
                                        onClick={() => navigate(`/courses/${course.id}`)}
                                        className={`group p-8 rounded-[40px] border transition-all duration-500 relative overflow-hidden cursor-pointer hover:-translate-y-1 ${isActive
                                            ? 'bg-fuchsia-500/[0.04] border-fuchsia-500/30 shadow-2xl shadow-fuchsia-500/10 ring-1 ring-fuchsia-500/20 scale-[1.02] active:scale-100'
                                            : isDone
                                                ? 'bg-slate-900/60 border-white/5 opacity-80 active:scale-[0.98]'
                                                : 'bg-black/20 border-white/[0.04] opacity-60 hover:opacity-80'
                                            }`}
                                    >
                                        <div className="flex flex-col gap-6 relative z-10">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-all duration-500 group-hover:scale-110 ${isActive ? 'bg-gradient-to-br from-fuchsia-500 to-magenta-600 text-white shadow-xl shadow-fuchsia-500/40' : isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                                                }`}>
                                                {isDone ? <CheckCircle className="w-6 h-6" /> : (idx + 1)}
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Track {course.track_number || (idx + 1)}</div>
                                                <h4 className={`text-lg font-black uppercase tracking-tight leading-tight ${isActive ? 'text-white' : 'text-slate-400'}`}>{course.title}</h4>
                                            </div>
                                            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-fuchsia-400 animate-pulse' : isDone ? 'text-emerald-400' : 'text-slate-600'}`}>
                                                    {isActive ? 'In Progress' : isDone ? 'Completed' : 'View Track'}
                                                </span>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-fuchsia-500/10' : 'bg-white/5'}`}>
                                                    <ArrowRight className={`w-4 h-4 ${isActive ? 'text-fuchsia-400' : 'text-slate-500 group-hover:text-white transition-colors'}`} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>


                    </div>
                </div>
            </main>
            <BottomNav />
        </div>
    );
}
