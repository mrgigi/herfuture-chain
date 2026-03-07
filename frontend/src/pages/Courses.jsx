import { useState, useEffect } from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { getCourses } from '../lib/api';

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await getCourses();
                setCourses(data.filter(c => c.is_published));
            } catch (err) {
                console.error("Failed to fetch courses:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="h-12 w-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#060912] font-sans text-slate-200 flex flex-col">
            <Sidebar active="courses" onCollapseChange={setSidebarCollapsed} />
            <Topbar sidebarCollapsed={sidebarCollapsed} />

            <main className={`${sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64'} flex-grow p-4 md:p-8 max-w-7xl transition-all duration-300`}>
                <div className="mb-10 text-center md:text-left">
                    <h2 className="text-3xl font-bold text-white mb-2">HerFuture Academy</h2>
                    <p className="text-slate-400">Master the basics of blockchain and earn as you learn.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden group flex flex-col cursor-pointer transition-all duration-300 hover:translate-y-[-4px] hover:border-brand-500/30"
                            onClick={() => navigate(`/courses/${course.id}`)}
                        >
                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={course.image_url || `https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    alt={course.title}
                                />
                            </div>

                            <div className="p-8 flex flex-col flex-1">
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-brand-400 transition-colors tracking-tight">
                                    {course.title}
                                </h3>
                                <p className="text-sm text-slate-500 mb-8 line-clamp-2 leading-relaxed">
                                    {course.description}
                                </p>

                                <div className="mt-auto pt-6 border-t border-slate-800/60 flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                                            <span>Comprehensive Track</span>
                                        </div>
                                    </div>
                                    <div
                                        className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-all transform group-hover:scale-110"
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
