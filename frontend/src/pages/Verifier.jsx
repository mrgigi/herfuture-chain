import { useState } from 'react';
import { Search, ShieldCheck, XCircle, ArrowLeft } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { verifyCredential } from '../lib/api';

export default function Verifier() {
    const [credentialId, setCredentialId] = useState('CERT-HF-2026-X82');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [certData, setCertData] = useState(null);
    const navigate = useNavigate();

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!credentialId) return;

        setStatus('loading');
        setCertData(null);

        try {
            const response = await verifyCredential(credentialId);
            if (response && response.verified) {
                setCertData(response);
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (err) {
            console.error('Verification error:', err);
            setStatus('error');
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-[#0A0F1C] items-center justify-center p-4 transition-colors duration-300">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 dark:bg-emerald-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 dark:bg-indigo-600/10 blur-[120px] pointer-events-none" />

            <div className="w-full max-w-lg z-10">
                <div className="flex items-center justify-between mb-8">
                    <button
                        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-bold uppercase tracking-widest group"
                        onClick={() => navigate('/')}
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
                    </button>
                    <ThemeToggle />
                </div>

                <div className="glass-panel bg-white/80 dark:bg-slate-900/50 p-10 rounded-3xl relative overflow-hidden backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 shadow-2xl dark:shadow-none">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-indigo-500" />

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-3 uppercase italic">Employer Portal.</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                            Instantly verify the authenticity of a HerFuture educational credential fully on-chain.
                        </p>
                    </div>

                    <form onSubmit={handleVerify} className="space-y-6">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                                <Search className="h-5 w-5" />
                            </div>
                            <input
                                type="text"
                                required
                                value={credentialId}
                                onChange={(e) => setCredentialId(e.target.value)}
                                className="block w-full pl-12 pr-4 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl leading-5 bg-white dark:bg-slate-900/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono text-center tracking-widest font-black"
                                placeholder="Enter Credential ID"
                                disabled={status === 'loading'}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading' || !credentialId}
                            className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-2xl shadow-xl text-xs font-black uppercase tracking-widest text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-slate-900 dark:border-slate-700/50"
                        >
                            {status === 'loading' ? 'Querying Blockchain...' : <>Verify on <span className="text-emerald-400">Network</span></>}
                        </button>
                    </form>

                    {status === 'success' && certData && (
                        <div className="mt-8 p-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl text-center fade-in-up shadow-inner dark:shadow-none">
                            <div className="inline-flex p-3 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full mb-3">
                                <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-emerald-600 dark:text-emerald-400 font-black text-lg mb-1 uppercase tracking-tight italic">Blockchain Verified.</h3>
                            <p className="text-emerald-700/70 dark:text-emerald-200/70 text-sm font-medium">Valid credential issued by HerFuture Foundation.</p>

                            <div className="mt-6 pt-4 border-t border-emerald-200 dark:border-emerald-500/20 grid grid-cols-1 gap-4 text-left">
                                <div className="grid grid-cols-2 flex items-center">
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-500/70 font-black mb-0 uppercase tracking-[0.2em]">Address</p>
                                    <p className="text-xs text-emerald-900 dark:text-emerald-100 font-mono truncate font-bold">{certData.participant}</p>
                                </div>
                                <div className="grid grid-cols-2 flex items-center">
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-500/70 font-black mb-0 uppercase tracking-[0.2em]">Lesson</p>
                                    <p className="text-xs text-emerald-900 dark:text-emerald-100 font-bold italic">{certData.credentialType}</p>
                                </div>
                                <div className="grid grid-cols-2 flex items-center">
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-500/70 font-black mb-0 uppercase tracking-[0.2em]">Issued On</p>
                                    <p className="text-xs text-emerald-900 dark:text-emerald-100 font-bold">{new Date(certData.timestamp).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <a
                                    href={`https://ipfs.io/ipfs/${certData.ipfsHash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-black uppercase tracking-widest"
                                >
                                    View IPFS Metadata
                                </a>
                            </div>
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="mt-8 p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/30 rounded-2xl text-center fade-in-up shadow-inner dark:shadow-none">
                            <div className="inline-flex p-3 bg-red-500/10 dark:bg-red-500/20 rounded-full mb-3">
                                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-red-600 dark:text-red-400 font-black text-lg mb-1 uppercase tracking-tight italic">Verification Failed.</h3>
                            <p className="text-red-700/70 dark:text-red-200/70 text-sm font-medium">This credential ID was not found on the <span className="font-bold">Secure Network</span>. It may be invalid or incorrectly typed.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
