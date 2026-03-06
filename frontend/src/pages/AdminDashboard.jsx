import { useState, useEffect } from 'react';
import { Users, BookOpen, DollarSign, Settings, Search, MoreHorizontal, GraduationCap, ArrowUpRight, ShieldCheck, Power } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCourses, getAdminParticipants, getSystemSettings, updateSystemSetting, updateCourseStatus } from '../lib/api';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [settings, setSettings] = useState({ grant_disbursement_active: true });
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cData, sData, setts] = await Promise.all([
                    getCourses(),
                    getAdminParticipants(),
                    getSystemSettings()
                ]);
                setCourses(cData);
                setStudents(sData);
                setSettings(setts);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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

    if (loading) return (
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
                        { icon: <LayoutGrid className="w-4 h-4" />, label: 'Overview', active: true },
                        { icon: <Users className="w-4 h-4" />, label: 'Students' },
                        { icon: <BookOpen className="w-4 h-4" />, label: 'Curriculum' },
                        { icon: <DollarSign className="w-4 h-4" />, label: 'Grants' },
                        { icon: <Settings className="w-4 h-4" />, label: 'Settings' },
                    ].map((item, i) => (
                        <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-not-allowed transition-all ${item.active ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                            {item.icon}
                            <span className="text-sm font-semibold">{item.label}</span>
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Command Center</h1>
                        <p className="text-slate-400 text-sm">Real-time control over the HerFuture socio-economic engine.</p>
                    </div>

                    {/* Global Kill Switch UI */}
                    <div className={`p-1 pl-4 rounded-2xl flex items-center gap-4 border transition-all ${settings.grant_disbursement_active ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Grant System</span>
                            <span className={`text-xs font-bold ${settings.grant_disbursement_active ? 'text-emerald-400' : 'text-red-400'}`}>
                                {settings.grant_disbursement_active ? 'OPERATIONAL' : 'PAUSED'}
                            </span>
                        </div>
                        <button
                            onClick={toggleGrants}
                            className={`p-3 rounded-xl transition-all ${settings.grant_disbursement_active ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'}`}
                        >
                            <Power className="w-4 h-4" />
                        </button>
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
                    {/* Student Registry */}
                    <div className="lg:col-span-2 glass-panel rounded-[40px] border border-white/5 overflow-hidden">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center">
                            <h3 className="font-bold">Student Registry</h3>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search by name or phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-slate-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-brand-500/50 min-w-[240px]"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                                    <tr>
                                        <th className="px-8 py-4">Student</th>
                                        <th className="px-8 py-4">Progress</th>
                                        <th className="px-8 py-4">Wallet</th>
                                        <th className="px-8 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-slate-300">
                                    {filteredStudents.map((s, i) => (
                                        <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="font-bold text-white">{s.first_name} {s.last_name}</div>
                                                <div className="text-[10px] text-slate-500 tracking-wider">{s.phone}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden w-24">
                                                        <div className="h-full bg-brand-500" style={{ width: `${s.percentage}%` }} />
                                                    </div>
                                                    <span className="text-[10px] font-bold">{s.percentage}%</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-[10px] font-mono text-slate-500">{s.wallet_address?.slice(0, 10)}...</div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <MoreHorizontal className="w-4 h-4 text-slate-500 cursor-pointer" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Content Toggles */}
                    <div className="glass-panel rounded-[40px] border border-white/5 p-8">
                        <h3 className="font-bold mb-8">Course Visibility</h3>
                        <div className="space-y-4">
                            {courses.map(course => (
                                <div key={course.id} className="p-4 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800">
                                            <img src={course.image_url} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-white leading-tight">{course.title}</div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-widest">{course.category}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleCourse(course.id, course.is_published)}
                                        className={`w-10 h-6 rounded-full relative transition-all duration-300 ${course.is_published ? 'bg-emerald-500/20' : 'bg-slate-800'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${course.is_published ? 'right-1 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'left-1 bg-slate-600'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

const LayoutGrid = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
);

const Activity = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
);
