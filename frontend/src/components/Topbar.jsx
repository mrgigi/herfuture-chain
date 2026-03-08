import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Bell, Copy, Check, CalendarDays, Menu } from 'lucide-react';

export default function Topbar({ userName, modulesCompleted, totalModules, sidebarCollapsed, onOpenMobileMenu }) {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [user, setUser] = useState(null);
    const [copied, setCopied] = useState(false);

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

    const handleCopyAddress = () => {
        if (user?.wallet_address) {
            navigator.clipboard.writeText(user.wallet_address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const registeredOn = user?.created_at
        ? new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/')
        : null;

    const initials = user ? `${user.first_name?.[0] || 'S'}${user.last_name?.[0] || ''}`.toUpperCase() : '??';
    const displayName = userName || user?.first_name || '{First Name}';
    const completed = modulesCompleted ?? 0;
    const total = totalModules ?? 16;

    return (
        <div className={`${sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64'} bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-8 py-4 flex items-center justify-between transition-all duration-300`}>
            {/* Left: Welcome greeting + subtitle */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onOpenMobileMenu}
                    className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold text-white leading-tight">
                    Welcome, <span className="text-brand-400">{displayName}</span> 👋
                </h1>
            </div>

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

                {/* Profile avatar + dropdown */}
                <div className="relative">
                    <div
                        onClick={() => {
                            setShowProfile(!showProfile);
                            setShowNotifications(false);
                        }}
                        className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center shadow-lg border-2 border-slate-800 cursor-pointer hover:scale-105 transition-transform overflow-hidden"
                    >
                        {localStorage.getItem('userAvatar') ? (
                            <img src={localStorage.getItem('userAvatar')} alt="Profile" className="w-full h-full object-cover p-1" />
                        ) : user?.avatar_url ? (
                            <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-semibold text-white">{initials}</span>
                        )}
                    </div>

                    {showProfile && (
                        <div className="absolute right-0 mt-3 w-72 glass-panel bg-slate-900 border border-white/5 shadow-2xl rounded-2xl p-5 animate-in fade-in slide-in-from-top-2">
                            <div className="flex flex-col items-center mb-6">
                                <div className="h-16 w-16 mb-3 rounded-full bg-slate-800 flex items-center justify-center shadow-lg border-2 border-slate-800 overflow-hidden">
                                    {localStorage.getItem('userAvatar') ? (
                                        <img src={localStorage.getItem('userAvatar')} alt="Profile" className="w-full h-full object-cover p-2" />
                                    ) : user?.avatar_url ? (
                                        <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xl font-semibold text-white">{initials}</span>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-white tracking-tight">{user?.first_name} {user?.last_name}</h3>
                                <p className="text-xs text-slate-400 font-medium">{user?.phone}</p>
                            </div>

                            <div className="space-y-3">
                                {/* Wallet Address */}
                                <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5 relative group">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Wallet Address</div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 text-xs font-mono text-slate-300 truncate">
                                            {user?.wallet_address || 'Loading...'}
                                        </div>
                                        <button
                                            onClick={handleCopyAddress}
                                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0"
                                            title="Copy Address"
                                        >
                                            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Registration Date */}
                                {registeredOn && (
                                    <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 flex items-center gap-1.5">
                                            <CalendarDays className="w-3 h-3" />
                                            Registered On
                                        </div>
                                        <div className="text-xs font-medium text-slate-300">{registeredOn}</div>
                                    </div>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                >
                                    Log Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
