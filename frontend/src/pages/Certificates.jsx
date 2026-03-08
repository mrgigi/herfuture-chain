import { useState, useEffect } from 'react';
import { Award, ExternalLink, ShieldCheck } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useNavigate } from 'react-router-dom';
import { getParticipant, getCredentialsByAddress } from '../lib/api';

export default function Certificates() {
    const [credentials, setCredentials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

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
                setError('Failed to load certificates. Please try again later.');
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

    return (
        <div className="min-h-screen bg-[#060912] font-sans text-slate-200 flex flex-col">
            <Sidebar
                active="certificates"
                onCollapseChange={setSidebarCollapsed}
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />
            <Topbar
                sidebarCollapsed={sidebarCollapsed}
                onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            />

            <main className={`${sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64'} flex-grow p-4 md:p-8 max-w-7xl transition-all duration-300`}>
                <div className="mb-8 px-2">
                    <h2 className="text-2xl font-bold text-white mb-2">My Certificates</h2>
                    <p className="text-slate-400">These official credentials prove your skills and are yours forever.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold uppercase tracking-wider text-center">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {credentials.length > 0 ? credentials.map((cert) => (
                        <div key={cert.id} className="bg-slate-900 border border-slate-800 p-6 rounded-[28px] relative overflow-hidden group min-h-[280px] flex flex-col hover:border-brand-500/30 transition-all">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Award className="w-32 h-32" />
                            </div>

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="p-3 bg-brand-500/10 rounded-xl border border-brand-500/20">
                                    <ShieldCheck className="w-6 h-6 text-brand-400" />
                                </div>
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/5 px-3 py-1.5 rounded-full border border-emerald-500/10 inline-flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Verified
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-1 relative z-10">{cert.credentialType}</h3>
                            <p className="text-sm text-slate-500 mb-4 relative z-10">Issued: {new Date(cert.timestamp).toLocaleDateString()}</p>

                            <div className="border-t border-slate-800 pt-4 mt-auto relative z-10 flex justify-between items-center">
                                <div className="text-[10px] text-slate-500 font-mono">
                                    VERIFICATION ID: <span className="text-slate-400">{cert.id.substring(0, 8)}...</span>
                                </div>
                                <a
                                    href={`https://ipfs.io/ipfs/${cert.ipfsHash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors"
                                >
                                    Proof <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center bg-slate-900/50 border border-slate-800 border-dashed rounded-[28px]">
                            <Award className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-500 text-sm font-medium">No certificates earned yet. Keep learning!</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
