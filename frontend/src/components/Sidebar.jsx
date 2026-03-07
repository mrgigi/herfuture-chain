import { useState } from 'react';
import { Home, Award, Database, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ active, onCollapseChange }) {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    const toggleCollapse = () => {
        const newState = !collapsed;
        setCollapsed(newState);
        if (onCollapseChange) onCollapseChange(newState);
    };

    const menu = [
        { name: 'Dashboard', icon: Home, path: '/dashboard' },
        { name: 'Certificates', icon: Award, path: '/certificates' },
        { name: 'Grant History', icon: Database, path: '/grants' },
    ];

    return (
        <>
            {/* Sidebar */}
            <div
                className={`${collapsed ? 'w-[72px]' : 'w-64'} bg-slate-900 border-r border-slate-800 hidden md:flex flex-col h-full fixed top-0 left-0 z-40 transition-all duration-300 ease-in-out`}
            >
                {/* Logo + collapse toggle */}
                <div className="h-20 flex items-center justify-between px-4 border-b border-slate-800/60">
                    {!collapsed && (
                        <img
                            src="/images/logo.svg"
                            alt="HerFuture Chain Logo"
                            className="h-8 w-auto cursor-pointer transition-opacity duration-200"
                            onClick={() => navigate('/')}
                        />
                    )}
                    {collapsed && (
                        <div
                            className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center cursor-pointer mx-auto"
                            onClick={() => navigate('/')}
                        >
                            <span className="text-brand-400 font-black text-sm">H</span>
                        </div>
                    )}
                    <button
                        onClick={toggleCollapse}
                        className={`flex-shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-all duration-200 ${collapsed ? 'mx-auto mt-2 hidden' : ''}`}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                </div>

                <nav className="flex-1 mt-4 space-y-1 px-2">
                    {menu.map((item) => {
                        const isActive = active === item.name.toLowerCase();
                        return (
                            <button
                                key={item.name}
                                onClick={() => navigate(item.path)}
                                title={collapsed ? item.name : ''}
                                className={`w-full flex items-center gap-3 px-3 py-3.5 rounded-xl transition-all duration-200 ${collapsed ? 'justify-center' : ''
                                    } ${isActive
                                        ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-brand-400' : 'text-slate-500'}`} />
                                {!collapsed && (
                                    <span className="font-medium text-sm truncate">{item.name}</span>
                                )}
                                {isActive && !collapsed && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Network badge */}
                <div className="p-3 mb-2">
                    {collapsed ? (
                        <div className="flex justify-center py-2" title="Celo Sepolia">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-green-500/30" />
                        </div>
                    ) : (
                        <div className="bg-slate-800/70 border border-slate-700/50 p-3.5 rounded-xl">
                            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">My Network</p>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                </span>
                                <span className="text-xs font-medium text-slate-300"><span className="text-white">Network</span> Status</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Collapse toggle at bottom when expanded */}
                {!collapsed && (
                    <button
                        onClick={toggleCollapse}
                        className="mx-3 mb-4 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-800 text-slate-500 hover:text-slate-200 hover:bg-slate-800 text-xs font-medium transition-all duration-200"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Collapse</span>
                    </button>
                )}

                {/* Expand button when collapsed */}
                {collapsed && (
                    <button
                        onClick={toggleCollapse}
                        className="mx-auto mb-4 flex items-center justify-center p-2 rounded-xl border border-slate-800 text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-all duration-200"
                        title="Expand sidebar"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Offset placeholder so content doesn't go under sidebar */}
            {/* (handled via ml-* in content, passed via global CSS or layout) */}
        </>
    );
}
