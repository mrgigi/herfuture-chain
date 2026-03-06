import { useState, useEffect } from 'react';
import { DollarSign, ExternalLink, Calendar, CheckCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { getParticipant, getGrants } from '../lib/api';

export default function Grants() {
    const [grants, setGrants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGrants = async () => {
            const email = localStorage.getItem('userEmail');
            if (!email) {
                setLoading(false);
                setError('Please log in to view grant history');
                return;
            }

            try {
                const participant = await getParticipant(email);
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
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="h-12 w-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 font-sans">
            <Sidebar active="grant history" />
            <Topbar title="Grant History" />

            <main className="md:ml-64 p-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">cUSD Grant Disbursements</h2>
                    <p className="text-slate-400">Track your educational milestones and the corresponding grant payouts distributed on Celo.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-950/30 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-800 bg-slate-800/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <div className="col-span-1 hidden sm:block">Status</div>
                        <div className="col-span-4 sm:col-span-3">Milestone</div>
                        <div className="col-span-3 sm:col-span-2">Amount (cUSD)</div>
                        <div className="col-span-4 sm:col-span-3 hidden sm:block">Date</div>
                        <div className="col-span-4 sm:col-span-3 text-right">Transaction</div>
                    </div>

                    <div className="divide-y divide-slate-800">
                        {grants.length > 0 ? grants.map((grant) => (
                            <div key={grant.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-800/30 transition-colors">
                                <div className="col-span-1 hidden sm:flex items-center">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <h3 className="text-sm font-semibold text-white truncate">{grant.milestone_name}</h3>
                                </div>

                                <div className="col-span-3 sm:col-span-2 flex items-center gap-1 font-mono">
                                    <DollarSign className="w-3 h-3 text-brand-400" />
                                    <span className="text-brand-300 font-bold">
                                        {grant.amount}
                                    </span>
                                </div>

                                <div className="col-span-4 sm:col-span-3 hidden sm:flex items-center gap-2 text-sm text-slate-400">
                                    <Calendar className="w-4 h-4 text-slate-500" />
                                    {new Date(grant.created_at).toLocaleDateString()}
                                </div>

                                <div className="col-span-3 text-right flex justify-end">
                                    <a
                                        href={`https://celoscan.io/tx/${grant.tx_hash}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-950/30 text-green-400 hover:bg-green-900/50 transition-colors border border-green-500/20"
                                    >
                                        <span className="hidden sm:inline">Explorer</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>
                        )) : (
                            <div className="p-10 text-center text-slate-500">
                                No grant disbursements found yet. Complete modules to earn cUSD!
                            </div>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}
