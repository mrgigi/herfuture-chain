import { useState, useEffect } from 'react';
import { Award, ExternalLink, ShieldCheck } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { getParticipant, getCredentialsByAddress } from '../lib/api';

export default function Certificates() {
    const [credentials, setCredentials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCertificates = async () => {
            const phone = localStorage.getItem('userPhone');
            if (!phone) {
                setLoading(false);
                setError('Please log in to view credentials');
                return;
            }

            try {
                const participant = await getParticipant(phone);
                if (participant && participant.wallet_address) {
                    const certs = await getCredentialsByAddress(participant.wallet_address);
                    setCredentials(certs);
                } else {
                    setError('No wallet address found for this participant.');
                }
            } catch (err) {
                console.error("Failed to fetch certificates:", err);
                setError('Failed to load certificates from blockchain. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCertificates();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="h-12 w-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
            <ShieldCheck className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Error Loading Credentials</h2>
            <p className="text-slate-400 mb-4">{error}</p>
            <p className="text-slate-500 text-sm">Please ensure you are logged in and your wallet is connected.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 font-sans">
            <Sidebar active="certificates" />
            <Topbar title="My Credentials" />

            <main className="md:ml-64 p-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Verified Blockchain Credentials</h2>
                    <p className="text-slate-400">These certificates are permanently stored on IPFS and verified on the Celo blockchain.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {credentials.length > 0 ? credentials.map((cert) => (
                        <div key={cert.id} className="glass-panel p-6 rounded-3xl relative overflow-hidden group min-h-[280px] flex flex-col">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Award className="w-32 h-32" />
                            </div>

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="p-3 bg-brand-500/10 rounded-xl border border-brand-500/20">
                                    <ShieldCheck className="w-6 h-6 text-brand-400" />
                                </div>
                                <span className="text-xs font-mono text-green-400 bg-green-950/50 px-2 py-1 rounded inline-flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    Verified
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-1 relative z-10">{cert.credentialType}</h3>
                            <p className="text-sm text-slate-400 mb-4 relative z-10">Issued: {new Date(cert.timestamp).toLocaleDateString()}</p>

                            <div className="border-t border-slate-700/50 pt-4 mt-auto relative z-10 flex justify-between items-center">
                                <div className="text-xs text-slate-500">
                                    ID: <span className="font-mono text-slate-400">{cert.id}</span>
                                </div>
                                <a
                                    href={`https://ipfs.io/ipfs/${cert.ipfsHash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                                >
                                    View IPFS <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center">
                            <Award className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-500">No blockchain credentials found for this address yet.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
