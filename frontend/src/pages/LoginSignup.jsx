import { useState } from 'react';
import { ArrowRight, Wallet, ShieldCheck, Mail, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api, { createWallet } from '../lib/api';


export default function LoginSignup() {
    const [isLogin, setIsLogin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '' });
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (isLogin) {
            // For now, simulate login by just storing the email and checking if participant exists
            try {
                await api.get(`/participant/${formData.email}`);
                localStorage.setItem('userEmail', formData.email);
                navigate('/dashboard');
            } catch (err) {
                setError('User not found. Please sign up first.');
            } finally {
                setLoading(false);
            }
        } else {
            try {
                const response = await createWallet(formData.name, formData.email);
                console.log('Wallet created successfully:', response);
                localStorage.setItem('userEmail', formData.email);
                navigate('/dashboard');
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to create wallet. Please try again.');
                setLoading(false);
            }
        }
    };

    return (
        <div className="flex min-h-screen bg-[#0A0F1C] items-center justify-center p-4">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-600/20 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />

            <div className="w-full max-w-md z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 bg-brand-500/10 rounded-2xl mb-4 border border-brand-500/20">
                        <ShieldCheck className="w-8 h-8 text-brand-400" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">HerFuture</h1>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto">
                        Empowering women through blockchain-verified education and grants.
                    </p>
                </div>

                <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-indigo-500" />

                    <div className="flex gap-4 mb-8">
                        <button
                            className={`flex-1 pb-3 text-sm font-medium transition-all duration-300 border-b-2 ${!isLogin ? 'border-brand-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                            onClick={() => setIsLogin(false)}
                        >
                            Sign Up
                        </button>
                        <button
                            className={`flex-1 pb-3 text-sm font-medium transition-all duration-300 border-b-2 ${isLogin ? 'border-brand-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                            onClick={() => setIsLogin(true)}
                        >
                            Log In
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center font-medium">
                                {error}
                            </div>
                        )}

                        {!isLogin && (
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-800/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all sm:text-sm"
                                        placeholder="Jane Doe"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-800/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all sm:text-sm"
                                    placeholder="jane@example.com"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-brand-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Access Dashboard' : 'Create Web3 Wallet'}
                                    {!isLogin && <Wallet className="w-4 h-4" />}
                                    {isLogin && <ArrowRight className="w-4 h-4" />}
                                </>
                            )}
                        </button>
                    </form>

                    {!isLogin && (
                        <p className="mt-6 text-xs text-center text-slate-500">
                            By signing up, you agree to our Terms and authorize the creation of a decentralized identity (DID) on the Celo blockchain.
                        </p>
                    )}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-slate-400 text-sm">Are you an employer? <span onClick={() => navigate('/verify')} className="text-brand-400 font-medium cursor-pointer hover:underline">Verify a credential</span></p>
                </div>
            </div>
        </div>
    );
}
