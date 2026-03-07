import { useState, useEffect } from 'react';
import { BookOpen, ArrowRight, Star, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { getCourses } from '../lib/api';

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
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
        <div className="min-h-screen bg-slate-950 font-sans">
            <Sidebar active="courses" />
            <Topbar title="Academy" />

            <main className="md:ml-64 p-8">
                <div className="mb-10 text-center md:text-left">
                    <h2 className="text-3xl font-bold text-white mb-2">HerFuture Academy</h2>
                    <p className="text-slate-400">Master the basics of blockchain and earn as you learn.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            className="glass-panel group relative overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:translate-y-[-4px]"
                            onClick={() => navigate(`/courses/${course.id}`)}
                        >
                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={course.image_url || `https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    alt={course.title}
                                />
                                <div className="absolute top-4 left-4">
                                    <span
                                        className="text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest backdrop-blur-sm"
                                        style={{ backgroundColor: `${course.color_code}CC` }}
                                    >
                                        {course.category}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-400 transition-colors">
                                    {course.title}
                                </h3>
                                <p className="text-sm text-slate-400 mb-6 line-clamp-2">
                                    {course.description}
                                </p>

                                <div className="mt-auto pt-6 border-t border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <BookOpen className="w-3.5 h-3.5" />
                                            <span>{course.track_number === 1 ? '4' : '6'} Modules</span>
                                        </div>
                                    </div>
                                    <div
                                        className="p-2 rounded-xl bg-slate-800 group-hover:text-white transition-all group-hover:scale-110"
                                        style={{ color: '#fff' }}
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
