import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayCircle, CheckCircle, ChevronLeft, Lock } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { getModules, getParticipant } from '../lib/api';
import { DollarSign } from 'lucide-react';

export default function CourseDetail() {
    const { courseId } = useParams();
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const phone = localStorage.getItem('userPhone');
                const participant = await getParticipant(phone);
                const data = await getModules(courseId, participant?.id);
                setLessons(data);
            } catch (err) {
                console.error("Failed to fetch modules:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchModules();
    }, [courseId]);

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="h-12 w-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 font-sans">
            <Sidebar active="courses" />
            <Topbar title="Course Modules" />

            <main className="md:ml-64 p-8">
                <button
                    onClick={() => navigate('/courses')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform" />
                    Back to Academy
                </button>

                <div className="max-w-3xl mx-auto">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-white mb-2">HerFuture Academy</h2>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span>{lessons.length} Modules</span>
                            <span>•</span>
                            <span>Progressive Path</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {lessons.map((lesson, index) => (
                            <div
                                key={lesson.id}
                                onClick={() => !lesson.locked && navigate(`/lesson/${lesson.id}`)}
                                className={`glass-panel p-5 flex items-center gap-6 transition-all border ${lesson.locked
                                        ? 'opacity-50 cursor-not-allowed border-slate-800'
                                        : 'cursor-pointer hover:bg-slate-800/50 border-slate-700/50 hover:border-brand-500/30 group'
                                    }`}
                            >
                                <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${lesson.completed ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-500'
                                    }`}>
                                    {lesson.completed ? <CheckCircle className="w-5 h-5" /> : lesson.locked ? <Lock className="w-4 h-4" /> : lesson.track_label}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-white mb-0.5">{lesson.title}</h3>
                                        {lesson.grant_amount > 0 && (
                                            <span className="flex items-center gap-1 text-[10px] bg-brand-500/20 text-brand-400 font-bold px-1.5 py-0.5 rounded border border-brand-500/20">
                                                <DollarSign className="w-2.5 h-2.5" /> ${lesson.grant_amount}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500">{lesson.is_wellbeing ? 'Wellbeing Session' : 'Skill Development'}</p>
                                </div>

                                <div className="flex-shrink-0">
                                    {!lesson.locked && (
                                        <PlayCircle className="w-6 h-6 text-brand-400 group-hover:scale-110 transition-transform" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
