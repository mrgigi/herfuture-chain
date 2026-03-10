import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
    const [password, setPassword] = useState('herfuture2026');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Simple password check for demonstration - in production, use Supabase Auth
        if (password === 'herfuture2026') {
            sessionStorage.setItem('is_admin', 'true');
            navigate('/admin');
        } else {
            setError('Invalid credentials. Identity challenge failed.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#060914] transition-colors duration-300 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent)]">
            <div className="max-w-md w-full">
                <div className="text-center mb-12">
                    <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(79,70,229,0.3)]">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Admin Console.</h1>
                    <p className="text-slate-500 text-sm font-medium uppercase tracking-[0.2em]">Restricted Access Area</p>
                </div>

                <div className="glass-panel p-8 rounded-[40px] border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0D1525]/50 backdrop-blur-xl shadow-sm dark:shadow-[0_0_80px_rgba(0,0,0,0.5)]">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block pl-1">Command Password</label>
                            <div className="relative">
                                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 dark:bg-[#060914] border border-slate-200 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500/50 transition-all font-mono shadow-inner dark:shadow-none"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-black py-4 rounded-2xl transition-all shadow-[0_10px_30px_rgba(79,70,229,0.2)] flex items-center justify-center gap-2 group"
                        >
                            Authorize Access
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        ← Back to Gateway
                    </button>
                </div>
            </div>
        </div>
    );
}
