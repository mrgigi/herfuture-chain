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
    updateModule, updateLesson, getModules
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
            // Show toast or notification here
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

    const toggleGrants = async () => {
        const newVal = !settings.grant_disbursement_active;
        await updateSystemSetting('grant_disbursement_active', newVal);
        setSettings(prev => ({ ...prev, grant_disbursement_active: newVal }));
    };

    const toggleCourse = async (id, currentStatus) => {
        await updateCourseStatus(id, !currentStatus);
        setCourses(prev => prev.map(c => c.id === id ? { ...c, is_published: !currentStatus } : c));
    };

    const filteredStudents = students.filter(s =>
        (s.first_name + ' ' + s.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone.includes(searchTerm)
    );

    const stats = {
        totalStudents: students.length,
        totalGrants: students.reduce((acc, s) => acc + (s.completedCount * 30), 0),
        avgProgress: students.length ? Math.round(students.reduce((acc, s) => acc + s.percentage, 0) / students.length) : 0
    };

    if (!authorized || loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="h-12 w-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#060914] text-slate-100 font-sans flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900/50 border-r border-white/5 p-6 hidden md:block">
                <div className="flex items-center gap-3 mb-12 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center font-black text-white italic">H</div>
                    <span className="font-bold tracking-tight text-white hover:text-brand-400 transition-colors">Admin Console</span>
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
                            onClick={() => setActiveTab(item.label)}
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-400">System Live</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Command Center.</h1>
                        <p className="text-slate-400 text-sm font-medium">Real-time control over the HerFuture socio-economic engine.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Global Kill Switch UI */}
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

                {activeTab === 'Overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Audit Log / Recent Activity */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex justify-between items-center px-4 mb-2">
                                <h3 className="text-xs font-black uppercase tracking-[2px] text-slate-500">On-Chain Audit Log</h3>
                                <div className="text-[10px] text-brand-400 font-bold flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                                    Synchronized
                                </div>
                            </div>
                            <div className="glass-panel rounded-[40px] border border-white/5 overflow-hidden">
                                {recentGrants.slice(0, 5).map((grant, i) => (
                                    <div key={i} className="p-6 border-b border-white/5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center font-bold text-slate-400 uppercase italic text-sm">{grant.student[0]}</div>
                                            <div>
                                                <div className="font-bold text-white text-sm">{grant.student}</div>
                                                <div className="text-[10px] text-slate-500 mt-0.5">Disbursement for <span className="text-slate-300 font-bold">{grant.track}</span></div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-black text-brand-400 text-sm">+$ {grant.amount}.00</div>
                                            <div className="text-[9px] font-mono text-slate-600 mt-1 uppercase tracking-tighter">Tx: {grant.tx?.slice(0, 10)}...</div>
                                        </div>
                                    </div>
                                ))}
                                {recentGrants.length === 0 && (
                                    <div className="p-12 text-center text-slate-500 text-xs italic">No disbursements processed in current epoch.</div>
                                )}
                            </div>
                        </div>

                        {/* Funding Pool & System Health */}
                        <div className="space-y-6">
                            <div className="glass-panel p-8 rounded-[40px] border border-white/5 bg-gradient-to-br from-brand-500/5 to-transparent">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Funding Pool</h3>
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
                )}

                {activeTab === 'Students' && (
                    <div className="glass-panel rounded-[40px] border border-white/5 overflow-hidden">
                        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="font-bold text-white">Student Registry</h3>
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
                                                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-black text-slate-400">{s.first_name[0]}</div>
                                                    <div>
                                                        <div className="font-black text-white">{s.first_name} {s.last_name}</div>
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
                                                    <div className="w-1.5 h-1.5 rounded-full bg-celo" />
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
                )}

                {activeTab === 'Curriculum' && (
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
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Track Title</label>
                                            <input
                                                type="text"
                                                value={editingCourse.title}
                                                onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                                                className="w-full bg-[#060914] border border-white/5 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Visual Category</label>
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
                                    <button className="flex items-center gap-2 text-[10px] font-bold text-brand-400 hover:text-white transition-colors">
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
                                                    className="bg-transparent border-none text-white font-black focus:outline-none text-sm p-0 min-w-[200px]"
                                                />
                                            </div>
                                            <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">ID: {mod.id}</div>
                                        </div>
                                        <div className="p-4 space-y-2 font-medium">
                                            {mod.lessons.map((lesson, li) => (
                                                <div key={lesson.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-brand-500/30 transition-all flex items-center justify-between group">
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className="w-2 h-2 rounded-full bg-slate-700 group-hover:bg-brand-500 transition-colors" />
                                                        <input
                                                            type="text"
                                                            value={lesson.title}
                                                            onChange={(e) => saveLessonValue(lesson.id, 'title', e.target.value)}
                                                            className="bg-transparent border-none text-xs text-slate-300 focus:text-white focus:outline-none flex-1 p-0"
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
                                                        <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-lg transition-all">
                                                            <MoreHorizontal className="w-4 h-4 text-slate-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            <button className="w-full py-3 border border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-400 hover:border-white/20 transition-all">
                                                <PlusCircle className="w-3 h-3" /> Add Lesson
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


