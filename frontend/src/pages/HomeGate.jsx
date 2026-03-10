import { useNavigate } from 'react-router-dom';
import { User, Cpu, ArrowRight, Heart, Handshake, Globe, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function HomeGate() {
    const navigate = useNavigate();

    const partners = [
        "Gigimobile Tech",
        "Empower Afriq Foundation",
        "Yunometa",
        "India Blockchain Alliance",
        "GWBA",
        "Credentia"
    ];

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#060914] text-slate-900 dark:text-slate-100 font-sans overflow-x-hidden relative transition-colors duration-300">
            {/* Ambient Background */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

            <nav className="relative z-50 px-6 py-8 flex justify-between items-center w-full max-w-7xl mx-auto">
                <div className="flex items-center gap-2 cursor-pointer transition-transform active:scale-95 h-12" onClick={() => navigate('/')}>
                    <img src="/images/logo.svg" alt="HerFuture Chain Logo" className="h-full w-auto hidden dark:block" />
                    <img src="/images/logo.svg" alt="HerFuture Chain Logo" className="h-full w-auto block dark:hidden invert" />
                </div>

                {/* Navigation Menu */}
                <div className="flex flex-col items-end gap-2 md:flex-row md:items-center md:gap-8">
                    <button
                        onClick={() => navigate('/impact')}
                        className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all active:scale-95 text-right w-full"
                    >
                        Impact <br /> & Audit
                    </button>
                    <button
                        onClick={() => navigate('/admin')}
                        className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all active:scale-95 text-right w-full"
                    >
                        Management Hub
                    </button>
                </div>

                {/* Mobile Menu Toggle - Simplified/Removed as per request for visibility */}

            </nav>

            <div className="flex-grow flex flex-col items-center justify-center px-6 py-12 relative z-10">
                <div className="max-w-6xl w-full text-center mb-16 px-4">
                    <h1 className="text-3xl sm:text-4xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter leading-tight md:whitespace-nowrap">
                        Choose Your <span className="bg-gradient-to-r from-brand-400 via-emerald-400 to-brand-400 bg-clip-text text-transparent">Journey.</span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl mb-24">
                    {/* Student Pathway */}
                    <div
                        onClick={() => navigate('/students')}
                        className="group relative glass-panel rounded-[48px] border border-white/5 hover:border-brand-500/30 transition-all duration-700 cursor-pointer overflow-hidden flex flex-col h-[500px] active:scale-[0.98]"
                    >
                        <img
                            src="/images/student_gate.png"
                            alt="Student Empowerment"
                            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#060914] via-[#060914]/40 to-transparent" />

                        <div className="relative mt-auto p-10">
                            <div className="mb-6 w-16 h-16 rounded-2xl bg-brand-500/20 border border-brand-500/30 backdrop-blur-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                                <User className="w-8 h-8 text-brand-400" />
                            </div>

                            <h2 className="text-4xl font-black mb-3 text-white">I am a Student</h2>
                            <p className="text-white md:text-slate-200 text-lg leading-relaxed mb-8 font-medium">
                                Build digital skills, earn rewards, and secure your future.
                            </p>

                            <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-brand-400 group-hover:text-white transition-colors">
                                START LEARNING <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                            </div>
                        </div>
                    </div>

                    {/* Ecosystem Pathway */}
                    <div
                        onClick={() => navigate('/tech')}
                        className="group relative glass-panel rounded-[48px] border border-white/5 hover:border-indigo-500/30 transition-all duration-700 cursor-pointer overflow-hidden flex flex-col h-[500px] active:scale-[0.98]"
                    >
                        <img
                            src="/images/tech_gate.png"
                            alt="Ecosystem Collaboration"
                            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#060914] via-[#060914]/40 to-transparent" />

                        <div className="relative mt-auto p-10">
                            <div className="mb-6 w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 backdrop-blur-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                                <Globe className="w-8 h-8 text-indigo-400" />
                            </div>

                            <h2 className="text-4xl font-black mb-3 text-white">Join our Ecosystem</h2>
                            <p className="text-white md:text-slate-200 text-lg leading-relaxed mb-8 font-medium">
                                Partner with us, fork the protocol, or donate to accelerate impact.
                            </p>

                            <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-indigo-400 group-hover:text-white transition-colors">
                                JOIN THE MOVEMENT <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Partner Slider */}
                <div className="w-full max-w-7xl overflow-hidden py-12 border-t border-white/5 relative">
                    <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-10">TRUSTED BY OUR GLOBAL PARTNERS</p>

                    {/* Gradient fade on edges for smooth scrolling effect */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-r from-slate-50 dark:from-[#060914] to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-l from-slate-50 dark:from-[#060914] to-transparent z-10 pointer-events-none" />

                    <div className="flex gap-8 md:gap-12 items-center w-max animate-infinite-scroll pl-4 md:pl-0">
                        {[...partners, ...partners].map((partner, i) => (
                            <div key={i} className="flex-shrink-0 text-sm md:text-lg font-bold text-slate-500 hover:text-white transition-colors cursor-default md:px-8 whitespace-nowrap">
                                {partner}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <footer className="relative z-30 py-12 text-center border-t border-white/5">
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">
                    HERFUTURE CHAIN © 2026 • BUILT FOR IMPACT
                </p>
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-infinite-scroll {
                    animation: scroll 20s linear infinite;
                }
                @media (max-width: 768px) {
                    .animate-infinite-scroll {
                        animation: scroll 12s linear infinite;
                    }
                }
                .animate-infinite-scroll:hover {
                    animation-play-state: paused;
                }
            `}} />
        </div>
    );
}
