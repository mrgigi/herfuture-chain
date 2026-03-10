import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle, XCircle, Award, ArrowRight, HelpCircle, Zap, ExternalLink } from 'lucide-react';
import { getQuiz, submitLessonProgress, getParticipant, getLesson } from '../lib/api';
import confetti from 'canvas-confetti';
import YoutubePlayer from '../components/YoutubePlayer';
import ThemeToggle from '../components/ThemeToggle';
import { useCurrency } from '../hooks/useCurrency';

// Pass = 100% correct — works for any number of questions


const normalizeString = (str) => {
    if (!str) return "";
    return str
        .toString()
        .replace(/\u00A0/g, ' ') // Replace non-breaking spaces
        .replace(/\s+/g, ' ')   // Collapse multiple spaces to single space
        .trim()
        .toLowerCase();
};

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
    const [grantStatus, setGrantStatus] = useState(null); // 'disbursed' | 'paused' | null
    const [txHash, setTxHash] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [courseCompleted, setCourseCompleted] = useState(false);

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

        const normalizedSelected = normalizeString(selectedAnswer);
        const normalizedCorrect = normalizeString(currentQuestion.answer || currentQuestion.correct_answer);

        const isCorrect = normalizedSelected === normalizedCorrect;
        setQuestionResult(isCorrect ? 'correct' : 'incorrect');
        if (isCorrect) {
            scoreRef.current += 1; // Update ref immediately (no batching delay)
            setScore(scoreRef.current);
        }
    };

    const submitProgress = async (finalScore) => {
        setSubmitting(true);
        setSubmitError(null);
        try {
            const phone = localStorage.getItem('userPhone');
            const participant = await getParticipant(phone);
            const scorePercentage = totalQuestions > 0 ? Math.round((finalScore / totalQuestions) * 100) : 100;
            const res = await submitLessonProgress(participant.id, lessonId, scorePercentage);
            setGrantStatus(res.grantStatus);
            setTxHash(res.txHash);

            triggerCelebration();
            if (res.courseCompleted) {
                // Extended celebration for course completion
                setTimeout(triggerCelebration, 1000);
                setTimeout(triggerCelebration, 2500);
                setCourseCompleted(true);
            }

            setLessonCompleted(true);
        } catch (err) {
            console.error("Failed to submit progress:", err);
            setSubmitError(err.message || 'Unable to record your reward. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleNextQuestion = async () => {
        const nextIndex = currentQuestionIndex + 1;

        if (nextIndex >= totalQuestions) {
            // Use the ref — always in sync, never stale
            const finalScore = scoreRef.current;
            setScore(finalScore);
            setQuizFinished(true);

            // Must score 100% to pass — scales to any number of questions
            const passed = finalScore === totalQuestions;
            if (passed) {
                submitProgress(finalScore);
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
        submitProgress(100);
    };

    // ─── Lesson Complete Screen ───────────────────────────────────────────────
    if (lessonCompleted) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1C] flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 blur-[120px] rounded-full animate-pulse pointer-events-none" />
                <div className="max-w-xl w-full glass-panel bg-white/70 dark:bg-[#0D1525]/50 p-12 rounded-[48px] border border-slate-200 dark:border-white/10 relative z-10 text-center shadow-2xl dark:shadow-brand-500/10">
                    <div className="relative mb-10">
                        <div className="w-24 h-24 bg-gradient-to-br from-brand-500 to-brand-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-brand-500/40 relative z-10 animate-bounce">
                            <Award className="w-12 h-12 text-white" />
                        </div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-brand-500/20 blur-2xl rounded-full" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter uppercase italic">
                        {courseCompleted ? "COURSE COMPLETE! 🎓🌟" : "YOU DID IT! 🌟"}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-12 leading-relaxed max-w-sm mx-auto font-medium">
                        {courseCompleted
                            ? "Incredible! You have officially graduated from this Learning Path. Your verified completion certificate has been minted to your DID."
                            : grantStatus === 'paused'
                                ? "✅ Progress recorded! Your reward will be processed as soon as grant disbursement resumes."
                                : "Your hard work paid off! Your reward has been sent straight to your wallet."
                        }
                    </p>

                    {courseCompleted && (
                        <div className="mb-8 p-6 rounded-3xl bg-brand-500/10 border border-brand-500/20 text-center animate-in zoom-in duration-500 shadow-inner">
                            <h3 className="text-lg font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-2 flex flex-col items-center justify-center gap-2">
                                🎓 Official Graduate
                            </h3>
                            <p className="text-xs text-brand-700 dark:text-brand-300 font-medium px-4">Check the Certificates dashboard to view your official Web3 credential.</p>
                        </div>
                    )}

                    <div className="p-8 rounded-[32px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-10 group hover:border-brand-500/30 transition-all duration-500 shadow-inner dark:shadow-none">
                        <div className="flex justify-between items-center mb-3">
                            <div className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-[0.3em]">Reward Earned</div>
                            {txHash && (
                                <a
                                    href={`https://sepolia.celoscan.io/tx/${txHash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] font-black text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 uppercase transition-colors"
                                >
                                    View Receipt <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>
                        <div className="text-5xl font-black text-slate-900 dark:text-white group-hover:scale-110 transition-transform duration-500">
                            {formatNaira(toNaira(lesson?.grant_amount || 0))}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-500 mt-2 font-bold">{formatCUSD(lesson?.grant_amount || 0)} cUSD</div>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-6 bg-slate-900 dark:bg-white hover:bg-brand-600 dark:hover:bg-brand-500 text-white dark:text-black hover:text-white rounded-[24px] font-black uppercase tracking-widest text-sm transition-all duration-500 shadow-xl hover:shadow-brand-500/40 flex items-center justify-center gap-3 group"
                    >
                        Return to Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </button>
                    <p className="mt-8 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
                        ✅ Verified by HerFuture Chain
                    </p>
                </div>
            </div>
        );
    }

    // ─── Quiz Finished Screen (Pass with Error, or Did Not Pass) ──────────────
    if (quizFinished && !lessonCompleted) {
        const passed = score === totalQuestions;

        if (passed) {
            return (
                <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1C] flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
                    <div className="max-w-sm w-full glass-panel bg-white/80 dark:bg-[#0D1525]/50 p-10 rounded-[40px] border border-slate-200 dark:border-white/10 relative z-10 text-center shadow-2xl dark:shadow-none">
                        {submitting ? (
                            <>
                                <div className="w-20 h-20 bg-brand-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <div className="h-8 w-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin shadow-lg shadow-brand-500/20" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Recording Progress...</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-3 font-medium">Please wait while we secure your reward.</p>
                            </>
                        ) : submitError ? (
                            <>
                                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-xl shadow-red-500/20 border border-red-500/20">
                                    ⚠️
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Submission Failed</h2>
                                <p className="text-red-500 dark:text-red-400 text-sm mb-6 leading-relaxed font-medium pb-2 border-b border-slate-100 dark:border-white/5">{submitError}</p>
                                <button
                                    onClick={() => submitProgress(score)}
                                    className="w-full py-4 bg-red-500 hover:bg-red-400 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-red-500/20"
                                >
                                    Retry Claim Reward
                                </button>
                                <button
                                    onClick={() => setQuizFinished(false)}
                                    className="w-full mt-4 text-xs font-bold text-slate-500 hover:text-white transition-colors py-2"
                                >
                                    ← Back to Video
                                </button>
                            </>
                        ) : null}
                    </div>
                </div>
            );
        }

        // Tier the message based on how many they got right
        const isZero = score === 0;
        const emoji = isZero ? '😅' : '💪';
        const headline = isZero ? "Don't Give Up!" : 'Almost There!';
        const subtext = isZero
            ? "You didn't get any right this time — that's okay! Re-watch the video carefully and try again."
            : `You got ${score}/${totalQuestions} correct — so close! Review the parts you missed and give it another shot.`;

        const handleRetry = () => {
            scoreRef.current = 0; // reset the ref
            setScore(0);
            setShowQuiz(false);
            setCurrentQuestionIndex(0);
            setSelectedAnswer(null);
            setQuestionResult(null);
            setQuizFinished(false);
            setSubmitError(null);
        };

        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1C] flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
                <div className="max-w-sm w-full glass-panel bg-white/80 dark:bg-[#0D1525]/50 p-10 rounded-[40px] border border-slate-200 dark:border-white/10 relative z-10 text-center shadow-2xl dark:shadow-none">
                    <div className={`w-20 h-20 ${isZero ? 'bg-slate-100 dark:bg-slate-800/60' : 'bg-amber-500/10'} rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner dark:shadow-none`}>
                        {emoji}
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">{headline}</h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 leading-relaxed font-medium">{subtext}</p>
                    <p className="text-slate-400 dark:text-slate-600 text-xs mb-8 uppercase tracking-widest font-black">You need <span className="text-brand-600 dark:text-brand-400 font-bold">all {totalQuestions} correct</span> to earn your reward.</p>
                    <button
                        onClick={handleRetry}
                        className={`w-full py-4 ${isZero ? 'bg-slate-700 hover:bg-slate-600' : 'bg-brand-500 hover:bg-brand-400'} text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all`}
                    >
                        {isZero ? 'Try Again' : 'Re-watch & Try Again'}
                    </button>
                </div>
            </div>
        );
    }

    // ─── Loading State ────────────────────────────────────────────────────────
    if (loading && !lesson) return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1C] flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
            <div className="h-12 w-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-500 dark:text-slate-500 font-bold uppercase tracking-widest text-[10px]">Syncing with HerFuture Academy...</p>
        </div>
    );

    if (!lesson) return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1C] flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <HelpCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Lesson Not Found</h2>
            <p className="text-slate-500 dark:text-slate-500 mb-8 max-w-xs mx-auto font-medium">This lesson might be still synchronizing or doesn't exist yet.</p>
            <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl font-bold transition-all text-sm mb-4 shadow-lg">
                Back to Dashboard
            </button>
            <button onClick={() => window.location.reload()} className="text-brand-400 text-xs font-bold hover:underline">
                Retry Sync
            </button>
        </div>
    );

    // ─── Main Lesson Player ───────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1C] flex flex-col transition-colors duration-300">
            {/* Header */}
            <header className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 transition-colors">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Exit Academy</span>
                </button>
                <div className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] italic text-center mx-2 line-clamp-1">
                    {lesson.title}
                </div>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                </div>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-65px)] overflow-hidden">
                {/* Main Content: Video or Quiz */}
                <div className="flex-1 bg-white dark:bg-black flex flex-col items-center justify-center relative overflow-y-auto">
                    {!showQuiz ? (
                        <div className="w-full">
                            <YoutubePlayer url={lesson.video_url} />
                        </div>
                    ) : (
                        // ── Step-by-Step Quiz ──
                        <div className="w-full max-w-xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Quiz Header */}
                            <div className="text-center mb-8">
                                <div className="w-14 h-14 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-500/20">
                                    <Zap className="w-7 h-7 text-brand-600 dark:text-brand-400 animate-pulse" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">KNOWLEDGE CHECK.</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-bold">
                                    Pass <span className="text-brand-600 dark:text-brand-400 font-black">{totalQuestions}/{totalQuestions}</span> to unlock your <span className="text-brand-600 dark:text-brand-400 font-black">{formatNaira(toNaira(lesson?.grant_amount || 0))}</span> reward.
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
                                                    ? 'w-8 bg-brand-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                                                    : 'w-2 bg-slate-200 dark:bg-white/10'
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
                                <div className="space-y-4">
                                    <p className="text-slate-800 dark:text-slate-100 text-base md:text-lg mb-6 leading-relaxed font-bold italic">
                                        {currentQuestion.question}
                                    </p>

                                    {/* Answer Options */}
                                    {(currentQuestion.options || []).map((option) => {
                                        const isSelected = selectedAnswer === option;
                                        const isCorrectOption = normalizeString(option) === normalizeString(currentQuestion.answer || currentQuestion.correct_answer);

                                        let optionStyle = 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-brand-500/30 shadow-sm transition-all';
                                        if (questionResult) {
                                            if (isCorrectOption) optionStyle = 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300';
                                            else if (isSelected && !isCorrectOption) optionStyle = 'bg-red-500/10 dark:bg-red-500/20 border-red-500/50 text-red-600 dark:text-red-400';
                                            else optionStyle = 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-400 dark:text-slate-600 opacity-50';
                                        } else if (isSelected) {
                                            optionStyle = 'bg-brand-50 dark:bg-brand-500/20 border-brand-500 text-brand-700 dark:text-brand-400 shadow-md';
                                        }

                                        return (
                                            <button
                                                key={option}
                                                onClick={() => handleAnswerSelect(option)}
                                                disabled={!!questionResult}
                                                className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between group/opt ${optionStyle}`}
                                            >
                                                <span className="flex-1 text-sm font-bold">{option}</span>
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
                                                disabled={!selectedAnswer || submitting}
                                                className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-400 text-white font-black uppercase tracking-wider text-xs shadow-xl shadow-brand-500/20 transition-all disabled:opacity-40"
                                            >
                                                {!selectedAnswer ? 'Select an Answer' : 'Submit Answer'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleNextQuestion}
                                                disabled={submitting}
                                                className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-400 text-white font-black uppercase tracking-wider text-xs shadow-xl shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                {currentQuestionIndex + 1 >= totalQuestions ? (submitting ? 'Processing...' : 'See Results') : 'Next Question'}
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
                                    <p className="text-slate-500 dark:text-slate-500 mb-6 font-bold uppercase tracking-widest text-xs">No quiz found for this lesson. You can claim your reward!</p>

                                    {submitError && (
                                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-xl font-bold shadow-md">
                                            {submitError}
                                        </div>
                                    )}

                                    <button onClick={handleClaimWithoutQuiz} disabled={submitting} className="w-full py-5 bg-brand-500 hover:bg-brand-400 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-brand-500/20 flex items-center gap-2 justify-center mx-auto transition-all max-w-[280px]">
                                        {submitting ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Claim My Reward'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-[400px] border-l border-slate-200 dark:border-white/5 bg-white dark:bg-[#0D121F] flex flex-col transition-colors">
                    <div className="flex border-b border-slate-200 dark:border-white/5">
                        <button onClick={() => setActiveTab('video')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'video' ? 'text-brand-600 dark:text-brand-400 bg-slate-50 dark:bg-brand-500/5 border-b-2 border-brand-500' : 'text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-slate-300'}`}>
                            Lesson Overview
                        </button>
                        <button onClick={() => setActiveTab('outcomes')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'outcomes' ? 'text-brand-600 dark:text-brand-400 bg-slate-50 dark:bg-brand-500/5 border-b-2 border-brand-500' : 'text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-slate-300'}`}>
                            Learning Goals
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                        {activeTab === 'video' ? (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3 leading-tight italic uppercase">{lesson.title}</h2>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 font-medium">{lesson.content}</p>
                                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-brand-500/5 border border-slate-200 dark:border-brand-500/10 mb-6 shadow-sm dark:shadow-none">
                                    <div className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-1">Lesson Reward</div>
                                    <div className="text-2xl font-black text-slate-900 dark:text-white">{formatNaira(toNaira(lesson.grant_amount))}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-500 mt-1 font-medium">{formatCUSD(lesson.grant_amount)} cUSD · Paid directly to your wallet — instantly 🎉</div>
                                </div>
                                {!showQuiz && (
                                    <button
                                        onClick={() => setShowQuiz(true)}
                                        className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-[#060914] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-brand-600 dark:hover:bg-brand-500 hover:text-white transition-all shadow-xl"
                                    >
                                        Take the Quiz <ArrowRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <h3 className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] mb-4">Competencies To Master</h3>
                                <div className="space-y-3">
                                    {(lesson.learning_outcomes || []).map((outcome, i) => (
                                        <div key={i} className="flex gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 items-start shadow-sm dark:shadow-none">
                                            <CheckCircle className="w-4 h-4 text-brand-600 dark:text-brand-400 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-slate-700 dark:text-slate-300 font-bold leading-relaxed">{outcome}</p>
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
