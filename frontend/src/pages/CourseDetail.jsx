import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PlayCircle, CheckCircle, ChevronLeft, Lock, ChevronDown, ChevronUp, BookOpen, Sparkles, DollarSign, HelpCircle } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import { getModules, getParticipant } from '../lib/api';
import { useCurrency } from '../hooks/useCurrency';

const ModuleAccordion = ({ module, index, navigate, formatNaira, toNaira }) => {
    const [isOpen, setIsOpen] = useState(index === 0); // Open first module by default
    const lessons = module?.lessons || [];
    const hasMultipleLessons = lessons.length > 1;

    return (
        <div className="glass-panel rounded-[32px] border border-white/5 overflow-hidden mb-6 transition-all hover:border-brand-500/20 shadow-2xl shadow-black/20">
            {/* Module Header */}
            <div
                onClick={() => hasMultipleLessons && setIsOpen(!isOpen)}
                className={`p-6 flex items-center justify-between cursor-pointer transition-colors ${isOpen ? 'bg-white/[0.03]' : 'hover:bg-white/[0.01]'}`}
            >
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-black text-lg">
                        {index + 1}
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white tracking-tight">{module.title || 'Untitled Lesson'}</h3>
                        <p className="text-[10px] tracking-wider font-bold text-slate-500 mt-0.5">
                            {lessons.length} {lessons.length === 1 ? 'Lesson' : 'Lessons'} • {lessons.filter(l => l.completed).length} Complete
                        </p>
                    </div>
                </div>

                {hasMultipleLessons ? (
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                ) : lessons[0] ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!lessons[0].locked) navigate(`/lesson/${lessons[0].id}`);
                        }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${lessons[0].locked ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-brand-500 text-white hover:bg-brand-400 shadow-lg shadow-brand-500/20'}`}
                    >
                        {lessons[0].completed ? <CheckCircle className="w-3 h-3" /> : <PlayCircle className="w-3 h-3" />}
                        {lessons[0].completed ? 'Review' : 'Start'}
                    </button>
                ) : null}
            </div>

            {/* Lessons List (Accordion Content) */}
            {isOpen && hasMultipleLessons && (
                <div className="px-6 pb-6 pt-2 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    {lessons.map((lesson) => (
                        <div
                            key={lesson.id}
                            onClick={() => !lesson.locked && navigate(`/lesson/${lesson.id}`)}
                            className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${lesson.locked
                                ? 'bg-black/20 border-white/2 cursor-not-allowed opacity-40'
                                : 'bg-white/[0.02] border-white/5 hover:border-brand-500/40 hover:bg-white/[0.04] cursor-pointer'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${lesson.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-50'}`}>
                                    {lesson.completed ? <CheckCircle className="w-4 h-4" /> : lesson.locked ? <Lock className="w-3.5 h-3.5" /> : <BookOpen className="w-4 h-4" />}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors tracking-tight">{lesson.title}</h4>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <span className="text-[9px] font-bold text-slate-600 tracking-wider">
                                            {lesson.is_wellbeing ? 'Wellbeing' : 'Skill Development'}
                                        </span>
                                        {lesson.grant_amount > 0 && (
                                            <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 tracking-wider">
                                                {formatNaira(toNaira(lesson.grant_amount))} <span className="text-slate-600">({lesson.grant_amount} cUSD)</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {!lesson.locked && (
                                <div className="flex items-center gap-2">
                                    <PlayCircle className="w-5 h-5 text-slate-700 group-hover:text-brand-400 transition-all group-hover:scale-110" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function CourseDetail() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { toNaira, formatNaira } = useCurrency();

    const { data: modules = [], isLoading: queryLoading } = useQuery({
        queryKey: ['course-modules', courseId],
        queryFn: async () => {
            const phone = localStorage.getItem('userPhone');
            const participant = await getParticipant(phone);
            return await getModules(courseId, participant?.id);
        }
    });

    useEffect(() => {
        // Guard: redirect to signup if not logged in (no phone number stored)
        if (!localStorage.getItem('userPhone')) {
            navigate('/signup');
        }
    }, [navigate]);

    const loading = queryLoading;

    if (loading) return <LoadingScreen message="Designing Learning Path..." />;

    return (
        <div className="min-h-screen relative pb-32 transition-all duration-300">
            {/* Header Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative z-10 p-6 md:p-10 max-w-5xl mx-auto">
                {/* Navigation */}
                <div className="flex justify-between items-center mb-10">
                    <button
                        onClick={() => navigate('/courses')}
                        className="flex items-center gap-2 group text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:border-white/10"
                    >
                        <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                        Academy Dashboard
                    </button>
                </div>

                {/* Course Intro */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-brand-500/10 text-brand-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-brand-500/20">Learning Path</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 leading-none">
                        Program Syllabus
                    </h1>

                </div>

                {/* Modules Grid */}
                <div className="grid grid-cols-1 gap-2">
                    {modules.length > 0 ? (
                        modules.map((mod, index) => (
                            <ModuleAccordion
                                key={mod.id}
                                module={mod}
                                index={index}
                                navigate={navigate}
                                formatNaira={formatNaira}
                                toNaira={toNaira}
                            />
                        ))
                    ) : (
                        <div className="glass-panel p-12 rounded-[40px] border border-white/5 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-6">
                                <Sparkles className="w-8 h-8 text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Lessons Pending</h3>
                            <p className="text-slate-500 text-sm max-w-xs">Our instructors are currently refining the material for this track. Check back soon!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
