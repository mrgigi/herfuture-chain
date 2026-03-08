import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCurrency } from '../hooks/useCurrency';
import { ChevronLeft, CheckCircle, Award, ArrowRight, BookOpen, PlayCircle, HelpCircle, Zap } from 'lucide-react';
import { getQuiz, submitLessonProgress, getParticipant, getLesson } from '../lib/api';
import confetti from 'canvas-confetti';

export default function LessonPlayer() {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const { toNaira, formatNaira } = useCurrency();
    const [lesson, setLesson] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [completed, setCompleted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('video'); // 'video' or 'outcomes'

    const triggerCelebration = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    useEffect(() => {
        const fetchData = async () => {
            // Guard: must be logged in (have a phone number), not just have an avatar
            if (!localStorage.getItem('userPhone')) {
                navigate('/signup');
                return;
            }
            setLoading(true);
            try {
                // Fetch lesson first, as it's critical
                const lessonData = await getLesson(lessonId);
                setLesson(lessonData);

                // Fetch quiz separately so a 404/failure here doesn't crash the lesson view
                try {
                    const quizData = await getQuiz(lessonId);
                    const quizArray = quizData?.[0]?.data;
                    if (quizArray && quizArray.length > 0) {
                        setQuiz(quizArray[0]);
                    }
                } catch (quizErr) {
                    console.log("No quiz found or failed to load:", quizErr.message);
                    setQuiz(null);
                }
            } catch (err) {
                console.error("Failed to fetch lesson data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [lessonId]);

    const handleQuizSubmit = async () => {
        if (!selectedAnswer || !quiz) return;

        setLoading(true);
        try {
            const phone = localStorage.getItem('userPhone');
            const participant = await getParticipant(phone);

            if (selectedAnswer === quiz.correct_answer) {
                await submitLessonProgress(participant.id, lessonId, 100);
                triggerCelebration();
                setCompleted(true);
            } else {
                alert("Almost! Try reviewing the video and try again.");
            }
        } catch (err) {
            console.error("Failed to submit progress:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleClaimWithoutQuiz = async () => {
        setLoading(true);
        try {
            const phone = localStorage.getItem('userPhone');
            const participant = await getParticipant(phone);
            await submitLessonProgress(participant.id, lessonId, 100);
            triggerCelebration();
            setCompleted(true);
        } catch (err) {
            console.error("Failed to claim grant:", err);
        } finally {
            setLoading(false);
        }
    };

    if (completed) {
        return (
            <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center p-6 relative overflow-hidden">
                {/* Background animations */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 blur-[120px] rounded-full animate-pulse" />
                </div>

                <div className="max-w-xl w-full glass-panel p-12 rounded-[48px] border border-white/10 relative z-10 text-center shadow-2xl shadow-brand-500/10">
                    <div className="relative mb-10">
                        <div className="w-24 h-24 bg-gradient-to-br from-brand-400 to-magenta-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-brand-500/40 relative z-10 animate-bounce">
                            <Award className="w-12 h-12 text-white" />
                        </div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-brand-500/20 blur-2xl rounded-full" />
                    </div>

                    <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">MISSION MASTERED! 🎉</h2>
                    <p className="text-slate-400 mb-10 leading-relaxed text-lg font-medium">
                        You've unlocked a new milestone in your journey. Your reward has been triggered and is moving to your wallet.
                    </p>

                    <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 mb-10 group hover:border-brand-500/30 transition-all duration-500">
                        <div className="text-[10px] font-black text-brand-400 uppercase tracking-[0.3em] mb-3">On-Chain Reward Disbursed</div>
                        <div className="text-5xl font-black text-white group-hover:scale-110 transition-transform duration-500">
                            {lesson?.grant_amount || 30} <span className="text-xl text-brand-500/60 uppercase">cUSD</span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-6 bg-white hover:bg-brand-500 text-black hover:text-white rounded-[24px] font-black uppercase tracking-widest text-sm transition-all duration-500 shadow-xl hover:shadow-brand-500/40 flex items-center justify-center gap-3 group"
                    >
                        Return to Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </button>

                    <p className="mt-8 text-[10px] font-black uppercase tracking-widest text-slate-600 italic">
                        Proof-of-Learn Verified • Transaction Processing
                    </p>
                </div>
            </div>
        );
    }

    if (loading) return (
        <div className="min-h-screen bg-[#0A0F1C] flex flex-col items-center justify-center p-6 text-center">
            <div className="h-12 w-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Syncing with HerFuture Academy...</p>
        </div>
    );

    if (!lesson) return (
        <div className="min-h-screen bg-[#0A0F1C] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <HelpCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Lesson Not Found</h2>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">This lesson might be still synchronizing or doesn't exist yet.</p>
            <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all text-sm mb-4"
            >
                Back to Dashboard
            </button>
            <button
                onClick={() => window.location.reload()}
                className="text-brand-400 text-xs font-bold hover:underline"
            >
                Retry Sync
            </button>
        </div>
    );

    const getEmbedUrl = (url) => {
        if (!url) return '';
        try {
            // Handle regular youtube.com/watch?v=...
            if (url.includes('youtube.com/watch')) {
                const urlObj = new URL(url);
                const videoId = urlObj.searchParams.get('v');
                if (videoId) return `https://www.youtube.com/embed/${videoId}`;
            }
            // Handle youtu.be/...
            if (url.includes('youtu.be/')) {
                const videoId = url.split('youtu.be/')[1].split('?')[0];
                if (videoId) return `https://www.youtube.com/embed/${videoId}`;
            }
        } catch (e) {
            console.error("Failed to parse video URL:", e);
        }
        return url; // fallback
    };

    return (
        <div className="min-h-screen bg-[#0A0F1C] flex flex-col">
            {/* Player Header */}
            <header className="p-4 flex items-center justify-between border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Exit Academy</span>
                </button>
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
                    Lesson: {lesson.title}
                </div>
                <div className="w-24"></div> {/* Spacer */}
            </header>

            <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-65px)] overflow-hidden">
                {/* Main Content Area */}
                <div className="flex-1 bg-black flex flex-col items-center justify-center relative group">
                    {!showQuiz ? (
                        <div className="w-full h-full relative">
                            <iframe
                                className="absolute inset-0 w-full h-full"
                                src={`${getEmbedUrl(lesson.video_url)}?autoplay=1&rel=0`}
                                title={lesson.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    ) : (
                        <div className="w-full max-w-xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center mb-10">
                                <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Zap className="w-8 h-8 text-brand-400 animate-pulse" />
                                </div>
                                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">KNOWLEDGE CHECK</h2>
                                <p className="text-slate-500 text-sm font-medium">Pass the check to unlock your <span className="text-brand-400 font-bold">{lesson?.grant_amount || 30} cUSD</span> reward.</p>
                            </div>

                            {/* Heartbeat Progress Bar */}
                            <div className="max-w-xs mx-auto mb-12">
                                <div className="flex justify-between items-center mb-2 px-1">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Progress</span>
                                    <span className="text-[9px] font-black text-brand-400 uppercase tracking-widest">Mastery in reach</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                    <div
                                        className="h-full bg-gradient-to-r from-brand-500 to-magenta-600 rounded-full transition-all duration-1000 animate-pulse shadow-[0_0_10px_rgba(244,114,182,0.5)]"
                                        style={{ width: '60%' }}
                                    />
                                </div>
                            </div>

                            {quiz ? (
                                <div className="space-y-4">
                                    <p className="text-slate-200 text-lg mb-8 leading-relaxed font-medium">{quiz.question}</p>
                                    {quiz.options && Array.isArray(quiz.options) && quiz.options.map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => setSelectedAnswer(option)}
                                            className={`w-full p-5 rounded-2xl border transition-all text-left flex items-center justify-between group ${selectedAnswer === option
                                                ? 'bg-brand-500/20 border-brand-500 text-brand-400'
                                                : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10'
                                                }`}
                                        >
                                            <span className="flex-1 text-sm font-medium">{option}</span>
                                            {selectedAnswer === option ? (
                                                <CheckCircle className="w-5 h-5" />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full border-2 border-slate-700 group-hover:border-slate-500 transition-colors" />
                                            )}
                                        </button>
                                    ))}
                                    <button
                                        onClick={handleQuizSubmit}
                                        disabled={!selectedAnswer || loading}
                                        className="w-full py-5 rounded-2xl bg-brand-500 hover:bg-brand-400 text-white font-bold uppercase tracking-wider text-xs mt-10 shadow-xl shadow-brand-500/20 transition-all disabled:opacity-50"
                                    >
                                        {!selectedAnswer ? 'Select an Answer' : loading ? 'Verifying...' : 'Submit Answer'}
                                    </button>
                                    <button
                                        onClick={() => setShowQuiz(false)}
                                        className="w-full mt-4 text-xs font-bold text-slate-500 hover:text-white transition-colors"
                                    >
                                        Back to Video
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-slate-500 mb-6">No quiz found for this lesson. You can claim your reward!</p>
                                    <button
                                        onClick={handleClaimWithoutQuiz}
                                        disabled={loading}
                                        className="btn-primary px-8 py-4 flex items-center gap-2 justify-center mx-auto"
                                    >
                                        {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Claim My Reward'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar / Info Panel */}
                <div className="w-full lg:w-[400px] border-l border-white/5 bg-[#0D121F] flex flex-col">
                    <div className="flex border-b border-white/5">
                        <button
                            onClick={() => setActiveTab('video')}
                            className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'video' ? 'text-brand-400 bg-brand-500/5 border-b-2 border-brand-500' : 'text-slate-600 hover:text-slate-300'}`}
                        >
                            Lesson Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('outcomes')}
                            className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'outcomes' ? 'text-brand-400 bg-brand-500/5 border-b-2 border-brand-500' : 'text-slate-600 hover:text-slate-300'}`}
                        >
                            Learning Goals
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        {activeTab === 'video' ? (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <h2 className="text-2xl font-bold text-white mb-4 leading-tight">{lesson.title}</h2>
                                <p className="text-slate-400 text-sm leading-relaxed mb-8">{lesson.content}</p>

                                <div className="p-6 rounded-3xl bg-brand-500/5 border border-brand-500/10 mb-8 tracking-wider">
                                    <div className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-2">Milestone Reward</div>
                                    <div className="flex items-baseline gap-2">
                                        <div className="text-2xl font-black text-white">{formatNaira(toNaira(lesson.grant_amount || 30))}</div>
                                        <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">{lesson.grant_amount || 30} cUSD</div>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1 uppercase">Released instantly on-chain</div>
                                </div>

                                {!showQuiz && (
                                    <button
                                        onClick={() => setShowQuiz(true)}
                                        className="w-full py-5 rounded-2xl bg-white text-[#060914] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-brand-500 hover:text-white transition-all shadow-xl"
                                    >
                                        Take the Quiz <ArrowRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <h3 className="text-sm font-black text-white/30 uppercase tracking-[0.2em] mb-6">Competencies To Master</h3>
                                <div className="space-y-4">
                                    {Array.isArray(lesson.learning_outcomes) ? lesson.learning_outcomes.map((outcome, i) => (
                                        <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 items-start">
                                            <div className="mt-1">
                                                <CheckCircle className="w-4 h-4 text-brand-400" />
                                            </div>
                                            <p className="text-sm text-slate-300 font-medium leading-relaxed">{outcome}</p>
                                        </div>
                                    )) : (lesson.learning_outcomes && typeof lesson.learning_outcomes === 'string') ? (
                                        <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 items-start">
                                            <div className="mt-1">
                                                <CheckCircle className="w-4 h-4 text-brand-400" />
                                            </div>
                                            <p className="text-sm text-slate-300 font-medium leading-relaxed">{lesson.learning_outcomes}</p>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Network Status Indicator */}
                    <div className="p-6 border-t border-white/5 bg-black/20">
                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-600">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-white">Secure Network</span> Connected
                            </div>
                            <div className="flex items-center gap-2">
                                <Award className="w-3 h-3" />
                                Proof-of-Learn
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
