import { useState } from 'react';
import { Home, Award, Database, ChevronLeft, ChevronRight, HelpCircle, MessageSquare, LogOut, X as CloseIcon, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ active, onCollapseChange, isOpen, onClose }) {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    const toggleCollapse = () => {
        const newState = !collapsed;
        setCollapsed(newState);
        if (onCollapseChange) onCollapseChange(newState);
    };

    const handleLogout = () => {
        localStorage.removeItem('userPhone');
        sessionStorage.removeItem('is_admin');
        navigate('/signup');
    };

    const menu = [
        { name: 'Dashboard', icon: Home, path: '/dashboard' },
        { name: 'Certificates', icon: Award, path: '/certificates' },
        { name: 'Grant History', icon: Database, path: '/grants' },
    ];

    const resources = [
        { name: 'Knowledge Base', icon: HelpCircle, path: '#' },
        { name: 'Community Forum', icon: MessageSquare, path: '#' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] md:hidden animate-in fade-in duration-300"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full z-50 bg-[#060912] border-r border-white/5 transition-all duration-300 ease-in-out flex flex-col
                    ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'}
                    ${collapsed ? 'md:w-[80px]' : 'md:w-64'}
                `}
            >
                {/* Logo + collapse toggle */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div
                            className="h-10 cursor-pointer transition-transform active:scale-95"
                            onClick={() => navigate('/')}
                        >
                            <img src="/images/logo.svg" alt="HerFuture Chain Logo" className="h-full w-auto" />
                        </div>
                    </div>

                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={toggleCollapse}
                        className={`hidden md:flex p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all duration-200 ${collapsed ? 'hidden' : ''}`}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="md:hidden p-2 text-slate-400 hover:text-white"
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 mt-4 space-y-1 px-2">
                    {menu.map((item) => {
                        const isActive = active === item.name.toLowerCase();
                        return (
                            <button
                                key={item.name}
                                onClick={() => navigate(item.path)}
                                title={collapsed && !isOpen ? item.name : ''}
                                className={`w-full flex items-center gap-3 px-3 py-3.5 rounded-xl transition-all duration-200 ${collapsed && !isOpen ? 'justify-center' : ''
                                    } ${isActive
                                        ? 'bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/20'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-fuchsia-400' : 'text-slate-500'}`} />
                                {(!collapsed || isOpen) && (
                                    <span className="font-medium text-sm truncate">{item.name}</span>
                                )}
                                {isActive && (!collapsed || isOpen) && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-fuchsia-400" />
                                )}
                            </button>
                        );
                    })}

                    <div className="pt-6 pb-2 px-3">
                        {(!collapsed || isOpen) && <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-2">Resources</p>}
                        {(collapsed && !isOpen) && <div className="h-px bg-white/5 mx-1 mb-4" />}
                    </div>

                    {resources.map((item) => (
                        <div
                            key={item.name}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${collapsed && !isOpen ? 'justify-center' : ''
                                } text-slate-500/50 cursor-not-allowed border border-transparent`}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0 opacity-40" />
                            {(!collapsed || isOpen) && (
                                <div className="flex flex-col">
                                    <span className="font-medium text-xs truncate">{item.name}</span>
                                    <span className="text-[8px] font-black text-brand-500 uppercase tracking-tighter">Coming Soon</span>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Network & Auth */}
                <div className="p-4 space-y-4">
                    {/* Network badge */}
                    {collapsed && !isOpen ? (
                        <div className="flex justify-center py-2" title="Celo Mainnet">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 ring-4 ring-green-500/20" />
                        </div>
                    ) : (
                        <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl">
                            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-2">Protocol Status</p>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-xs font-bold text-slate-400">Identity Secure</span>
                            </div>
                        </div>
                    )}

                    {/* Log Out Button */}
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-3 py-3.5 rounded-xl transition-all duration-200 group
                            ${collapsed && !isOpen ? 'justify-center' : ''}
                            bg-red-500/5 hover:bg-red-500/10 text-red-500/70 hover:text-red-500 border border-red-500/10
                        `}
                        title={collapsed && !isOpen ? 'Log Out' : ''}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {(!collapsed || isOpen) && (
                            <span className="font-black text-[10px] uppercase tracking-widest">Log Out</span>
                        )}
                    </button>

                    {/* Desktop Collapse Toggle at Bottom */}
                    <div className="hidden md:block">
                        {!collapsed ? (
                            <button
                                onClick={toggleCollapse}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/5 text-slate-600 hover:text-slate-300 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest transition-all duration-200"
                            >
                                <ChevronLeft className="w-3 h-3" />
                                <span>Collapse</span>
                            </button>
                        ) : (
                            <button
                                onClick={toggleCollapse}
                                className="w-full flex items-center justify-center p-2.5 rounded-xl border border-white/5 text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all duration-200"
                                title="Expand sidebar"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
