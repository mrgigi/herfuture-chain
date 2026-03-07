import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, BookOpen, DollarSign, Settings, Search, MoreHorizontal,
    GraduationCap, ArrowUpRight, ShieldCheck, Power, LayoutGrid, Activity,
    Edit3, ChevronRight, Save, X, PlusCircle
} from 'lucide-react';
import api, {
    getCourses, getAdminParticipants, getSystemSettings,
    updateSystemSetting, updateCourseStatus, updateCourseDetails,
    updateModule, updateLesson, getModules,
    createModule, deleteModule, createLesson, deleteLesson,
    createCourse
} from '../lib/api';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [settings, setSettings] = useState({ grant_disbursement_active: true });
    const [recentGrants, setRecentGrants] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Overview');
    const [editingCourse, setEditingCourse] = useState(null); // Drill-down state
    const [courseModules, setCourseModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const isAdmin = sessionStorage.getItem('is_admin') === 'true';
        if (!isAdmin) {
            navigate('/admin-login');
            return;
        }
        setAuthorized(true);

        const fetchData = async () => {
            try {
                const [cData, sData, setts, gData] = await Promise.all([
                    getCourses(),
                    getAdminParticipants(),
                    getSystemSettings(),
                    api.get('/impact/recent-grants')
                ]);
                setCourses(cData);
                setStudents(sData.participants || []);
                setSettings(setts);
                setRecentGrants(gData.data.grants || []);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

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
        try {
            await updateCourseDetails(editingCourse.id, {
                title: editingCourse.title,
                category: editingCourse.category
            });
            setCourses(prev => prev.map(c => c.id === editingCourse.id ? editingCourse : c));
        } catch (err) {
            console.error("Save course error:", err);
        }
    };

    const saveLessonValue = async (lessonId, field, value) => {
        try {
            const lesson = courseModules.flatMap(m => m.lessons).find(l => l.id === lessonId);
            const updated = { ...lesson, [field]: value };
            await updateLesson(lessonId, { [field]: value });
            setCourseModules(prev => prev.map(m => ({
                ...m,
                lessons: m.lessons.map(l => l.id === lessonId ? updated : l)
            })));
        } catch (err) {
            console.error("Save lesson error:", err);
        }
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
        setSettings(prev => ({ ...prev, grant_disbursement_active: newVal }));
    };

    const toggleCourse = async (id, currentStatus) => {
        await updateCourseStatus(id, !currentStatus);
        setCourses(prev => prev.map(c => c.id === id ? { ...c, is_published: !currentStatus } : c));
    };

    const filteredStudents = students.filter(s => {
        const fullName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) || (s.phone && s.phone.includes(searchTerm));
    });

    const handleAddModule = async () => {
        try {
            const nextSeq = courseModules.length + 1;
            const newMod = await createModule({
                course_id: editingCourse.id,
                title: "New Module",
                sequence_number: nextSeq
            });
            setCourseModules([...courseModules, { ...newMod, lessons: [] }]);
        } catch (err) {
            console.error("Add module error:", err);
        }
    };

    const handleDeleteModule = async (moduleId) => {
        if (!window.confirm("Delete this module and all its lessons?")) return;
        try {
            await deleteModule(moduleId);
            setCourseModules(courseModules.filter(m => m.id !== moduleId));
        } catch (err) {
            console.error("Delete module error:", err);
        }
    };

    const handleAddLesson = async (moduleId) => {
        try {
            const mod = courseModules.find(m => m.id === moduleId);
            const nextSeq = mod.lessons.length + 1;
            const newLesson = await createLesson({
                course_id: editingCourse.id,
                module_id: moduleId,
                title: "New Lesson",
                sequence_number: nextSeq,
                grant_amount: 30,
                video_url: ""
            });
            setCourseModules(courseModules.map(m =>
                m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m
            ));
        } catch (err) {
            console.error("Add lesson error:", err);
        }
    };

    const handleDeleteLesson = async (lessonId, moduleId) => {
        if (!window.confirm("Delete this lesson?")) return;
        try {
            await deleteLesson(lessonId);
            setCourseModules(courseModules.map(m =>
                m.id === moduleId ? {
                    ...m,
                    lessons: m.lessons.filter(l => l.id !== lessonId)
                } : m
            ));
        } catch (err) {
            console.error("Delete lesson error:", err);
        }
    };

    const stats = {
        totalStudents: students.length,
        avgProgress: students.length ? Math.round(students.reduce((acc, s) => acc + (s.percentage || 0), 0) / students.length) : 0,
        totalGrants: recentGrants.reduce((acc, g) => acc + (g.amount || 0), 0)
    };

    if (!authorized) return null;

    return (
        <div className="flex h-screen bg-[#0A0F1C] text-slate-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-[#0D1525]/50 backdrop-blur-xl p-6 hidden lg:flex flex-col">
                <div
                    className="flex items-center gap-3 mb-10 cursor-pointer h-10"
                    onClick={() => navigate('/')}
                >
                    <img src="/images/logo.svg" alt="HerFuture Chain Logo" className="h-full w-auto" />
                </div>

                <nav className="space-y-1">
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
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${activeTab === item.label ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                        >
                            {item.icon}
                            <span className="text-sm font-semibold">{item.label}</span>
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {activeTab === 'Overview' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-400">System Live</span>
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
                                            <div key={i} className="flex-1 bg-brand-500/20 rounded-t-lg transition-all hover:bg-brand-500/40" style={{ height: `${h}%` }} />
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
                                            <div className="text-3xl font-black text-white">$4,850.00</div>
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
                                                            <div className="text-[10px] text-slate-500 tracking-widest mt-0.5">{s.phone}</div>
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
                                                <td className="px-8 py-7 text-right">
                                                    <button className="px-3 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">View Profile</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Curriculum' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h1 className="text-3xl font-black text-white mb-1 italic">Knowledge Tracks.</h1>
                                <p className="text-xs text-slate-500 tracking-tight">Managing the core educational engine and grant milestones.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {courses.map(course => (
                                <div key={course.id} className="glass-panel rounded-[40px] border border-white/5 p-8 flex flex-col justify-between group hover:border-brand-500/20 transition-all">
                                    <div className="mb-8">
                                        <div className="w-full aspect-video rounded-[32px] overflow-hidden bg-slate-800 mb-6 border border-white/5 relative group/img">
                                            <img src={course.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                            <div
                                                onClick={() => handleCourseClick(course)}
                                                className="absolute inset-0 bg-brand-500/60 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center cursor-pointer"
                                            >
                                                <Edit3 className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${course.id === 'track-1' ? 'bg-brand-500/20 text-brand-400' : course.id === 'track-2' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                {course.category}
                                            </span>
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Track {course.track_number}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2 leading-tight">{course.title}</h3>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">System-assigned track for the socio-economic empowerment path.</p>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${course.is_published ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{course.is_published ? 'Published' : 'Draft'}</span>
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
                                                    <div className="text-[10px] text-slate-500">{grant.track}</div>
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
                                            <span className="text-sm font-black text-brand-400">$30.00</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-900 rounded-full">
                                            <div className="w-[30%] h-full bg-brand-500 rounded-full" />
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-4 leading-relaxed italic">The standard cUSD amount dispersed upon successful completion of a lesson quiz.</p>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-sm font-bold text-white">Graduation Bonus</span>
                                            <span className="text-sm font-black text-amber-400">$100.00</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 leading-relaxed italic">Dispersed upon completion of the final track 3 milestone.</p>
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
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block pl-1">Track Title</label>
                                            <input
                                                type="text"
                                                value={editingCourse.title}
                                                onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                                                className="w-full bg-[#060914] border border-white/5 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block pl-1">Visual Category</label>
                                            <input
                                                type="text"
                                                value={editingCourse.category}
                                                onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value })}
                                                className="w-full bg-[#060914] border border-white/5 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-500/50"
                                            />
                                        </div>
                                        <button
                                            onClick={saveCourse}
                                            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest transition-all mt-4 flex items-center justify-center gap-2"
                                        >
                                            <Save className="w-3 h-3" />
                                            Update Metadata
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
                                        className="flex items-center gap-2 text-[10px] font-bold text-brand-400 hover:text-white transition-colors"
                                    >
                                        <PlusCircle className="w-3 h-3" /> Add Module
                                    </button>
                                </div>
                                {courseModules.map((mod, i) => (
                                    <div key={mod.id} className="glass-panel rounded-[32px] border border-white/5 overflow-hidden">
                                        <div className="p-6 bg-white/[0.02] border-b border-white/5 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-black text-slate-500">{i + 1}</div>
                                                <input
                                                    type="text"
                                                    value={mod.title}
                                                    onChange={(e) => {
                                                        const newMods = [...courseModules];
                                                        newMods[i].title = e.target.value;
                                                        setCourseModules(newMods);
                                                    }}
                                                    onBlur={(e) => saveModuleTitle(mod.id, e.target.value)}
                                                    className="bg-transparent border-none text-white font-black focus:outline-none text-sm p-0 min-w-[200px]"
                                                />
                                            </div>
                                            <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest flex items-center gap-4">
                                                ID: {mod.id}
                                                <button
                                                    onClick={() => handleDeleteModule(mod.id)}
                                                    className="p-1 hover:text-red-400 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-2 font-medium">
                                            {mod.lessons.map((lesson, li) => (
                                                <div key={lesson.id} className="p-6 bg-white/5 rounded-[28px] border border-white/5 hover:border-brand-500/30 transition-all space-y-4 group">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4 flex-1">
                                                            <div className="w-2 h-2 rounded-full bg-slate-700 group-hover:bg-brand-500 transition-colors" />
                                                            <input
                                                                type="text"
                                                                value={lesson.title}
                                                                onChange={(e) => saveLessonValue(lesson.id, 'title', e.target.value)}
                                                                className="bg-transparent border-none text-sm font-bold text-white focus:outline-none flex-1 p-0"
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
                                                            <input
                                                                type="text"
                                                                value={lesson.content || ''}
                                                                onChange={(e) => saveLessonValue(lesson.id, 'content', e.target.value)}
                                                                placeholder="Self-leadership and mindset..."
                                                                className="w-full bg-[#060914] border border-white/5 rounded-xl py-2 px-3 text-[10px] text-slate-400 focus:outline-none focus:border-brand-500/50"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => handleAddLesson(mod.id)}
                                                className="w-full py-3 border border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-400 hover:border-white/20 transition-all mt-4"
                                            >
                                                <PlusCircle className="w-3 h-3" /> Add Lesson to {mod.title}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
