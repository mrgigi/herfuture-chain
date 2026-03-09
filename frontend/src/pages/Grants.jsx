import { useState, useEffect } from 'react';
import { DollarSign, ExternalLink, Calendar, CheckCircle, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getParticipant, getGrants } from '../lib/api';
import { useCurrency } from '../hooks/useCurrency';

export default function Grants() {
    const { toNaira, formatNaira, formatCUSD } = useCurrency();
    const [grants, setGrants] = useState([]);
    const [loading, setLoading] = useState(true);       // Full-page spinner on first load
    const [isRefreshing, setIsRefreshing] = useState(false); // Silent background refresh
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGrants = async () => {
            const phone = localStorage.getItem('userPhone');
            if (!phone) {
                setLoading(false);
                setError('Please log in to view grant history');
                return;
            }


            try {
                const participant = await getParticipant(phone);
                if (participant && participant.id) {
                    const data = await getGrants(participant.id);
                    setGrants(data);
                } else {
                    setError('Participant not found.');
                }
            } catch (err) {
                console.error("Failed to fetch grants:", err);
                setError('Failed to load grant records');
            } finally {
                setLoading(false);
            }
        };

        fetchGrants();

        // Silently refetch when window regains focus (e.g. navigating back from lesson)
        // Uses isRefreshing so the existing grant list stays visible during refresh
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                setIsRefreshing(true);
                fetchGrants().finally(() => setIsRefreshing(false));
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="h-12 w-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="p-4 md:p-8 pb-32">
            <div className="mb-8 px-2 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">My Reward History</h2>
                    <p className="text-slate-400">Track all the rewards you've earned while learning and growing your future.</p>
                </div>
                {isRefreshing && (
                    <div className="h-4 w-4 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                )}
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-400/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-wider text-center">
                    {error}
                </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-[28px] overflow-hidden shadow-2xl">
                <div className="grid grid-cols-12 gap-4 p-5 border-b border-slate-800 bg-slate-800/20 text-[10px] font-black text-slate-500 uppercase tracking-[2px]">
                    <div className="col-span-1 hidden sm:block">Status</div>
                    <div className="col-span-4 sm:col-span-3">Milestone</div>
                    <div className="col-span-3 sm:col-span-2">Amount</div>
                    <div className="col-span-4 sm:col-span-3 hidden sm:block">Date</div>
                    <div className="col-span-4 sm:col-span-3 text-right">Verification</div>
                </div>

                <div className="divide-y divide-slate-800">
                    {grants.length > 0 ? grants.map((grant) => (
                        <div key={grant.id} className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-slate-800/30 transition-colors">
                            <div className="col-span-1 hidden sm:flex items-center">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                </div>
                            </div>

                            <div className="col-span-6 sm:col-span-3">
                                <h3 className="text-sm font-bold text-white truncate group-hover:text-brand-400 transition-colors uppercase tracking-tight">{grant.milestone_name}</h3>
                                <div className="flex items-center gap-2 mt-1 sm:hidden">
                                    <Calendar className="w-3 h-3 text-slate-600" />
                                    <span className="text-[9px] text-slate-500 font-mono">{new Date(grant.created_at).toLocaleDateString('en-GB')}</span>
                                </div>
                            </div>

                            <div className="col-span-3 sm:col-span-2 flex flex-col items-start justify-center">
                                <span className="text-emerald-400 font-black text-sm">
                                    {formatNaira(toNaira(grant.amount))}
                                </span>
                                <span className="text-[10px] font-bold text-slate-500">
                                    {formatCUSD(grant.amount)}
                                </span>
                            </div>

                            {/* Breakdown Column (Desktop Only) */}
                            <div className="col-span-3 hidden md:flex flex-col gap-1 justify-center border-l border-white/5 pl-4">
                                <div className="flex justify-between items-center w-full max-w-[140px]">
                                    <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Withdrawable</span>
                                    <span className="text-[9px] font-black text-slate-300 tracking-tighter">{formatCUSD(grant.withdrawable_amount || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center w-full max-w-[140px]">
                                    <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Savings</span>
                                    <span className="text-[9px] font-black text-slate-300 tracking-tighter">{formatCUSD(grant.savings_amount || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center w-full max-w-[140px]">
                                    <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Investment</span>
                                    <span className="text-[9px] font-black text-slate-300 tracking-tighter">{formatCUSD(grant.investment_amount || 0)}</span>
                                </div>
                            </div>

                            <div className="col-span-3 sm:col-span-2 hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500 font-mono">
                                <Calendar className="w-3.5 h-3.5 text-slate-700" />
                                {new Date(grant.created_at).toLocaleDateString('en-GB')}
                            </div>

                            <div className="col-span-3 sm:col-span-1 text-right flex justify-end">
                                <a
                                    href={`https://celoscan.io/tx/${grant.tx_hash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-950 text-slate-500 hover:bg-brand-500 hover:text-white transition-all active:scale-95 border border-slate-800 hover:border-brand-500 shadow-lg hover:shadow-brand-500/20"
                                    title="Verify on Explorer"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    )) : (
                        <div className="p-20 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                <Wallet className="w-8 h-8 text-slate-700" />
                            </div>
                            <p className="text-slate-500 text-sm font-medium">No payouts recorded yet. Start learning to earn rewards!</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 px-5 py-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-300 mb-0.5">Need help with your wallet?</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Your rewards are paid out in cUSD, a stable currency. You can withdrawal them to any supported wallet.</p>
                </div>
            </div>
        </div>
    );
}
