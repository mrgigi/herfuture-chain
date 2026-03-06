import { useState } from 'react';
import { Search, ShieldCheck, XCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { verifyCredential } from '../lib/api';

export default function Verifier() {
    const [credentialId, setCredentialId] = useState('');
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
        <div className="flex min-h-screen bg-[#0A0F1C] items-center justify-center p-4">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />

            <div className="w-full max-w-lg z-10">
                <button
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors text-sm font-semibold group"
                    onClick={() => navigate('/')}
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
                </button>

                <div className="glass-panel p-10 rounded-3xl relative overflow-hidden backdrop-blur-xl border border-slate-700/50 shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-indigo-500" />

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-3">Employer Portal</h1>
                        <p className="text-slate-400 text-sm">
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
                                className="block w-full pl-12 pr-4 py-4 border border-slate-700 rounded-2xl leading-5 bg-slate-900/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono text-center tracking-widest"
                                placeholder="Enter Credential ID"
                                disabled={status === 'loading'}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading' || !credentialId}
                            className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-2xl shadow-lg text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-slate-700/50"
                        >
                            {status === 'loading' ? 'Querying Blockchain...' : <>Verify on <span className="text-celo">Celo</span> Network</>}
                        </button>
                    </form>

                    {status === 'success' && certData && (
                        <div className="mt-8 p-6 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-center fade-in-up">
                            <div className="inline-flex p-3 bg-emerald-500/20 rounded-full mb-3">
                                <ShieldCheck className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h3 className="text-emerald-400 font-bold text-lg mb-1">Blockchain Verified</h3>
                            <p className="text-emerald-200/70 text-sm">Valid credential issued by HerFuture Foundation.</p>

                            <div className="mt-6 pt-4 border-t border-emerald-500/20 grid grid-cols-1 gap-4 text-left">
                                <div className="grid grid-cols-2">
                                    <p className="text-xs text-emerald-500/70 font-semibold mb-1 uppercase tracking-wider">Address</p>
                                    <p className="text-sm text-emerald-100 font-mono truncate">{certData.participant}</p>
                                </div>
                                <div className="grid grid-cols-2">
                                    <p className="text-xs text-emerald-500/70 font-semibold mb-1 uppercase tracking-wider">Module</p>
                                    <p className="text-sm text-emerald-100 font-medium">{certData.credentialType}</p>
                                </div>
                                <div className="grid grid-cols-2">
                                    <p className="text-xs text-emerald-500/70 font-semibold mb-1 uppercase tracking-wider">Issued On</p>
                                    <p className="text-sm text-emerald-100 font-medium">{new Date(certData.timestamp).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <a
                                    href={`https://ipfs.io/ipfs/${certData.ipfsHash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-emerald-400 hover:underline font-semibold"
                                >
                                    View IPFS Metadata
                                </a>
                            </div>
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="mt-8 p-6 bg-red-950/30 border border-red-500/30 rounded-2xl text-center fade-in-up">
                            <div className="inline-flex p-3 bg-red-500/20 rounded-full mb-3">
                                <XCircle className="w-8 h-8 text-red-400" />
                            </div>
                            <h3 className="text-red-400 font-bold text-lg mb-1">Verification Failed</h3>
                            <p className="text-red-200/70 text-sm">This credential ID was not found on the <span className="text-celo">Celo</span> blockchain. It may be invalid or incorrectly typed.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
