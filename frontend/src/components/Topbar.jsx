import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Bell } from 'lucide-react';

export default function Topbar({ title }) {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [user, setUser] = useState(null);

    const phone = localStorage.getItem('userPhone');
    const isDemoAccount = phone === '0739039856';

    useEffect(() => {
        const fetchUser = async () => {
            if (phone) {
                try {
                    const { data } = await api.get(`/participant/${phone}`);
                    setUser(data);
                } catch (err) {
                    console.error("Topbar user fetch error:", err);
                }
            }
        };
        fetchUser();
    }, [phone]);

    const notifications = isDemoAccount ? [
        { id: 1, title: 'Grant Released!', body: 'Your grant for Module 2.1 has been released on-chain.', time: '2h ago' },
        { id: 2, title: 'New Badge Awarded', body: 'You earned the "Digital Literacy" badge.', time: '1d ago' },
        { id: 3, title: 'Welcome to Track 2', body: 'You have successfully unlocked Track 2 curriculum.', time: '3d ago' }
    ] : [];

    const handleLogout = () => {
        localStorage.removeItem('userPhone');
        navigate('/signup');
    };

    const initials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() : '??';

    return (
        <div className="md:ml-64 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-8 py-5 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-slate-100">{title}</h1>

            <div className="flex items-center gap-6">
                {/* Notification Bell */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <Bell className="w-5 h-5" />
                        {notifications.length > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-3 h-3 bg-brand-500 border-2 border-slate-900 rounded-full"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-3 w-80 glass-panel border border-white/5 shadow-2xl rounded-2xl p-4 animate-in fade-in slide-in-from-top-2">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 px-2">Notifications</h4>
                            <div className="space-y-2">
                                {notifications.length > 0 ? notifications.map(n => (
                                    <div key={n.id} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                        <div className="text-xs font-bold text-white mb-1">{n.title}</div>
                                        <div className="text-[10px] text-slate-400 line-clamp-2 mb-1">{n.body}</div>
                                        <div className="text-[9px] font-medium text-brand-400">{n.time}</div>
                                    </div>
                                )) : (
                                    <div className="py-8 text-center text-[10px] text-slate-500 italic">No new notifications</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                    Logout
                </button>
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg border-2 border-slate-800 cursor-pointer hover:scale-105 transition-transform overflow-hidden">
                    {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <span className="font-semibold text-white">{initials}</span>
                    )}
                </div>
            </div>
        </div>
    )
}
