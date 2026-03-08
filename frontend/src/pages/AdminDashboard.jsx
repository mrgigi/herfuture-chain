import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Users, BookOpen, DollarSign, Settings, Search, MoreHorizontal,
    GraduationCap, ArrowUpRight, ShieldCheck, Power, LayoutGrid, Activity,
    Edit3, ChevronRight, Save, X, PlusCircle, Home, Globe, LogOut,
    HelpCircle, List, Loader2, Book, CheckCircle, Trash2, Sparkles,
    Trophy, ArrowRight, ExternalLink, Menu, AlertCircle
} from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import api, {
    getCourses, getModules, getAdminParticipants, getSystemSettings,
    updateSystemSetting, updateCourseStatus, updateCourseDetails,
    updateModule, updateLesson,
    createModule, deleteModule, createLesson, deleteLesson,
    createCourse, deleteCourse, generateQuizAI, getQuiz, saveQuiz,
    deleteParticipant
} from '../lib/api';

const CurriculumInput = ({ value, onChange, onBlur, className, placeholder, isTextArea = false }) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (e) => {
        setLocalValue(e.target.value);
        if (onChange) onChange(e.target.value);
    };

    if (isTextArea) {
        return (
            <textarea
                value={localValue || ''}
                onChange={handleChange}
                onBlur={() => onBlur && onBlur(localValue)}
                className={className}
                placeholder={placeholder}
            />
        );
    }

    return (
        <input
            type="text"
            value={localValue || ''}
            onChange={handleChange}
            onBlur={() => onBlur && onBlur(localValue)}
            className={className}
            placeholder={placeholder}
        />
    );
};

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Overview');
    const [editingCourse, setEditingCourse] = useState(null); // Drill-down state
    const [courseModules, setCourseModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [isSavingMetadata, setIsSavingMetadata] = useState(false);
    const [isAddingModule, setIsAddingModule] = useState(false);
    const [isAddingLesson, setIsAddingLesson] = useState(false);
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(null); // lessonId of current generation
    const [quizEditorOpen, setQuizEditorOpen] = useState(false);
    const [currentLessonForQuiz, setCurrentLessonForQuiz] = useState(null);
    const [quizData, setQuizData] = useState([]);
    const [isSavingQuiz, setIsSavingQuiz] = useState(false);
    const [toast, setToast] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // stores course object
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showStudentDeleteConfirm, setShowStudentDeleteConfirm] = useState(null); // stores student object

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const queryClient = useQueryClient();

    // Queries
    const { data: courses = [], isLoading: coursesLoading } = useQuery({
        queryKey: ['admin-courses'],
        queryFn: getCourses
    });

    const { data: studentData = { participants: [] }, isLoading: studentsLoading } = useQuery({
        queryKey: ['admin-participants'],
        queryFn: () => getAdminParticipants()
    });

    const { data: settings = { grant_disbursement_active: true }, isLoading: settingsLoading } = useQuery({
        queryKey: ['admin-settings'],
        queryFn: getSystemSettings
    });

    const { data: grantsData, isLoading: grantsLoading } = useQuery({
        queryKey: ['admin-recent-grants'],
        queryFn: () => api.get('/impact/recent-grants')
    });

    const students = studentData.participants || [];
    const recentGrants = grantsData?.data?.grants || [];
    const isLoading = coursesLoading || studentsLoading || settingsLoading || grantsLoading;

    useEffect(() => {
        const isAdmin = sessionStorage.getItem('is_admin') === 'true';
        if (!isAdmin) {
            navigate('/admin-login');
            return;
        }
        setAuthorized(true);
    }, [navigate]);

    // Loading State for Auth
    useEffect(() => {
        if (authorized && !isLoading) {
            setLoading(false);
        }
    }, [authorized, isLoading]);

    const handleCourseClick = async (course) => {
        setLoading(true);
        try {
            const mods = await getModules(course.id);
            setEditingCourse(course);
            setCourseModules(mods);
            setActiveTab('CurriculumEditor');
        } catch (err) {
            console.error("Fetch modules error:", err);
        } finally {
            setLoading(false);
        }
    };

    const saveCourse = async () => {
        setIsSavingMetadata(true);
        try {
            await updateCourseDetails(editingCourse.id, {
                title: editingCourse.title,
                learning_outcome: editingCourse.learning_outcome,
                description: editingCourse.description,
                image_url: editingCourse.image_url,
                track_number: parseInt(editingCourse.track_number) || 1
            });
            queryClient.setQueryData(['admin-courses'], prev => prev.map(c => c.id === editingCourse.id ? editingCourse : c));
            showToast("Learning Path metadata updated");
        } catch (err) {
            console.error("Save course error:", err);
            const errorMsg = err.response?.data?.error || "Update failed";
            showToast(errorMsg, "error");
        } finally {
            setIsSavingMetadata(false);
        }
    };

    const saveLessonValue = async (lessonId, field, value) => {
        // Update local state immediately for snappy UI
        setCourseModules(prev => prev.map(m => ({
            ...m,
            lessons: m.lessons.map(l => l.id === lessonId ? { ...l, [field]: value } : l)
        })));

        // Skip backend sync for temporary IDs - they get saved during "Update Metadata"
        if (lessonId.startsWith('temp-')) return;

        try {
            await updateLesson(lessonId, { [field]: value });
        } catch (err) {
            console.error("Auto-save lesson error:", err);
        }
    };

    const handleDeleteTrack = async (courseId) => {
        try {
            await deleteCourse(courseId);
            showToast("Learning Path permanently erased", "success");
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            setShowDeleteConfirm(null);
            if (editingCourse && editingCourse.id === courseId) {
                setActiveTab('Curriculum');
                setEditingCourse(null);
            }
        } catch (err) {
            console.error("Delete track error:", err);
            showToast(err.response?.data?.error || "Failed to erase Learning Path", "error");
        }
    };

    const handleDeleteStudent = async (participantId) => {
        try {
            await deleteParticipant(participantId);
            showToast("Student permanently removed from registry", "success");
            queryClient.invalidateQueries({ queryKey: ['admin-participants'] });
            setShowStudentDeleteConfirm(null);
            setSelectedStudent(null);
        } catch (err) {
            console.error("Delete student error:", err);
            showToast(err.response?.data?.error || "Failed to remove student", "error");
        }
    };

    const handleUploadCover = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // In a real app, we'd upload to Supabase Storage. 
        // For now, we'll use a data URL for the demo/user.
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result;
            // Update local state - DO NOT call API immediately to avoid redundant heavy requests
            // and potential race conditions. We'll save it when the user clicks "Update Metadata".
            setEditingCourse({ ...editingCourse, image_url: base64 });
            showToast("Cover artwork ready. Click Update to save.");
        };
        reader.readAsDataURL(file);
    };

    const handleGenerateAIQuiz = async (lesson) => {
        if (!lesson.title && !lesson.content) {
            alert("Please provide a lesson title or summary first!");
            return;
        }
        setIsGeneratingQuiz(lesson.id);
        try {
            const result = await generateQuizAI({
                lessonId: lesson.id,
                title: lesson.title,
                learning_outcome: editingCourse.learning_outcome,
                content: lesson.content
            });
            alert(`Successfully generated a 5-question quiz for "${lesson.title}"!`);
            // Optionally refresh lesson data if needed
        } catch (err) {
            console.error("AI Generation error:", err);
            alert("Failed to generate quiz. Check console for details.");
        } finally {
            setIsGeneratingQuiz(null);
        }
    };

    const handleEditQuizManual = async (lesson) => {
        if (lesson.id.startsWith('temp-')) {
            alert("Please 'Update Metadata' for this lesson first to generate a permanent ID on the blockchain.");
            return;
        }
        setCurrentLessonForQuiz(lesson);
        setQuizData([]);
        setQuizEditorOpen(true);
        try {
            const data = await getQuiz(lesson.id);
            if (data && data.length > 0) {
                setQuizData(data[0].data || []);
            }
        } catch (err) {
            console.error("Fetch quiz error:", err);
        }
    };

    const handleSaveQuizManual = async () => {
        if (!currentLessonForQuiz) return;
        setIsSavingQuiz(true);
        try {
            await saveQuiz(currentLessonForQuiz.id, quizData);
            setQuizEditorOpen(false);
            alert("Quiz saved successfully!");
        } catch (err) {
            console.error("Save quiz error:", err);
            alert("Failed to save quiz");
        } finally {
            setIsSavingQuiz(false);
        }
    };

    const addQuestion = () => {
        setQuizData([...quizData, {
            question: "",
            options: ["", "", "", ""],
            answer: ""
        }]);
    };


    const saveModuleTitle = async (moduleId, title) => {
        try {
            await updateModule(moduleId, { title });
        } catch (err) {
            console.error("Save module error:", err);
        }
    };

    const toggleGrants = async () => {
        const newVal = !settings.grant_disbursement_active;
        await updateSystemSetting('grant_disbursement_active', newVal);
        queryClient.setQueryData(['admin-settings'], prev => ({ ...prev, grant_disbursement_active: newVal }));
    };

    const updateGlobalGrant = async (key, val) => {
        try {
            await updateSystemSetting(key, val);
            queryClient.setQueryData(['admin-settings'], prev => ({ ...prev, [key]: val }));
            showToast("Global grant updated");
        } catch (err) {
            console.error("Update global grant error:", err);
            showToast("Update failed", "error");
        }
    };

    const toggleCourse = async (id, currentStatus) => {
        try {
            await updateCourseStatus(id, !currentStatus);
            queryClient.setQueryData(['admin-courses'], prev => prev?.map(c => c.id === id ? { ...c, is_published: !currentStatus } : c));
            showToast(`Learning Path ${!currentStatus ? 'Published' : 'set to Draft'}`, "success");
        } catch (err) {
            console.error("Toggle course error:", err);
            showToast("Failed to update status", "error");
        }
    };

    const filteredStudents = students ? students.filter(s => {
        const fullName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) || (s.phone && s.phone.includes(searchTerm));
    }) : [];

    const handleAddCourse = async () => {
        try {
            const nextPathNum = courses.length + 1;
            const newCourse = await createCourse({
                title: "New Learning Path",
                learning_outcome: "Learning Outcomes...",
                track_number: nextPathNum
            });
            showToast("New Learning Path initialized", "success");
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            handleCourseClick(newCourse);
        } catch (err) {
            console.error("Add path error:", err);
            const errMsg = err.response?.data?.error || err.message || "Failed to initialize path";
            showToast(errMsg, "error");
        }
    };

    const handleAddModule = async () => {
        setIsAddingModule(true);
        try {
            const nextSeq = courseModules.length + 1;
            const newMod = await createModule({
                course_id: editingCourse.id,
                title: "New Module",
                sequence_number: nextSeq
            });
            setCourseModules([...(courseModules || []), { ...newMod, lessons: [] }]);
            showToast("New module added to syllabus", "success");
        } catch (err) {
            console.error("Add module error:", err);
            showToast("Failed to add module", "error");
        } finally {
            setIsAddingModule(false);
        }
    };

    const handleDeleteModule = async (moduleId) => {
        if (!window.confirm("Are you sure you want to delete this module and all its lessons?")) return;
        try {
            await deleteModule(moduleId);
            setCourseModules(courseModules.filter(m => m.id !== moduleId));
            showToast("Module deleted");
        } catch (err) {
            console.error("Delete module error:", err);
            showToast("Failed to delete module", "error");
        }
    };

    const handleAddLesson = async (moduleId) => {
        setIsAddingLesson(true);
        try {
            const mod = (courseModules || []).find(m => m.id === moduleId);
            const nextSeq = (mod?.lessons?.length || 0) + 1;
            const newLesson = await createLesson({
                course_id: editingCourse.id,
                module_id: moduleId,
                title: "New Lesson",
                sequence_number: nextSeq,
                grant_amount: settings.default_lesson_grant || 30,
                video_url: ""
            });
            setCourseModules((courseModules || []).map(m =>
                m.id === moduleId ? { ...m, lessons: [...(m.lessons || []), newLesson] } : m
            ));
            showToast("New lesson integrated", "success");
        } catch (err) {
            console.error("Add lesson error:", err);
            const errMsg = err.response?.data?.error || err.message || "Failed to add lesson";
            showToast(errMsg, "error");
        } finally {
            setIsAddingLesson(false);
        }
    };

    const handleDeleteLesson = async (lessonId, moduleId) => {
        if (!window.confirm("Are you sure you want to delete this lesson?")) return;
        try {
            await deleteLesson(lessonId);
            setCourseModules(courseModules.map(m =>
                m.id === moduleId ? {
                    ...m,
                    lessons: m.lessons.filter(l => l.id !== lessonId)
                } : m
            ));
            showToast("Lesson deleted");
        } catch (err) {
            console.error("Delete lesson error:", err);
            showToast("Failed to delete lesson", "error");
        }
    };

    const stats = {
        totalStudents: students.length,
        avgProgress: students.length ? Math.round(students.reduce((acc, s) => acc + (s.percentage || 0), 0) / students.length) : 0,
        totalGrants: recentGrants.reduce((acc, g) => acc + (g.amount || 0), 0)
    };

    if (!authorized) return null;
    if (loading) return <LoadingScreen message="Unlocking Operational Command..." />;

    return (
        <div className="flex h-screen bg-[#0A0F1C] text-slate-100 font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 w-64 border-r border-white/5 bg-[#0D1525] p-6 flex flex-col z-[110] transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex items-center justify-between mb-10 lg:block">
                    <div
                        className="flex items-center gap-3 cursor-pointer h-10"
                        onClick={() => navigate('/')}
                    >
                        <img src="/images/logo.svg" alt="HerFuture Chain Logo" className="h-full w-auto" />
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-2 text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="space-y-1 flex-1">
                    {[
                        { icon: <LayoutGrid className="w-4 h-4" />, label: 'Overview' },
                        { icon: <Users className="w-4 h-4" />, label: 'Students' },
                        { icon: <BookOpen className="w-4 h-4" />, label: 'Curriculum' },
                        { icon: <DollarSign className="w-4 h-4" />, label: 'Grants' },
                        { icon: <Settings className="w-4 h-4" />, label: 'Settings' },
                    ].map((item, i) => (
                        <div
                            key={i}
                            onClick={() => {
                                setActiveTab(item.label);
                                setEditingCourse(null);
                            }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${activeTab === item.label ? 'bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                        >
                            {item.icon}
                            <span className="text-sm font-semibold">{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div className="mt-8 space-y-1 pt-6 border-t border-white/5">
                    <div
                        onClick={() => navigate('/')}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all text-slate-500 hover:text-slate-300 hover:bg-white/5"
                    >
                        <Home className="w-4 h-4" />
                        <span className="text-sm font-semibold">Home</span>
                    </div>
                    <div
                        onClick={() => navigate('/gate')}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all text-slate-500 hover:text-slate-300 hover:bg-white/5"
                    >
                        <Globe className="w-4 h-4" />
                        <span className="text-sm font-semibold">Gateway</span>
                    </div>
                    <div
                        onClick={() => {
                            sessionStorage.removeItem('is_admin');
                            navigate('/admin-login');
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all text-red-500/70 hover:text-red-400 hover:bg-red-500/10 mt-2"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-semibold">Logout</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 overflow-y-auto">
                <header className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#0A0F1C]/80 backdrop-blur-md sticky top-0 z-50">
                    <img src="/images/logo.svg" alt="Logo" className="h-8 w-auto" />
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 text-white hover:bg-white/5 rounded-xl transition-all"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                <div className="p-4 md:p-8">
                    {activeTab === 'Overview' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-fuchsia-400">System Live</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    </div>
                                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Command Center.</h1>
                                    <p className="text-slate-400 text-sm font-medium">Real-time control over the HerFuture Chain socio-economic engine.</p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className={`p-1 pl-4 rounded-2xl flex items-center gap-6 border transition-all ${settings.grant_disbursement_active ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Grant System</span>
                                            <span className={`text-xs font-bold ${settings.grant_disbursement_active ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {settings.grant_disbursement_active ? 'OPERATIONAL' : 'PAUSED'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={toggleGrants}
                                            className={`p-4 rounded-xl transition-all ${settings.grant_disbursement_active ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'}`}
                                        >
                                            <Power className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                                {[
                                    { label: 'Total Students', val: stats.totalStudents, icon: <Users className="text-blue-400" /> },
                                    { label: 'Avg Progress', val: `${stats.avgProgress}%`, icon: <Activity className="text-emerald-400" /> },
                                    { label: 'Grants Paid', val: `$${stats.totalGrants}`, icon: <DollarSign className="text-amber-400" /> },
                                    { label: 'Graduates', val: students.filter(s => s.percentage === 100).length, icon: <GraduationCap className="text-purple-400" /> },
                                ].map((s, i) => (
                                    <div key={i} className="glass-panel p-6 rounded-[32px] border border-white/5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-white/5 rounded-2xl">{s.icon}</div>
                                            <ArrowUpRight className="w-4 h-4 text-slate-600" />
                                        </div>
                                        <div className="text-2xl font-black text-white">{s.val}</div>
                                        <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-1">{s.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 glass-panel p-8 rounded-[40px] border border-white/5 pb-0">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 font-medium">System Intelligence Snapshot</h3>
                                    <div className="space-y-4">
                                        {/* System chart/graph visualization placeholder */}
                                        <div className="aspect-[2/1] bg-gradient-to-t from-slate-900 to-slate-900/0 rounded-t-3xl relative overflow-hidden flex items-end px-4 gap-1">
                                            {[40, 60, 45, 80, 55, 70, 90, 65, 50, 85, 40, 75].map((h, i) => (
                                                <div key={i} className="flex-1 bg-fuchsia-500/20 rounded-t-lg transition-all hover:bg-fuchsia-500/40" style={{ height: `${h}%` }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="glass-panel p-8 rounded-[40px] border border-white/5">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 font-medium">Treasury Status</h3>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                                                <DollarSign className="w-8 h-8 text-amber-400" />
                                            </div>
                                            <div>
                                                <div className="text-3xl font-black text-white">$100,000.00</div>
                                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Available cUSD Reserve</div>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                                            <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">Status</span>
                                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">Healthy Pool</span>
                                        </div>
                                    </div>

                                    <div className="glass-panel p-8 rounded-[40px] border border-white/5">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 font-medium">Protocol Health</h3>
                                        <div className="space-y-4">
                                            {[
                                                { label: 'Network Gas (CELO)', val: '2.48 CELO', warn: false },
                                                { label: 'Contract Latency', val: '42ms', warn: false },
                                                { label: 'Admin Key Status', val: 'SECURE', warn: false },
                                            ].map((h, i) => (
                                                <div key={i} className="flex justify-between items-center py-2">
                                                    <span className="text-[11px] text-slate-500 font-medium">{h.label}</span>
                                                    <span className="text-[11px] text-white font-bold">{h.val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Students' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h1 className="text-3xl font-black text-white mb-1 italic">Student Registry.</h1>
                                    <p className="text-xs text-slate-500 tracking-tight">Active participants in the HerFuture Chain ecosystem.</p>
                                </div>
                            </div>
                            <div className="glass-panel rounded-[40px] border border-white/5 overflow-hidden">
                                <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h3 className="font-bold text-white">Registry Management</h3>
                                        <p className="text-xs text-slate-500 tracking-tight mt-1">Management of all DID-verified participants.</p>
                                    </div>
                                    <div className="relative">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="text"
                                            placeholder="Search by name or phone..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="bg-[#0D1525] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-brand-500/50 min-w-[320px] transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-[#0D1525] text-[10px] uppercase tracking-widest font-black text-slate-600">
                                            <tr>
                                                <th className="px-8 py-5">Full Identity</th>
                                                <th className="px-8 py-5">Milestone Velocity</th>
                                                <th className="px-8 py-5">Chain Address</th>
                                                <th className="px-8 py-5">Registered</th>
                                                <th className="px-8 py-5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm text-slate-300">
                                            {filteredStudents.map((s, i) => (
                                                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-all">
                                                    <td className="px-8 py-7">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-black text-slate-400">
                                                                {s.first_name ? s.first_name[0] : '?'}
                                                            </div>
                                                            <div>
                                                                <div className="font-black text-white">{s.first_name || 'Anonymous'} {s.last_name || ''}</div>
                                                                <div className="text-[10px] text-slate-500 tracking-widest mt-0.5">{s.phone?.startsWith('+') ? s.phone : '+' + s.phone}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-7">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden w-32 border border-white/5">
                                                                <div className="h-full bg-gradient-to-r from-brand-600 to-indigo-500" style={{ width: `${s.percentage}%` }} />
                                                            </div>
                                                            <span className="text-[10px] font-black text-white">{s.percentage}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-7">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                            <div className="text-[11px] font-mono text-slate-500 tracking-tighter">{s.wallet_address?.slice(0, 16)}...</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-7 text-sm text-slate-500">
                                                        {s.created_at ? new Date(s.created_at).toLocaleDateString() : '-'}
                                                    </td>
                                                    <td className="px-8 py-7 text-right">
                                                        <button
                                                            onClick={() => setSelectedStudent(s)}
                                                            className="px-3 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                                                        >
                                                            View Profile
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Student Detail Modal */}
                    {selectedStudent && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedStudent(null)} />
                            <div className="relative w-full max-w-2xl bg-[#0D1525] border border-white/5 rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                                <div className="p-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center text-3xl font-black text-slate-400">
                                                {selectedStudent.first_name ? selectedStudent.first_name[0] : '?'}
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-black text-white italic">{selectedStudent.first_name} {selectedStudent.last_name}.</h2>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{selectedStudent.phone?.startsWith('+') ? selectedStudent.phone : '+' + selectedStudent.phone}</span>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">DID Verified</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => setSelectedStudent(null)} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                                            <X className="w-5 h-5 text-slate-400" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 mb-10">
                                        <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Milestone Velocity</div>
                                            <div className="text-2xl font-black text-white">{selectedStudent.percentage}%</div>
                                            <div className="mt-4 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                                <div className="h-full bg-brand-500" style={{ width: `${selectedStudent.percentage}%` }} />
                                            </div>
                                        </div>
                                        <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Registered On</div>
                                            <div className="text-xl font-black text-white">
                                                {selectedStudent.created_at ? new Date(selectedStudent.created_at).toLocaleDateString() : 'Historical data'}
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">DID Registry v1.0</div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="p-6 rounded-3xl bg-white/2 border border-white/5">
                                            <div className="flex items-center gap-3 mb-4">
                                                <ShieldCheck className="w-4 h-4 text-brand-400" />
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Chain Identity (DID)</h4>
                                            </div>
                                            <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-[11px] font-mono text-slate-400 break-all leading-relaxed">
                                                {selectedStudent.did || 'did:celo:0x' + selectedStudent.wallet_address?.slice(2)}
                                            </div>
                                        </div>
                                        <div className="p-6 rounded-3xl bg-white/2 border border-white/5">
                                            <div className="flex items-center gap-3 mb-4">
                                                <Activity className="w-4 h-4 text-emerald-400" />
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Wallet Address</h4>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 cursor-pointer hover:border-white/10 transition-all">
                                                <span className="text-[11px] font-mono text-slate-400 break-all">{selectedStudent.wallet_address || 'Not initialized'}</span>
                                                <ExternalLink className="w-3 h-3 text-slate-600" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 flex gap-4">
                                        <button className="flex-1 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-500/20">Message Student</button>
                                        <button
                                            onClick={() => setShowStudentDeleteConfirm(selectedStudent)}
                                            className="flex-1 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                                        >
                                            Hard Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Student Delete Confirmation Modal */}
                    {showStudentDeleteConfirm && (
                        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                            <div className="glass-panel max-w-md w-full p-10 rounded-[40px] border border-white/10 shadow-2xl text-center space-y-6">
                                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Trash2 className="w-10 h-10 text-red-500" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white italic">Hard Delete.</h2>
                                    <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                                        Are you sure you want to permanently delete <span className="text-white font-bold">{showStudentDeleteConfirm.first_name} {showStudentDeleteConfirm.last_name}</span>?
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3 pt-4">
                                    <button
                                        onClick={() => handleDeleteStudent(showStudentDeleteConfirm.id)}
                                        className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all"
                                    >
                                        Permanently Erase
                                    </button>
                                    <button
                                        onClick={() => setShowStudentDeleteConfirm(null)}
                                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Curriculum' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h1 className="text-3xl font-black text-white mb-1 italic">Learning Paths.</h1>
                                    <p className="text-xs text-slate-500 tracking-tight">Managing the core educational engine and grant milestones.</p>
                                </div>
                                <button
                                    onClick={handleAddCourse}
                                    className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                                >
                                    <PlusCircle className="w-4 h-4" /> Add New Path
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {(courses || []).map(course => (
                                    <div key={course.id} className="glass-panel rounded-[40px] border border-white/5 p-8 flex flex-col justify-between group hover:border-brand-500/20 transition-all">
                                        <div className="mb-8">
                                            <div className="w-full aspect-video rounded-[32px] overflow-hidden bg-slate-800 mb-6 border border-white/5 relative group/img">
                                                <img src={course.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Cover" />
                                                <div
                                                    onClick={() => handleCourseClick(course)}
                                                    className="absolute inset-0 bg-brand-500/60 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center cursor-pointer"
                                                >
                                                    <Edit3 className="w-8 h-8 text-white" />
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-bold text-white mb-2 leading-tight">{course.title}</h3>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed">System-assigned learning path for the socio-economic empowerment journey.</p>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => setShowDeleteConfirm(course)}
                                                    className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                                    title="Delete Learning Path"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <Users className="w-3.5 h-3.5 text-slate-500" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{course.student_count || 0} Students</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${course.is_published ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{course.is_published ? 'Published' : 'Draft'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleCourse(course.id, course.is_published)}
                                                className={`w-12 h-7 rounded-full relative transition-all duration-300 ${course.is_published ? 'bg-emerald-500' : 'bg-slate-800'}`}
                                            >
                                                <div className={`absolute top-1.5 w-4 h-4 rounded-full transition-all duration-300 bg-white shadow-lg ${course.is_published ? 'right-1.5' : 'left-1.5 bg-slate-400'}`} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Delete Confirmation Modal */}
                            {showDeleteConfirm && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                                    <div className="glass-panel max-w-md w-full p-10 rounded-[40px] border border-white/10 shadow-2xl text-center space-y-6">
                                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <Trash2 className="w-10 h-10 text-red-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-white italic">Confirm Deletion.</h2>
                                            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                                                Are you sure you want to permanently delete <span className="text-white font-bold">"{showDeleteConfirm.title}"</span>? This action will erase all modules and lessons within this learning path.
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-3 pt-4">
                                            <button
                                                onClick={() => handleDeleteTrack(showDeleteConfirm.id)}
                                                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all"
                                            >
                                                Permanently Erase
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(null)}
                                                className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all"
                                            >
                                                Keep Path
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'Grants' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h1 className="text-3xl font-black text-white mb-1 italic">Grant Distribution.</h1>
                                    <p className="text-xs text-slate-500 tracking-tight">Historical audit of all on-chain socio-economic disbursements.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="glass-panel p-8 rounded-[40px] border border-white/5 pb-0 overflow-hidden">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 uppercase font-medium">Recent Grant Cycles</h3>
                                    <div className="space-y-1">
                                        {recentGrants.map((grant, i) => (
                                            <div key={i} className="py-4 border-b border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                                        <ShieldCheck className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-white">{grant.student}</div>
                                                        <div className="text-[10px] text-slate-500">{grant.track || 'Learning Path'}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-black text-emerald-400">+${grant.amount}</div>
                                                    <div className="text-[9px] font-mono text-slate-600 truncate w-24 ml-auto text-right">{grant.tx?.slice(0, 10)}...</div>
                                                </div>
                                            </div>
                                        ))}
                                        {recentGrants.length === 0 && (
                                            <div className="p-12 text-center text-slate-500 text-xs italic">No disbursements processed in current epoch.</div>
                                        )}
                                    </div>
                                </div>

                                <div className="glass-panel p-8 rounded-[40px] border border-white/5">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 font-medium">Grant Configuration</h3>
                                    <div className="space-y-6">
                                        <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-sm font-bold text-white">Base Lesson Grant</span>
                                                <span className="text-sm font-black text-brand-400">${settings.default_lesson_grant || 30}.00</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-900 rounded-full">
                                                <div className="w-[30%] h-full bg-brand-500 rounded-full" />
                                            </div>
                                            <p className="text-[10px] text-slate-500 mt-4 leading-relaxed italic">The standard cUSD amount dispersed upon successful completion of a lesson quiz.</p>
                                        </div>
                                        <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-sm font-bold text-white">Graduation Bonus</span>
                                                <span className="text-sm font-black text-amber-400">${settings.default_graduation_grant || 150}.00</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 leading-relaxed italic">Dispersed upon completion of the final learning path milestone.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Settings' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h1 className="text-3xl font-black text-white mb-1 italic">System Configuration.</h1>
                                    <p className="text-xs text-slate-500 tracking-tight">Control operational parameters and bridge status.</p>
                                </div>
                            </div>
                            <div className="glass-panel p-10 rounded-[40px] border border-white/5 max-w-2xl">
                                <h3 className="text-xl font-black text-white mb-8 italic">System Intelligence & Access</h3>
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-brand-500/20 transition-all">
                                        <div>
                                            <h4 className="font-bold text-white text-sm">On-Chain Grant Disbursement</h4>
                                            <p className="text-xs text-slate-500 mt-1">If disabled, lessons will complete but no funds will move.</p>
                                        </div>
                                        <button
                                            onClick={toggleGrants}
                                            className={`w-14 h-8 rounded-full relative transition-all duration-300 ${settings.grant_disbursement_active ? 'bg-emerald-500' : 'bg-slate-800'}`}
                                        >
                                            <div className={`absolute top-1.5 w-5 h-5 rounded-full transition-all duration-300 bg-white shadow-lg ${settings.grant_disbursement_active ? 'right-1.5' : 'left-1.5 bg-slate-400'}`} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-brand-500/20 transition-all">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block pl-1">Default Lesson Grant ($)</label>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="number"
                                                    value={settings.default_lesson_grant || 30}
                                                    onChange={(e) => queryClient.setQueryData(['admin-settings'], { ...settings, default_lesson_grant: parseInt(e.target.value) })}
                                                    onBlur={(e) => updateGlobalGrant('default_lesson_grant', parseInt(e.target.value))}
                                                    className="bg-[#060914] border border-white/5 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-500/50 w-full"
                                                />
                                            </div>
                                        </div>
                                        <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-brand-500/20 transition-all">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block pl-1">Graduation Bonus ($)</label>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="number"
                                                    value={settings.default_graduation_grant || 150}
                                                    onChange={(e) => queryClient.setQueryData(['admin-settings'], { ...settings, default_graduation_grant: parseInt(e.target.value) })}
                                                    onBlur={(e) => updateGlobalGrant('default_graduation_grant', parseInt(e.target.value))}
                                                    className="w-full bg-[#060914] border border-white/5 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-500/50"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block pl-1">Bridge Address (Admin Wallet)</label>
                                        <div className="p-4 bg-[#060914] border border-white/5 rounded-2xl flex items-center justify-between group">
                                            <code className="text-xs text-slate-400 font-mono">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</code>
                                            <span className="text-[9px] font-black text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">Copy Address</span>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-white/5">
                                        <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Activity className="w-4 h-4 text-amber-500" />
                                                <span className="text-xs font-black uppercase tracking-widest text-amber-500">Node Maintenance</span>
                                            </div>
                                            <p className="text-xs text-amber-200/60 leading-relaxed italic">
                                                The Celo node synchronization is currently at 99.8%. No maintenance required for this epoch.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'CurriculumEditor' && editingCourse && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-4 mb-2">
                                <button
                                    onClick={() => setActiveTab('Curriculum')}
                                    className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5 text-slate-500 rotate-180" />
                                </button>
                                <h2 className="text-2xl font-black text-white italic">Editing {editingCourse.title}</h2>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Course Metadata */}
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="glass-panel p-8 rounded-[40px] border border-white/5 bg-[#0D1525]/50">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-400 mb-6 font-medium">Core Metadata</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block pl-1">Path Title</label>
                                                <input
                                                    type="text"
                                                    value={editingCourse.title}
                                                    onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                                                    className="w-full bg-[#060914] border border-white/5 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-500/50"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block pl-1">Learning Outcomes</label>
                                                <textarea
                                                    value={editingCourse.learning_outcome || ''}
                                                    onChange={(e) => setEditingCourse({ ...editingCourse, learning_outcome: e.target.value })}
                                                    className="w-full bg-[#060914] border border-white/5 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-500/50 min-h-[60px]"
                                                />
                                            </div>
                                            <div className="mb-6">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3 block pl-1">Path Cover Image</label>
                                                <div
                                                    className="relative group cursor-pointer h-32 w-full rounded-2xl overflow-hidden border border-white/5 bg-[#060914] flex items-center justify-center transition-all hover:border-brand-500/30"
                                                    onClick={() => document.getElementById('cover-upload').click()}
                                                >
                                                    {editingCourse.image_url ? (
                                                        <img src={editingCourse.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Cover" />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2 text-slate-600 group-hover:text-brand-400">
                                                            <Activity className="w-6 h-6" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Upload Artwork</span>
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                        <PlusCircle className="w-6 h-6 text-white" />
                                                    </div>
                                                    <input
                                                        id="cover-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleUploadCover}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block pl-1">Description</label>
                                                <textarea
                                                    value={editingCourse.description || ''}
                                                    onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                                                    className="w-full bg-[#060914] border border-white/5 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-500/50 min-h-[80px]"
                                                />
                                            </div>
                                            <div className="mb-6">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block pl-1">Path #</label>
                                                <input
                                                    type="number"
                                                    value={editingCourse.track_number || ''}
                                                    onChange={(e) => setEditingCourse({ ...editingCourse, track_number: e.target.value })}
                                                    className="w-full bg-[#060914] border border-white/5 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-500/50"
                                                />
                                            </div>
                                            <button
                                                onClick={saveCourse}
                                                disabled={isSavingMetadata}
                                                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {isSavingMetadata ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Save className="w-4 h-4" />
                                                )}
                                                {isSavingMetadata ? 'Updating...' : 'Update Metadata'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Modules & Lessons Drill-down */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="flex justify-between items-center mb-2 px-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-medium">Syllabus Structure</h3>
                                        <button
                                            onClick={handleAddModule}
                                            disabled={isAddingModule}
                                            className="flex items-center gap-2 text-[10px] font-bold text-brand-400 hover:text-white transition-colors disabled:opacity-50"
                                        >
                                            {isAddingModule ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <PlusCircle className="w-3 h-3" />
                                            )}
                                            {isAddingModule ? 'Adding...' : 'Add Module'}
                                        </button>
                                    </div>
                                    {(courseModules || []).map((mod, i) => (
                                        <div key={mod.id} className="glass-panel rounded-[32px] border border-white/5 overflow-hidden">
                                            <div className="p-6 bg-white/[0.02] border-b border-white/5 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-black text-slate-500">{i + 1}</div>
                                                    <CurriculumInput
                                                        value={mod.title}
                                                        onBlur={(val) => {
                                                            const newMods = [...courseModules];
                                                            newMods[i].title = val;
                                                            setCourseModules(newMods);
                                                            saveModuleTitle(mod.id, val);
                                                        }}
                                                        className="bg-transparent border-none text-white font-black focus:outline-none text-sm p-0 w-full"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => handleDeleteModule(mod.id)}
                                                        className="p-1 hover:text-red-400 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-4 space-y-2 font-medium">
                                                {(mod.lessons || []).map((lesson, li) => (
                                                    <div key={lesson.id} className="p-6 bg-white/5 rounded-[28px] border border-white/5 hover:border-brand-500/30 transition-all space-y-4 group">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4 flex-1">
                                                                <div className="w-2 h-2 rounded-full bg-slate-700 group-hover:bg-brand-500 transition-colors" />
                                                                <CurriculumInput
                                                                    value={lesson.title}
                                                                    onBlur={(val) => saveLessonValue(lesson.id, 'title', val)}
                                                                    className="bg-transparent border-none text-sm font-bold text-white focus:outline-none w-full p-0 italic"
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex items-center gap-2 bg-[#060914] px-3 py-1.5 rounded-xl border border-white/5">
                                                                    <DollarSign className="w-3 h-3 text-emerald-400" />
                                                                    <input
                                                                        type="number"
                                                                        value={lesson.grant_amount}
                                                                        onChange={(e) => saveLessonValue(lesson.id, 'grant_amount', parseInt(e.target.value))}
                                                                        className="bg-transparent border-none text-[10px] font-black text-white w-12 text-center focus:outline-none p-0"
                                                                    />
                                                                    <span className="text-[8px] font-black text-slate-600 uppercase">cUSD</span>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleGenerateAIQuiz(lesson)}
                                                                    disabled={isGeneratingQuiz === lesson.id}
                                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-brand-500/30 text-[9px] font-black uppercase tracking-widest transition-all ${isGeneratingQuiz === lesson.id ? 'bg-brand-500/20 text-brand-400' : 'bg-brand-500/10 text-brand-400 hover:bg-brand-500 hover:text-white hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]'}`}
                                                                >
                                                                    {isGeneratingQuiz === lesson.id ? (
                                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                                    ) : (
                                                                        <Sparkles className="w-3 h-3" />
                                                                    )}
                                                                    {isGeneratingQuiz === lesson.id ? 'Generating...' : 'AI Quiz'}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleEditQuizManual(lesson)}
                                                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/5 bg-white/5 text-slate-400 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
                                                                >
                                                                    <HelpCircle className="w-3 h-3" />
                                                                    Curate
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteLesson(lesson.id, mod.id)}
                                                                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-[8px] font-black uppercase tracking-widest text-slate-600 block mb-1.5 ml-1">Video Endpoint (Embed URL)</label>
                                                                <input
                                                                    type="text"
                                                                    value={lesson.video_url || ''}
                                                                    onChange={(e) => saveLessonValue(lesson.id, 'video_url', e.target.value)}
                                                                    placeholder="https://www.youtube.com/embed/..."
                                                                    className="w-full bg-[#060914] border border-white/5 rounded-xl py-2 px-3 text-[10px] text-slate-400 focus:outline-none focus:border-brand-500/50"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[8px] font-black uppercase tracking-widest text-slate-600 block mb-1.5 ml-1">Curriculum Summary</label>
                                                                <CurriculumInput
                                                                    value={lesson.content || ''}
                                                                    onBlur={(val) => saveLessonValue(lesson.id, 'content', val)}
                                                                    placeholder="Self-leadership and mindset..."
                                                                    className="w-full bg-[#060914] border border-white/5 rounded-xl py-2 px-3 text-[10px] text-slate-400 focus:outline-none focus:border-brand-500/50"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => handleAddLesson(mod.id)}
                                                    disabled={isAddingLesson}
                                                    className="w-full py-3 border border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-400 hover:border-white/20 transition-all mt-4 disabled:opacity-50"
                                                >
                                                    {isAddingLesson ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <PlusCircle className="w-3 h-3" />
                                                    )}
                                                    {isAddingLesson ? 'Adding...' : `Add Lesson to ${mod.title}`}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Quiz Editor Modal - Premium Redesign */}
                    {quizEditorOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 backdrop-blur-2xl bg-slate-950/80">
                            <div className="bg-[#0D121F] w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col rounded-[48px] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500">
                                {/* Modal Header */}
                                <div className="px-12 py-10 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-white/[0.03] to-transparent">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center border border-brand-500/20">
                                            <GraduationCap className="w-8 h-8 text-brand-400" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-2xl font-black text-white tracking-tight uppercase italic">Curriculum Curation.</h3>
                                                <span className="px-2 py-0.5 rounded-md bg-brand-500/20 text-brand-400 text-[8px] font-black uppercase tracking-widest border border-brand-500/30">Manual Mode</span>
                                            </div>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                                <BookOpen className="w-3 h-3" /> {currentLessonForQuiz?.title}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setQuizEditorOpen(false)}
                                        className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl transition-all group"
                                    >
                                        <X className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar bg-black/20">
                                    {quizData.length === 0 && (
                                        <div className="text-center py-24 flex flex-col items-center">
                                            <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center mb-8 border border-white/5">
                                                <HelpCircle className="w-10 h-10 text-slate-700" />
                                            </div>
                                            <h4 className="text-xl font-bold text-white mb-2">Build Your Assessment</h4>
                                            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-10 leading-relaxed font-medium">Add structured questions to verify learner competency and release micro-grants on the blockchain.</p>
                                            <button
                                                onClick={addQuestion}
                                                className="px-8 py-4 bg-brand-500 hover:bg-brand-400 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-brand-500/20 transition-all"
                                            >
                                                Start Drafting
                                            </button>
                                        </div>
                                    )}

                                    {quizData.map((q, idx) => (
                                        <div key={idx} className="group relative">
                                            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-brand-500/40 rounded-full opacity-0 group-hover:opacity-100 transition-all" />
                                            <div className="bg-white/[0.02] rounded-[40px] border border-white/5 p-10 transition-all hover:bg-white/[0.04] hover:border-brand-500/20">
                                                <div className="flex justify-between items-start mb-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 text-xs font-black border border-brand-500/10">
                                                            {idx + 1}
                                                        </div>
                                                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Competency Test</h4>
                                                    </div>
                                                    <button
                                                        onClick={() => setQuizData(quizData.filter((_, i) => i !== idx))}
                                                        className="p-3 text-slate-600 hover:text-red-400 flex items-center gap-2 hover:bg-red-400/10 rounded-xl transition-all text-[9px] font-black uppercase tracking-widest"
                                                    >
                                                        <X className="w-4 h-4" /> Discard
                                                    </button>
                                                </div>

                                                <div className="space-y-8">
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase text-brand-400 mb-3 block tracking-[0.2em] ml-2">Question Title</label>
                                                        <input
                                                            type="text"
                                                            value={q.question}
                                                            onChange={(e) => {
                                                                const newData = [...quizData];
                                                                newData[idx].question = e.target.value;
                                                                setQuizData(newData);
                                                            }}
                                                            className="w-full bg-[#060914] border border-white/10 rounded-3xl py-5 px-8 text-lg font-bold text-white focus:outline-none focus:border-brand-500/50 focus:ring-4 ring-brand-500/5 transition-all placeholder:text-slate-700"
                                                            placeholder="What fundamental concept are we testing?"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {q.options.map((opt, oIdx) => (
                                                            <div key={oIdx} className="relative group/opt">
                                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-500/40 font-black text-xs group-focus-within/opt:text-brand-400 transition-colors uppercase">
                                                                    {String.fromCharCode(65 + oIdx)}
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    value={opt}
                                                                    onChange={(e) => {
                                                                        const newData = [...quizData];
                                                                        newData[idx].options[oIdx] = e.target.value;
                                                                        setQuizData(newData);
                                                                    }}
                                                                    className="w-full bg-[#060914]/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm text-slate-300 focus:outline-none focus:border-brand-500/30 focus:bg-[#060914] transition-all hover:bg-white/[0.02]"
                                                                    placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="pt-6 border-t border-white/5">
                                                        <label className="text-[10px] font-black uppercase text-emerald-500/70 mb-4 block tracking-[0.2em] ml-2 flex items-center gap-2">
                                                            <ShieldCheck className="w-3 h-3" /> Designated Solution
                                                        </label>
                                                        <div className="relative">
                                                            <select
                                                                value={q.answer}
                                                                onChange={(e) => {
                                                                    const newData = [...quizData];
                                                                    newData[idx].answer = e.target.value;
                                                                    setQuizData(newData);
                                                                }}
                                                                className="w-full bg-emerald-500/[0.03] border border-emerald-500/10 rounded-2xl py-4 px-8 text-sm text-emerald-400 font-bold focus:outline-none focus:border-emerald-500/30 appearance-none cursor-pointer hover:bg-emerald-500/[0.05] transition-all"
                                                            >
                                                                <option value="" disabled>Choose the correct outcome</option>
                                                                {q.options.filter(o => o.trim() !== "").map((opt, oIdx) => (
                                                                    <option key={oIdx} value={opt} className="bg-[#0D1525] text-slate-200">{opt}</option>
                                                                ))}
                                                            </select>
                                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-500/50">
                                                                <List className="w-4 h-4" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {quizData.length > 0 && (
                                        <button
                                            onClick={addQuestion}
                                            className="w-full py-6 border-2 border-dashed border-white/5 rounded-[40px] flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-slate-600 hover:text-brand-400 hover:border-brand-500/20 hover:bg-brand-500/[0.02] transition-all group/add"
                                        >
                                            <PlusCircle className="w-5 h-5 group-hover:scale-125 transition-transform" />
                                            Extend Curriculum
                                        </button>
                                    )}
                                </div>

                                {/* Modal Footer */}
                                <div className="px-12 py-10 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.1em]">
                                        <div className="w-2 h-2 rounded-full bg-brand-500/40" />
                                        {quizData.length} Total Verification Points
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <button
                                            onClick={() => setQuizEditorOpen(false)}
                                            className="px-8 py-4 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-white/5 rounded-2xl transition-all"
                                        >
                                            Back to Syllabus
                                        </button>
                                        <button
                                            onClick={handleSaveQuizManual}
                                            disabled={isSavingQuiz}
                                            className="flex items-center gap-3 px-10 py-5 bg-brand-600 hover:bg-brand-500 text-white rounded-3xl text-[11px] font-black uppercase tracking-widest transition-all shadow-[0_20px_40px_rgba(59,130,246,0.25)] hover:shadow-[0_25px_50px_rgba(59,130,246,0.35)] disabled:opacity-50 group hover:-translate-y-1"
                                        >
                                            {isSavingQuiz ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5 group-hover:animate-bounce" />}
                                            Secure Content
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            {/* Toast Feedback */}
            {toast && (
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                    {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
                </div>
            )}
        </div>
    );
}
