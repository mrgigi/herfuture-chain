import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle, Award, ArrowRight, BookOpen, PlayCircle, HelpCircle } from 'lucide-react';
import { getQuiz, submitLessonProgress, getParticipant, getLesson } from '../lib/api';

export default function LessonPlayer() {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [completed, setCompleted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('video'); // 'video' or 'outcomes'

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [lessonData, quizData] = await Promise.all([
                    getLesson(lessonId),
                    getQuiz(lessonId)
                ]);
                setLesson(lessonData);
                if (quizData && quizData.length > 0) {
                    setQuiz(quizData[0]);
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

    if (completed) {
        return (
            <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center p-6 text-center">
                <div className="max-w-md w-full glass-panel p-10 rounded-3xl">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                        <Award className="w-10 h-10 text-green-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">You've Earned It! 🎊</h2>
                    <p className="text-slate-400 mb-8">
                        You successfully passed the lesson. A micro-grant is being released to your wallet on the <span className="text-white">secure</span> blockchain.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-8 py-4 bg-brand-500 hover:bg-brand-400 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 mx-auto"
                    >
                        Go to Dashboard <ArrowRight className="w-5 h-5" />
                    </button>
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
            <h2 className="text-xl font-bold text-white mb-2">Module Not Found</h2>
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
                <div className="text-xs font-black text-white/40 uppercase tracking-[0.4em]">
                    Module {lesson.track_label}
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
                                src={`${lesson.video_url}?autoplay=1&rel=0`}
                                title={lesson.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    ) : (
                        <div className="w-full max-w-xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center mb-10">
                                <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <HelpCircle className="w-8 h-8 text-brand-400" />
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2">Knowledge Check</h2>
                                <p className="text-slate-500 text-sm">Pass the quiz to unlock your micro-grant.</p>
                            </div>

                            {quiz ? (
                                <div className="space-y-4">
                                    <p className="text-slate-200 text-lg mb-8 leading-relaxed font-medium">{quiz.question}</p>
                                    {quiz.options.map((option) => (
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
                                        className="w-full py-5 rounded-2xl bg-brand-500 hover:bg-brand-400 text-white font-black uppercase tracking-widest text-xs mt-10 shadow-xl shadow-brand-500/20 transition-all disabled:opacity-50"
                                    >
                                        {loading ? 'Processing Blockchain Grant...' : 'Submit & Release Grant'}
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
                                    <p className="text-slate-500 mb-6">No quiz found for this module. You can claim your reward!</p>
                                    <button
                                        onClick={() => setCompleted(true)}
                                        className="btn-primary px-8 py-4"
                                    >
                                        Claim Milestone Grant
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
                            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'video' ? 'text-brand-400 bg-brand-500/5 border-b-2 border-brand-500' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Module Info
                        </button>
                        <button
                            onClick={() => setActiveTab('outcomes')}
                            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'outcomes' ? 'text-brand-400 bg-brand-500/5 border-b-2 border-brand-500' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Learning Outcomes
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        {activeTab === 'video' ? (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <h2 className="text-2xl font-bold text-white mb-4 leading-tight">{lesson.title}</h2>
                                <p className="text-slate-400 text-sm leading-relaxed mb-8">{lesson.content}</p>

                                <div className="p-6 rounded-3xl bg-brand-500/5 border border-brand-500/10 mb-8">
                                    <div className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-2">Milestone Reward</div>
                                    <div className="text-2xl font-black text-white">{lesson.grant_amount} cUSD</div>
                                    <div className="text-xs text-slate-500 mt-1">Released instantly on-chain</div>
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
                                    {(lesson.learning_outcomes || []).map((outcome, i) => (
                                        <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 items-start">
                                            <div className="mt-1">
                                                <CheckCircle className="w-4 h-4 text-brand-400" />
                                            </div>
                                            <p className="text-sm text-slate-300 font-medium leading-relaxed">{outcome}</p>
                                        </div>
                                    ))}
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
