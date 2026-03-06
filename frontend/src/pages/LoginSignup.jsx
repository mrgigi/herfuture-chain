import { useState } from 'react';
import { ArrowRight, Wallet, ShieldCheck, Phone, User, MessageSquare, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
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
        <div className="flex flex-col min-h-screen bg-[#0A0F1C] overflow-x-hidden">
            <div className="flex-grow flex items-center justify-center p-4 relative">
                {/* Background Orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-600/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />

                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-bold tracking-widest uppercase group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Gateway
                </button>

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
                                onClick={() => { setIsLogin(false); setStep('phone'); }}
                            >
                                Sign Up
                            </button>
                            <button
                                className={`flex-1 pb-3 text-sm font-medium transition-all duration-300 border-b-2 ${isLogin ? 'border-brand-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                                onClick={() => { setIsLogin(true); setStep('phone'); }}
                            >
                                Log In
                            </button>
                        </div>

                        <form onSubmit={step === 'phone' ? handlePhoneSubmit : handleOTPSubmit} className="space-y-5">
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center font-medium">
                                    {error}
                                </div>
                            )}

                            {step === 'phone' ? (
                                <>
                                    {!isLogin && (
                                        <div className="flex gap-4">
                                            <div className="flex-1 space-y-1">
                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">First Name</label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
                                                        <User className="h-5 w-5" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        required
                                                        name="firstName"
                                                        value={formData.firstName}
                                                        onChange={handleInputChange}
                                                        className="interface-input pl-10 block w-full"
                                                        placeholder="Jane"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Last Name</label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
                                                        <User className="h-5 w-5" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        required
                                                        name="lastName"
                                                        value={formData.lastName}
                                                        onChange={handleInputChange}
                                                        className="interface-input pl-10 block w-full"
                                                        placeholder="Doe"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Phone Number</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
                                                <Phone className="h-5 w-5" />
                                            </div>
                                            <input
                                                type="tel"
                                                required
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="interface-input pl-10 block w-full"
                                                placeholder="+234 801 234 5678"
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-2 ml-1 leading-relaxed">
                                            <strong>Why Phone Numbers?</strong> We map your daily mobile identity to a secure blockchain vault, making Web3 accessible without complex crypto keys.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Verification Code</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
                                            <MessageSquare className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            name="otp"
                                            maxLength="6"
                                            value={formData.otp}
                                            onChange={handleInputChange}
                                            className="interface-input pl-10 block w-full text-center tracking-[1em] text-lg font-bold"
                                            placeholder="000000"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 text-center mt-2">
                                        Enter 000000 to bypass verification during testing.
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {loading ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {step === 'phone' ? 'Send Code' : (isLogin ? 'Access Dashboard' : 'Join HerFuture')}
                                        {step === 'phone' && <ArrowRight className="w-4 h-4" />}
                                        {step === 'otp' && !isLogin && <Wallet className="w-4 h-4" />}
                                        {step === 'otp' && isLogin && <ArrowRight className="w-4 h-4" />}
                                    </>
                                )}
                            </button>
                        </form>

                        {!isLogin && step === 'phone' && (
                            <p className="mt-6 text-[10px] text-center text-slate-500 uppercase tracking-widest leading-relaxed">
                                Secured by <span className="text-brand-400">Layer 2 Celo Blockchain</span>.
                                <br />
                                Your Identity is Decentralized.
                            </p>
                        )}
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
}
