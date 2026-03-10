import { useState, useEffect } from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import LoadingScreen from '../components/LoadingScreen';
import { getCourses } from '../lib/api';

export default function Courses() {
    const navigate = useNavigate();

    const { data: courses = [], isLoading: queryLoading } = useQuery({
        queryKey: ['courses'],
        queryFn: getCourses,
        select: (data) => Array.isArray(data) ? data.filter(c => c.is_published) : []
    });

    useEffect(() => {
        // Guard: redirect to signup if not logged in
        if (!localStorage.getItem('userPhone')) {
            navigate('/signup');
        }
    }, [navigate]);


    const loading = queryLoading;

    if (loading) return <LoadingScreen message="Curating HerFuture Academy..." />;

    return (
        <div className="p-4 md:p-8 pb-32 bg-slate-50 dark:bg-transparent min-h-screen transition-colors duration-300">
            <div className="mb-10 text-center md:text-left">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase italic">HerFuture Academy.</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Master the basics of digital skills and earn as you learn.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course) => (
                    <div
                        key={course.id}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden group flex flex-col cursor-pointer transition-all duration-300 hover:translate-y-[-4px] active:scale-95 hover:border-brand-500/30 shadow-sm hover:shadow-xl dark:shadow-none"
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
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors tracking-tight uppercase italic">
                                {course.title}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-500 mb-8 line-clamp-2 leading-relaxed font-medium">
                                {course.description}
                            </p>

                            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                                <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                                        <span>Comprehensive Track</span>
                                    </div>
                                </div>
                                <div
                                    className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-brand-500 group-hover:text-white transition-all transform group-hover:scale-110 shadow-inner dark:shadow-none"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
