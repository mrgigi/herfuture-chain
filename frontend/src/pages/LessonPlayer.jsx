import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle, XCircle, Award, ArrowRight, HelpCircle, Zap } from 'lucide-react';
import { getQuiz, submitLessonProgress, getParticipant, getLesson } from '../lib/api';
import confetti from 'canvas-confetti';
import YoutubePlayer from '../components/YoutubePlayer';
import { useCurrency } from '../hooks/useCurrency';

const PASS_THRESHOLD = 2; // Min correct out of total questions to pass

export default function LessonPlayer() {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const { toNaira, formatNaira, formatCUSD } = useCurrency();

    const [lesson, setLesson] = useState(null);
    const [allQuestions, setAllQuestions] = useState([]);
    const [showQuiz, setShowQuiz] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('video');

    // Step-by-step quiz state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [questionResult, setQuestionResult] = useState(null); // 'correct' | 'incorrect' | null
    const [score, setScore] = useState(0);
    const scoreRef = useRef(0); // Sync ref so handleNextQuestion always reads the real score
    const [quizFinished, setQuizFinished] = useState(false);
    const [lessonCompleted, setLessonCompleted] = useState(false);

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
            if (!localStorage.getItem('userPhone')) {
                navigate('/signup');
                return;
            }
            setLoading(true);
            try {
                // Fetch lesson — this MUST succeed
                const lessonData = await getLesson(lessonId);
                setLesson(lessonData);

                // Fetch quiz separately — failure here should NOT break the lesson
                try {
                    const quizData = await getQuiz(lessonId);
                    // Handle both flat array and nested [{data:[]}] formats
                    let questions = [];
                    if (Array.isArray(quizData)) {
                        if (quizData[0]?.data) {
                            questions = quizData[0].data;
                        } else if (quizData[0]?.question) {
                            questions = quizData; // flat array of question objects
                        }
                    }
                    if (questions.length > 0) {
                        setAllQuestions(questions);
                    }
                } catch (quizErr) {
                    console.warn("Quiz fetch failed (lesson still loads):", quizErr.message);
                }
            } catch (err) {
                console.error("Failed to fetch lesson data:", err);
                // lesson remains null → shows "Lesson Not Found"
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [lessonId]);

    const currentQuestion = allQuestions[currentQuestionIndex];
    const totalQuestions = allQuestions.length;

    const handleAnswerSelect = (option) => {
        if (questionResult) return; // Don't allow re-selection after feedback
        setSelectedAnswer(option);
    };

    const handleSubmitAnswer = () => {
        if (!selectedAnswer || !currentQuestion) return;

        const isCorrect = selectedAnswer === (currentQuestion.answer || currentQuestion.correct_answer);
        setQuestionResult(isCorrect ? 'correct' : 'incorrect');
        if (isCorrect) {
            scoreRef.current += 1; // Update ref immediately (no batching delay)
            setScore(scoreRef.current);
        }
    };

    const handleNextQuestion = async () => {
        const nextIndex = currentQuestionIndex + 1;

        if (nextIndex >= totalQuestions) {
            // Use the ref — always in sync, never stale
            const finalScore = scoreRef.current;
            setScore(finalScore);
            setQuizFinished(true);

            const passed = finalScore >= PASS_THRESHOLD;
            if (passed) {
                setLoading(true);
                try {
                    const phone = localStorage.getItem('userPhone');
                    const participant = await getParticipant(phone);
                    await submitLessonProgress(participant.id, lessonId, Math.round((finalScore / totalQuestions) * 100));
                    triggerCelebration();
                    setLessonCompleted(true);
                } catch (err) {
                    console.error("Failed to submit progress:", err);
                } finally {
                    setLoading(false);
                }
            }
        } else {
            // Move to next question
            setCurrentQuestionIndex(nextIndex);
            setSelectedAnswer(null);
            setQuestionResult(null);
        }
    };

    const handleRetryQuestion = () => {
        setSelectedAnswer(null);
        setQuestionResult(null);
    };

    const handleClaimWithoutQuiz = async () => {
        setLoading(true);
        try {
            const phone = localStorage.getItem('userPhone');
            const participant = await getParticipant(phone);
            await submitLessonProgress(participant.id, lessonId, 100);
            triggerCelebration();
            setLessonCompleted(true);
        } catch (err) {
            console.error("Failed to claim grant:", err);
        } finally {
            setLoading(false);
        }
    };

    // ─── Lesson Complete Screen ───────────────────────────────────────────────
    if (lessonCompleted) {
        return (
            <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 blur-[120px] rounded-full animate-pulse pointer-events-none" />
                <div className="max-w-xl w-full glass-panel p-12 rounded-[48px] border border-white/10 relative z-10 text-center shadow-2xl shadow-brand-500/10">
                    <div className="relative mb-10">
                        <div className="w-24 h-24 bg-gradient-to-br from-brand-400 to-magenta-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-brand-500/40 relative z-10 animate-bounce">
                            <Award className="w-12 h-12 text-white" />
                        </div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-brand-500/20 blur-2xl rounded-full" />
                    </div>
                    <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">MISSION MASTERED! 🎉</h2>
                    <p className="text-slate-400 mb-10 leading-relaxed text-lg font-medium">
                        You answered {score}/{totalQuestions || 1} correctly. Your reward has been triggered and is moving to your wallet.
                    </p>
                    <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 mb-10 group hover:border-brand-500/30 transition-all duration-500">
                        <div className="text-[10px] font-black text-brand-400 uppercase tracking-[0.3em] mb-3">Reward Earned</div>
                        <div className="text-5xl font-black text-white group-hover:scale-110 transition-transform duration-500">
                            {formatNaira(toNaira(lesson?.grant_amount || 0))}
                        </div>
                        <div className="text-sm text-slate-500 mt-2">{formatCUSD(lesson?.grant_amount || 0)} cUSD</div>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-6 bg-white hover:bg-brand-500 text-black hover:text-white rounded-[24px] font-black uppercase tracking-widest text-sm transition-all duration-500 shadow-xl hover:shadow-brand-500/40 flex items-center justify-center gap-3 group"
                    >
                        Return to Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </button>
                    <p className="mt-8 text-[10px] font-black uppercase tracking-widest text-slate-600">
                        ✅ Verified by HerFuture Chain
                    </p>
                </div>
            </div>
        );
    }

    // ─── Quiz Finished, Did Not Pass Screen ──────────────────────────────────
    if (quizFinished && !lessonCompleted) {
        return (
            <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center p-6 relative overflow-hidden">
                <div className="max-w-xl w-full glass-panel p-12 rounded-[48px] border border-white/10 relative z-10 text-center">
                    <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                        <XCircle className="w-12 h-12 text-red-400" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4">Almost There! 💪</h2>
                    <p className="text-slate-400 mb-6">
                        You got <span className="text-white font-bold">{score}/{totalQuestions}</span> correct. You need at least <span className="text-brand-400 font-bold">{PASS_THRESHOLD}/{totalQuestions}</span> to unlock your reward.
                    </p>
                    <p className="text-slate-500 text-sm mb-10">Re-watch the lesson video to review the key concepts, then try again.</p>
                    <button
                        onClick={() => {
                            setShowQuiz(false);
                            setCurrentQuestionIndex(0);
                            setSelectedAnswer(null);
                            setQuestionResult(null);
                            setScore(0);
                            setQuizFinished(false);
                        }}
                        className="w-full py-5 bg-brand-500 hover:bg-brand-400 text-white rounded-[24px] font-black uppercase tracking-widest text-sm transition-all"
                    >
                        Re-watch & Try Again
                    </button>
                </div>
            </div>
        );
    }

    // ─── Loading State ────────────────────────────────────────────────────────
    if (loading && !lesson) return (
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
            <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all text-sm mb-4">
                Back to Dashboard
            </button>
            <button onClick={() => window.location.reload()} className="text-brand-400 text-xs font-bold hover:underline">
                Retry Sync
            </button>
        </div>
    );

    // ─── Main Lesson Player ───────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#0A0F1C] flex flex-col">
            {/* Header */}
            <header className="p-4 flex items-center justify-between border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-xs font-medium text-slate-500 hover:text-white transition-colors">Exit Academy</span>
                </button>
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
                    {lesson.title}
                </div>
                <div className="w-24" />
            </header>

            <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-65px)] overflow-hidden">
                {/* Main Content: Video or Quiz */}
                <div className="flex-1 bg-black flex flex-col items-center justify-center relative">
                    {!showQuiz ? (
                        <div className="w-full">
                            <YoutubePlayer url={lesson.video_url} />
                        </div>
                    ) : (
                        // ── Step-by-Step Quiz ──
                        <div className="w-full max-w-xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Quiz Header */}
                            <div className="text-center mb-8">
                                <div className="w-14 h-14 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Zap className="w-7 h-7 text-brand-400 animate-pulse" />
                                </div>
                                <h2 className="text-2xl font-black text-white tracking-tight">KNOWLEDGE CHECK</h2>
                                <p className="text-slate-500 text-sm mt-1">
                                    Pass <span className="text-brand-400 font-bold">{PASS_THRESHOLD}/{totalQuestions}</span> to unlock your <span className="text-brand-400 font-bold">{formatNaira(toNaira(lesson?.grant_amount || 0))}</span> reward.
                                </p>
                            </div>

                            {/* Step Progress Dots */}
                            {totalQuestions > 0 && (
                                <div className="flex items-center justify-center gap-2 mb-8">
                                    {allQuestions.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-2 rounded-full transition-all duration-500 ${i < currentQuestionIndex
                                                ? 'w-6 bg-emerald-500'
                                                : i === currentQuestionIndex
                                                    ? 'w-8 bg-brand-500'
                                                    : 'w-2 bg-white/10'
                                                }`}
                                        />
                                    ))}
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                                        {currentQuestionIndex + 1}/{totalQuestions}
                                    </span>
                                </div>
                            )}

                            {/* Question */}
                            {currentQuestion ? (
                                <div className="space-y-3">
                                    <p className="text-slate-100 text-base md:text-lg mb-6 leading-relaxed font-medium">
                                        {currentQuestion.question}
                                    </p>

                                    {/* Answer Options */}
                                    {(currentQuestion.options || []).map((option) => {
                                        const isSelected = selectedAnswer === option;
                                        const correctAnswer = currentQuestion.answer || currentQuestion.correct_answer;
                                        const isCorrectOption = option === correctAnswer;

                                        let optionStyle = 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10';
                                        if (questionResult) {
                                            if (isCorrectOption) optionStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300';
                                            else if (isSelected && !isCorrectOption) optionStyle = 'bg-red-500/10 border-red-500/50 text-red-400';
                                            else optionStyle = 'bg-white/5 border-white/5 text-slate-600 opacity-50';
                                        } else if (isSelected) {
                                            optionStyle = 'bg-brand-500/20 border-brand-500 text-brand-400';
                                        }

                                        return (
                                            <button
                                                key={option}
                                                onClick={() => handleAnswerSelect(option)}
                                                disabled={!!questionResult}
                                                className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between ${optionStyle}`}
                                            >
                                                <span className="flex-1 text-sm font-medium">{option}</span>
                                                {questionResult && isCorrectOption && <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                                                {questionResult && isSelected && !isCorrectOption && <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
                                                {!questionResult && isSelected && <CheckCircle className="w-5 h-5 text-brand-400 flex-shrink-0" />}
                                            </button>
                                        );
                                    })}

                                    {/* Feedback Banner */}
                                    {questionResult && (
                                        <div className={`mt-4 p-4 rounded-2xl text-center font-black text-sm uppercase tracking-wider animate-in fade-in duration-300 ${questionResult === 'correct'
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                            {questionResult === 'correct' ? '✅ Correct! Well done.' : '❌ Not quite. Review the answer above.'}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="pt-4 space-y-3">
                                        {!questionResult ? (
                                            <button
                                                onClick={handleSubmitAnswer}
                                                disabled={!selectedAnswer || loading}
                                                className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-400 text-white font-black uppercase tracking-wider text-xs shadow-xl shadow-brand-500/20 transition-all disabled:opacity-40"
                                            >
                                                {!selectedAnswer ? 'Select an Answer' : 'Submit Answer'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleNextQuestion}
                                                disabled={loading}
                                                className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-400 text-white font-black uppercase tracking-wider text-xs shadow-xl shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                {currentQuestionIndex + 1 >= totalQuestions ? (loading ? 'Processing...' : 'See Results') : 'Next Question'}
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        )}

                                        <button onClick={() => setShowQuiz(false)} className="w-full text-xs font-bold text-slate-500 hover:text-white transition-colors py-2">
                                            ← Back to Video
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // No quiz found
                                <div className="text-center">
                                    <p className="text-slate-500 mb-6">No quiz found for this lesson. You can claim your reward!</p>
                                    <button onClick={handleClaimWithoutQuiz} disabled={loading} className="btn-primary px-8 py-4 flex items-center gap-2 justify-center mx-auto">
                                        {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Claim My Reward'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-[400px] border-l border-white/5 bg-[#0D121F] flex flex-col">
                    <div className="flex border-b border-white/5">
                        <button onClick={() => setActiveTab('video')} className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'video' ? 'text-brand-400 bg-brand-500/5 border-b-2 border-brand-500' : 'text-slate-600 hover:text-slate-300'}`}>
                            Lesson Overview
                        </button>
                        <button onClick={() => setActiveTab('outcomes')} className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'outcomes' ? 'text-brand-400 bg-brand-500/5 border-b-2 border-brand-500' : 'text-slate-600 hover:text-slate-300'}`}>
                            Learning Goals
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                        {activeTab === 'video' ? (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <h2 className="text-xl font-bold text-white mb-3 leading-tight">{lesson.title}</h2>
                                <p className="text-slate-400 text-sm leading-relaxed mb-6">{lesson.content}</p>
                                <div className="p-5 rounded-2xl bg-brand-500/5 border border-brand-500/10 mb-6">
                                    <div className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1">Lesson Reward</div>
                                    <div className="text-2xl font-black text-white">{formatNaira(toNaira(lesson.grant_amount))}</div>
                                    <div className="text-xs text-slate-500 mt-1">{formatCUSD(lesson.grant_amount)} cUSD · Paid directly to your wallet — instantly 🎉</div>
                                </div>
                                {!showQuiz && (
                                    <button
                                        onClick={() => setShowQuiz(true)}
                                        className="w-full py-4 rounded-2xl bg-white text-[#060914] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-brand-500 hover:text-white transition-all shadow-xl"
                                    >
                                        Take the Quiz <ArrowRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <h3 className="text-sm font-black text-white/30 uppercase tracking-[0.2em] mb-4">Competencies To Master</h3>
                                <div className="space-y-3">
                                    {(lesson.learning_outcomes || []).map((outcome, i) => (
                                        <div key={i} className="flex gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 items-start">
                                            <CheckCircle className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-slate-300 font-medium leading-relaxed">{outcome}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
