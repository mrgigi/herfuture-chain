import { useState } from 'react';
import { ArrowRight, Wallet, ShieldCheck, Phone, User, MessageSquare, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api, { createWallet } from '../lib/api';

export default function LoginSignup() {
    const [isLogin, setIsLogin] = useState(false);
    const [step, setStep] = useState('phone'); // 'phone' or 'otp'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '', otp: '' });
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simulate sending OTP
        setTimeout(() => {
            setLoading(false);
            setStep('otp');
        }, 1000);
    };

    const handleOTPSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Testing bypass for '000000'
        if (formData.otp === '000000') {
            await handleFinishAuth();
            return;
        }

        // Real OTP logic would go here
        if (formData.otp === '123456') { // Mock real OTP
            await handleFinishAuth();
        } else {
            setError('Invalid verification code. Try 000000 for testing.');
            setLoading(false);
        }
    };

    const handleFinishAuth = async () => {
        try {
            if (isLogin) {
                // For now, simulate login by checking if participant exists
                try {
                    await api.get(`/participant/${formData.phone}`);
                    localStorage.setItem('userPhone', formData.phone);
                    navigate('/dashboard');
                } catch (err) {
                    setError('User not found. Please sign up first.');
                }
            } else {
                try {
                    const response = await createWallet(formData.firstName, formData.lastName, formData.phone);
                    console.log('Wallet created successfully:', response);
                    localStorage.setItem('userPhone', formData.phone);
                    navigate('/dashboard');
                } catch (err) {
                    setError(err.response?.data?.error || 'Failed to create decentralized identity. Please try again.');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#0A0F1C] overflow-hidden">
            {/* Left Side: Sharp HD Visual (Desktop Only) */}
            <div className="hidden lg:block lg:w-[45%] xl:w-[50%] relative overflow-hidden h-screen bg-brand-900">
                <img
                    src="/images/login_hero.png"
                    className="absolute inset-0 w-full h-full object-cover animate-pulse-slow transition-transform duration-[5000ms] hover:scale-105"
                    alt="Success Portrait"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C] via-[#0A0F1C]/20 to-transparent" />

                {/* Branding on top of image */}
                <div className="absolute top-10 left-10 z-20 flex items-center gap-2 cursor-pointer transition-transform active:scale-95 h-10" onClick={() => navigate('/')}>
                    <img src="/images/logo.svg" alt="HerFuture Chain Logo" className="h-full w-auto" />
                </div>

                {/* Floating Content */}
                <div className="absolute bottom-20 left-10 right-10 z-20">
                    <div className="glass-panel p-8 rounded-[40px] border border-white/10 backdrop-blur-xl max-w-lg">
                        <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">Your future is <br /> our mission.</h2>
                        <p className="text-slate-300 font-medium leading-relaxed italic opacity-90">
                            "Empowering teen moms and unemployed girls through blockchain-verified education and grants."
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side: Auth Form */}
            <div className="w-full lg:w-[55%] xl:w-[50%] flex flex-col h-screen overflow-y-auto">
                {/* Mobile/Small Screen Header */}
                <nav className="lg:hidden relative z-30 px-6 py-6 flex justify-between items-center w-full">
                    <div className="flex items-center gap-2 cursor-pointer transition-transform active:scale-95 h-8" onClick={() => navigate('/')}>
                        <img src="/images/logo.svg" alt="HerFuture Chain Logo" className="h-full w-auto" />
                    </div>
                    <button
                        onClick={() => navigate('/gate')}
                        className="flex items-center gap-2 text-slate-500 hover:text-white transition-all text-[10px] font-black tracking-widest uppercase group bg-white/5 px-4 py-2 rounded-xl border border-white/5"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                        Gateway
                    </button>
                </nav>

                <div className="flex-grow flex items-center justify-center p-6 lg:p-16 relative">
                    {/* Desktop Escape Button */}
                    <button
                        onClick={() => navigate('/gate')}
                        className="hidden lg:flex absolute top-10 right-10 items-center gap-2 text-slate-500 hover:text-white transition-all text-[10px] font-black tracking-widest uppercase group bg-white/5 px-4 py-2 rounded-xl border border-white/5 opacity-50 hover:opacity-100"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                        Gateway
                    </button>

                    <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="text-center mb-10">
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-white mb-2">Welcome Back.</h1>
                            <p className="text-slate-400 text-sm max-w-xs mx-auto font-medium">
                                Step into the ecosystem. Access your dashboard and verify your growth.
                            </p>
                        </div>

                        <div className="glass-panel p-8 rounded-[40px] border border-white/5 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-indigo-500" />

                            <div className="flex gap-4 mb-8">
                                <button
                                    className={`flex-1 pb-4 text-xs uppercase tracking-widest font-black transition-all duration-300 border-b-2 ${!isLogin ? 'border-brand-500 text-white' : 'border-transparent text-slate-600 hover:text-slate-400'}`}
                                    onClick={() => { setIsLogin(false); setStep('phone'); }}
                                >
                                    Sign Up
                                </button>
                                <button
                                    className={`flex-1 pb-4 text-xs uppercase tracking-widest font-black transition-all duration-300 border-b-2 ${isLogin ? 'border-brand-500 text-white' : 'border-transparent text-slate-600 hover:text-slate-400'}`}
                                    onClick={() => { setIsLogin(true); setStep('phone'); }}
                                >
                                    Log In
                                </button>
                            </div>

                            <form onSubmit={step === 'phone' ? handlePhoneSubmit : handleOTPSubmit} className="space-y-6">
                                {error && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] text-center font-black uppercase tracking-wider">
                                        {error}
                                    </div>
                                )}

                                {step === 'phone' ? (
                                    <>
                                        {!isLogin && (
                                            <div className="flex gap-4">
                                                <div className="flex-1 space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">First Name</label>
                                                    <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600 group-focus-within:text-brand-400 transition-colors">
                                                            <User className="h-4 w-4" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            required
                                                            name="firstName"
                                                            value={formData.firstName}
                                                            onChange={handleInputChange}
                                                            className="interface-input pl-10 block w-full rounded-2xl"
                                                            placeholder="Jane"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex-1 space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
                                                    <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600 group-focus-within:text-brand-400 transition-colors">
                                                            <User className="h-4 w-4" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            required
                                                            name="lastName"
                                                            value={formData.lastName}
                                                            onChange={handleInputChange}
                                                            className="interface-input pl-10 block w-full rounded-2xl"
                                                            placeholder="Doe"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600 group-focus-within:text-brand-400 transition-colors">
                                                    <Phone className="h-4 w-4" />
                                                </div>
                                                <input
                                                    type="tel"
                                                    required
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="interface-input pl-10 block w-full rounded-2xl"
                                                    placeholder="+234 801 234 5678"
                                                />
                                            </div>
                                            <p className="text-[9px] text-slate-500 mt-2 px-1 leading-relaxed italic">
                                                * This maps your mobile identity to a secure blockchain vault.
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Verification Code</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600 group-focus-within:text-brand-400 transition-colors">
                                                <MessageSquare className="h-4 w-4" />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                name="otp"
                                                maxLength="6"
                                                value={formData.otp}
                                                onChange={handleInputChange}
                                                className="interface-input pl-10 block w-full text-center tracking-[1em] text-lg font-black rounded-2xl"
                                                placeholder="000000"
                                            />
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-400 text-white font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] flex justify-center items-center gap-2 group active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            {step === 'phone' ? 'Continue' : (isLogin ? 'Access Dashboard' : 'Explore Portals')}
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>

                            {!isLogin && step === 'phone' && (
                                <p className="mt-8 text-[9px] text-center text-slate-600 uppercase font-black tracking-[0.1em] leading-relaxed border-t border-white/5 pt-6">
                                    Powered by <span className="text-celo">Celo Mainnet</span> Layer 2 Protocol.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div >
    );
}
