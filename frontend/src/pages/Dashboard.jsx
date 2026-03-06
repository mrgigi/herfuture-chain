import { useState, useEffect } from 'react';
import { ExternalLink, Award, CheckCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { getParticipant } from '../lib/api';

export default function Dashboard() {
    const [participant, setParticipant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const email = localStorage.getItem('userEmail');
            if (!email) {
                setLoading(false);
                setError('No user logged in');
                return;
            }

            try {
                const data = await getParticipant(email);
                setParticipant(data);
            } catch (err) {
                setError('Failed to fetch profile data');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="h-12 w-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
    );

    const walletAddress = participant?.wallet_address || "0x000...000";
    const name = participant?.name || "Student";

    return (
        <div className="min-h-screen bg-slate-950 font-sans">
            <Sidebar active="dashboard" />
            <Topbar title="Overview" />

            <main className="md:ml-64 p-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-950/30 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium">
                        {error}
                    </div>
                )}

                {/* Hero Section */}
                <div className="glass-panel rounded-3xl p-8 mb-8 relative overflow-hidden">
                    <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-gradient-to-br from-brand-600/20 to-indigo-600/10 blur-[80px]" />

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {name}! 👋</h2>
                            <p className="text-slate-400">You are 2 modules away from your next grant milestone.</p>
                        </div>

                        <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-5 shadow-2xl backdrop-blur-sm min-w-[280px]">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Available Balance</span>
                                <div className="text-xs bg-brand-500/20 text-brand-300 px-2 py-1 rounded-md border border-brand-500/30">cUSD</div>
                            </div>
                            <div className="text-4xl font-bold text-white tracking-tight">$450.00</div>
                            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                Wallet Active: <span className="font-mono text-slate-400">{walletAddress}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Course Progress & Stats grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Progress Tracker */}
                    <div className="lg:col-span-2 glass-panel rounded-3xl p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-white">Current Track: Fintech Developer MVP</h3>
                            <span className="text-brand-400 text-sm font-medium">60% Complete</span>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden mb-8 shadow-inner relative">
                            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-600 to-indigo-500 rounded-full w-[60%] transition-cols duration-1000 ease-in-out">
                                <div className="absolute top-0 right-0 bottom-0 w-[50px] bg-gradient-to-r from-transparent to-white/20 animate-pulse" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { name: "Frontend Basics (React)", status: "done" },
                                { name: "Blockchain Architecture 101", status: "done" },
                                { name: "Smart Contract Deployment", status: "active" },
                                { name: "Pitching to Investors", status: "pending" },
                            ].map((step, idx) => (
                                <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${step.status === 'done' ? 'bg-slate-800/50 border-slate-700/50' :
                                    step.status === 'active' ? 'bg-brand-900/20 border-brand-500/30 ring-1 ring-brand-500/20' :
                                        'bg-slate-900/50 border-slate-800 opacity-60'
                                    }`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step.status === 'done' ? 'bg-green-500/20 text-green-400' :
                                            step.status === 'active' ? 'bg-brand-500/20 text-brand-400 animate-pulse' :
                                                'bg-slate-800 text-slate-500'
                                            }`}>
                                            {step.status === 'done' ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                                        </div>
                                        <span className={`font-medium ${step.status === 'active' ? 'text-white' : 'text-slate-300'}`}>{step.name}</span>
                                    </div>

                                    {step.status === 'active' && (
                                        <button className="text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg transition-colors">
                                            Resume Module
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats sidebar */}
                    <div className="space-y-8">
                        {/* Recent Credentials Card */}
                        <div className="glass-panel rounded-3xl p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2 bg-indigo-500/10 rounded-lg">
                                    <Award className="w-5 h-5 text-indigo-400" />
                                </div>
                                <h3 className="font-semibold text-white">Latest Credential</h3>
                            </div>

                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-5 rounded-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Award className="w-24 h-24" />
                                </div>
                                <span className="text-xs font-mono text-indigo-400 bg-indigo-950/50 px-2 py-1 rounded">Verified on Celo</span>
                                <h4 className="text-lg font-bold text-white mt-4 mb-1">React Developer</h4>
                                <p className="text-xs text-slate-400 mb-6">Issued: March 6th, 2026</p>

                                <button className="flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 group/btn">
                                    View on IPFS <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                </button>
                            </div>
                        </div>

                        <div className="glass-panel rounded-3xl p-6 bg-brand-900/10 border-brand-800/30">
                            <h3 className="font-semibold text-white mb-2">Next Milestone Grant</h3>
                            <p className="text-sm text-slate-400 mb-4">Complete "Smart Contract Deployment" to unlock your next tranche.</p>

                            <div className="text-3xl font-bold text-brand-400 mb-2">$150.00 cUSD</div>
                            <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition-colors">
                                View Grant Details
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
