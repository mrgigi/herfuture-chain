import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCurrency } from '../hooks/useCurrency';
import { ChevronLeft, CheckCircle, Award, ArrowRight, BookOpen, PlayCircle, HelpCircle, Zap, XCircle, RotateCcw, Trophy } from 'lucide-react';
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
    const [answerResult, setAnswerResult] = useState(null); // null | 'correct' | 'wrong'
    const [completed, setCompleted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const triggerCelebration = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        const randomInRange = (min, max) => Math.random() * (max - min) + min;
        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!localStorage.getItem('userPhone')) { navigate('/signup'); return; }
            setLoading(true);
            try {
                const lessonData = await getLesson(lessonId);
                setLesson(lessonData);
                try {
                    const quizData = await getQuiz(lessonId);
                    const quizArray = quizData?.[0]?.data;
                    if (quizArray && quizArray.length > 0) setQuiz(quizArray[0]);
                } catch { setQuiz(null); }
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
        const correctAnswer = quiz.answer || quiz.correct_answer;
        if (selectedAnswer === correctAnswer) {
            setAnswerResult('correct');
            setLoading(true);
            try {
                const phone = localStorage.getItem('userPhone');
                const participant = await getParticipant(phone);
                await submitLessonProgress(participant.id, lessonId, 100);
                triggerCelebration();
                setTimeout(() => setCompleted(true), 800);
            } catch (err) {
                console.error("Failed to submit progress:", err);
            } finally {
                setLoading(false);
            }
        } else {
            setAnswerResult('wrong');
        }
    };

    const handleRetryQuiz = () => {
        setSelectedAnswer(null);
        setAnswerResult(null);
    };

    const handleClaimWithoutQuiz = async () => {
        setLoading(true);
        try {
            const phone = localStorage.getItem('userPhone');
            const participant = await getParticipant(phone);
            await submitLessonProgress(participant.id, lessonId, 100);
            triggerCelebration();
            setTimeout(() => setCompleted(true), 500);
        } catch (err) {
            console.error("Failed to claim reward:", err);
        } finally {
            setLoading(false);
        }
    };

    const getEmbedUrl = (url) => {
        if (!url) return '';
        const params = 'rel=0&modestbranding=1&iv_load_policy=3';
        try {
            if (url.includes('youtube.com/watch')) {
                const urlObj = new URL(url);
                const videoId = urlObj.searchParams.get('v');
                if (videoId) return `https://www.youtube.com/embed/${videoId}?${params}`;
            }
            if (url.includes('youtu.be/')) {
                const videoId = url.split('youtu.be/')[1].split('?')[0];
                if (videoId) return `https://www.youtube.com/embed/${videoId}?${params}`;
            }
            if (url.includes('youtube.com/embed/')) {
                const base = url.split('?')[0];
                return `${base}?${params}`;
            }
        } catch (e) { console.error("Failed to parse video URL:", e); }
        return url;
    };

    /* ── Loading / Error states ─────────────────────────── */
    if (loading && !lesson) return (
        <div className="min-h-screen bg-[#0A0F1C] flex flex-col items-center justify-center p-6 text-center">
            <div className="h-12 w-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading your lesson...</p>
        </div>
    );

    if (!lesson && !loading) return (
        <div className="min-h-screen bg-[#0A0F1C] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <HelpCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Lesson Not Found</h2>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">This lesson might still be loading or doesn't exist yet.</p>
            <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all text-sm mb-4">
                Back to Dashboard
            </button>
            <button onClick={() => window.location.reload()} className="text-brand-400 text-xs font-bold hover:underline">
                Try Again
            </button>
        </div>
    );

    /* ── Success / Completed screen ─────────────────────── */
    if (completed) return (
        <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 blur-[120px] rounded-full animate-pulse" />
            </div>
            <div className="max-w-md w-full glass-panel p-8 md:p-12 rounded-[40px] border border-white/10 relative z-10 text-center shadow-2xl shadow-brand-500/10">
                <div className="relative mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-brand-400 to-fuchsia-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-brand-500/40 relative z-10 animate-bounce">
                        <Trophy className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-28 bg-brand-500/20 blur-2xl rounded-full" />
                </div>

                <h2 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tighter">Lesson Complete! 🎉</h2>
                <p className="text-slate-400 mb-8 leading-relaxed font-medium text-sm md:text-base">
                    Amazing work! Your reward is being sent to your wallet right now.
                </p>

                <div className="p-6 rounded-[24px] bg-white/5 border border-brand-500/20 mb-8">
                    <div className="text-[10px] font-black text-brand-400 uppercase tracking-[0.3em] mb-2">💰 Reward Sent to Wallet</div>
                    <div className="flex items-baseline gap-3 justify-center">
                        <div className="text-4xl font-black text-white">{lesson && formatNaira(toNaira(lesson.grant_amount || 30))}</div>
                        <div className="text-sm font-bold text-slate-500">{lesson?.grant_amount || 30} cUSD</div>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-5 bg-white hover:bg-brand-500 text-black hover:text-white rounded-[20px] font-black uppercase tracking-widest text-sm transition-all shadow-xl flex items-center justify-center gap-3 group"
                >
                    Back to Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="mt-6 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                    ✅ Verified by HerFuture Chain
                </p>
            </div>
        </div>
    );

    if (!lesson) return null;

    /* ── QUIZ VIEW (full screen overlay on mobile) ───────── */
    if (showQuiz) return (
        <div className="min-h-screen bg-[#0A0F1C] flex flex-col">
            {/* Quiz Header */}
            <header className="p-4 flex items-center gap-3 border-b border-white/5 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
                <button
                    onClick={() => { setShowQuiz(false); setSelectedAnswer(null); setAnswerResult(null); }}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Back to Video</span>
                </button>
            </header>

            <div className="flex-1 flex flex-col items-center justify-start p-5 overflow-y-auto">
                <div className="w-full max-w-lg mt-4 mb-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                            <Zap className="w-7 h-7 text-brand-400" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">Quick Check</h2>
                        <p className="text-slate-400 text-sm font-medium">
                            Answer correctly to unlock{' '}
                            <span className="text-brand-400 font-bold">{formatNaira(toNaira(lesson.grant_amount || 30))}</span>
                            {' '}sent straight to your wallet!
                        </p>
                    </div>

                    {/* Wrong Answer Feedback */}
                    {answerResult === 'wrong' && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in duration-300">
                            <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-red-400 font-bold text-sm">Not quite! Give it another try.</p>
                                <p className="text-red-400/70 text-xs mt-0.5">Review the video and pick the right answer.</p>
                            </div>
                        </div>
                    )}

                    {quiz ? (
                        <div className="space-y-3">
                            {/* Question */}
                            <div className="p-5 bg-white/5 rounded-2xl border border-white/5 mb-6">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Question</p>
                                <p className="text-white text-base leading-relaxed font-medium">{quiz.question}</p>
                            </div>

                            {/* Options */}
                            {quiz.options && Array.isArray(quiz.options) && quiz.options.map((option, idx) => (
                                <button
                                    key={option}
                                    onClick={() => { setSelectedAnswer(option); setAnswerResult(null); }}
                                    className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center gap-4 active:scale-[0.98] ${selectedAnswer === option
                                            ? 'bg-brand-500/20 border-brand-500 text-white shadow-lg shadow-brand-500/10'
                                            : 'bg-white/[0.03] border-white/8 text-slate-300 hover:border-white/15 hover:bg-white/5'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${selectedAnswer === option ? 'bg-brand-500 text-white' : 'bg-white/5 text-slate-500'
                                        }`}>
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <span className="text-sm font-medium flex-1">{option}</span>
                                    {selectedAnswer === option && <CheckCircle className="w-5 h-5 text-brand-400 shrink-0" />}
                                </button>
                            ))}

                            {/* Actions */}
                            <div className="pt-4 space-y-3">
                                <button
                                    onClick={handleQuizSubmit}
                                    disabled={!selectedAnswer || loading}
                                    className="w-full py-5 rounded-2xl bg-brand-500 hover:bg-brand-400 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-brand-500/30 transition-all disabled:opacity-40 active:scale-[0.98]"
                                >
                                    {loading ? 'Checking...' : !selectedAnswer ? 'Choose an Answer' : 'Submit Answer →'}
                                </button>
                                {answerResult === 'wrong' && (
                                    <button onClick={handleRetryQuiz} className="w-full py-3 flex items-center justify-center gap-2 text-slate-400 hover:text-white text-sm font-bold transition-colors">
                                        <RotateCcw className="w-4 h-4" /> Try Again
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h3 className="text-white font-bold text-lg mb-2">You've finished this lesson!</h3>
                            <p className="text-slate-400 text-sm mb-8 max-w-xs mx-auto">No quiz for this one — go ahead and claim your reward below.</p>
                            <button
                                onClick={handleClaimWithoutQuiz}
                                disabled={loading}
                                className="w-full py-5 rounded-2xl bg-brand-500 hover:bg-brand-400 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-brand-500/30 transition-all disabled:opacity-40"
                            >
                                {loading ? 'Processing...' : '🎉 Claim My Reward'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    /* ── MAIN LESSON VIEW (scroll layout) ───────────────── */
    return (
        <div className="min-h-screen bg-[#0A0F1C] flex flex-col">

            {/* Sticky Header */}
            <header className="p-3 md:p-4 flex items-center justify-between border-b border-white/5 bg-[#0A0F1C]/90 backdrop-blur-md sticky top-0 z-50">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-sm font-semibold">Back</span>
                </button>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] truncate max-w-[50vw] text-center">
                    {lesson.title}
                </p>
                <div className="w-16" /> {/* spacer */}
            </header>

            {/* ── Video Player ── */}
            {/* aspect-video gives the iframe a real height on all screen sizes */}
            <div className="w-full bg-black aspect-video">
                {lesson.video_url ? (
                    <iframe
                        className="w-full h-full"
                        src={getEmbedUrl(lesson.video_url)}
                        title={lesson.title}
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-center p-6">
                        <PlayCircle className="w-12 h-12 text-slate-700 mb-3" />
                        <p className="text-slate-500 text-sm font-medium">Video coming soon</p>
                    </div>
                )}
            </div>

            {/* ── Reward Banner ── */}
            <div className="mx-4 mt-4 p-4 rounded-2xl bg-gradient-to-r from-brand-500/10 to-fuchsia-500/10 border border-brand-500/20 flex items-center justify-between">
                <div>
                    <div className="text-[9px] font-black text-brand-400 uppercase tracking-widest mb-0.5">Your Reward</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-white">{formatNaira(toNaira(lesson.grant_amount || 30))}</span>
                        <span className="text-xs text-slate-500">{lesson.grant_amount || 30} cUSD</span>
                    </div>
                    <div className="text-[9px] text-slate-500 mt-0.5">Sent to your wallet when you pass ✅</div>
                </div>
                <div className="w-12 h-12 bg-brand-500/20 rounded-2xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-brand-400" />
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex border-b border-white/5 mx-4 mt-5">
                {[
                    { id: 'overview', label: 'About this Lesson' },
                    { id: 'goals', label: 'What You'll Learn' },
                ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                    ? 'text-brand-400 border-b-2 border-brand-500'
                                    : 'text-slate-600 hover:text-slate-400'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
            </div>

            {/* ── Tab Content ── */}
            <div className="flex-1 px-4 pt-5 pb-36">
                {activeTab === 'overview' ? (
                    <div className="animate-in fade-in duration-300">
                        <h2 className="text-xl font-black text-white mb-3 leading-snug">{lesson.title}</h2>
                        {lesson.content ? (
                            <p className="text-slate-400 text-sm leading-relaxed">{lesson.content}</p>
                        ) : (
                            <p className="text-slate-600 text-sm italic">No summary provided for this lesson yet.</p>
                        )}
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-300">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">What you'll gain from this lesson</p>
                        {(() => {
                            const outcomes = Array.isArray(lesson.learning_outcomes)
                                ? lesson.learning_outcomes
                                : typeof lesson.learning_outcomes === 'string' && lesson.learning_outcomes.trim()
                                    ? [lesson.learning_outcomes]
                                    : [];
                            return outcomes.length > 0 ? (
                                <div className="space-y-3">
                                    {outcomes.map((outcome, i) => (
                                        <div key={i} className="flex gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 items-start">
                                            <CheckCircle className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                                            <p className="text-sm text-slate-300 font-medium leading-relaxed">{outcome}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center">
                                    <BookOpen className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                                    <p className="text-slate-500 text-sm">Learning goals for this lesson will be added soon.</p>
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>

            {/* ── Sticky Bottom CTA ── */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0A0F1C]/95 backdrop-blur-xl border-t border-white/5 flex flex-col gap-2 z-40">
                <button
                    onClick={() => setShowQuiz(true)}
                    className="w-full py-4 bg-brand-500 hover:bg-brand-400 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-brand-500/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                    <Zap className="w-4 h-4" />
                    Take the Quiz & Earn {formatNaira(toNaira(lesson.grant_amount || 30))}
                </button>
                <div className="flex items-center justify-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-600">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-slate-400">Secure</span>
                    </div>
                    <span>•</span>
                    <span>Instant Payout</span>
                    <span>•</span>
                    <span>HerFuture Chain</span>
                </div>
            </div>
        </div>
    );
}
