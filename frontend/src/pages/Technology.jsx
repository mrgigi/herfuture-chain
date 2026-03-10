import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import {
    ArrowRight,
    ShieldCheck,
    Zap,
    Globe,
    Cpu,
    Github,
    Database,
    Lock,
    Terminal,
    Code2,
    Layers,
    Share2,
    GitFork,
    ExternalLink,
    Mail,
    Copy,
    Menu,
    X,
    Handshake,
    Heart,
    Users,
    Coins,
    BarChart3
} from 'lucide-react';

import ThemeToggle from '../components/ThemeToggle';

export default function Technology() {
    const navigate = useNavigate();
    const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#060914] text-slate-800 dark:text-slate-100 font-sans selection:bg-brand-500/30 overflow-x-hidden transition-colors duration-300">
            {/* Top Navigation */}
            <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/80 dark:bg-[#060914]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 transition-colors duration-300">
                <div className="flex items-center gap-2 cursor-pointer h-10" onClick={() => navigate('/')}>
                    <img src="/images/logo.svg" alt="HerFuture Chain Logo" className="h-full w-auto hidden dark:block" />
                    <img src="/images/logo.svg" alt="HerFuture Chain Logo" className="h-full w-auto block dark:hidden invert" />
                </div>

                <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    <a href="#ecosystem" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">Ecosystem</a>
                    <a href="#infrastructure" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">Protocol</a>
                    <a href="#partnership" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">Partnership</a>
                    <a href="#donate" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">Donate</a>
                </div>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <button
                        onClick={() => setIsPartnerModalOpen(true)}
                        className="hidden sm:block px-6 py-2 rounded-xl bg-slate-900 dark:bg-brand-500 hover:bg-brand-600 dark:hover:bg-brand-400 text-white text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl"
                    >
                        PARTNER WITH US
                    </button>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-900 dark:text-white hover:bg-white/5 rounded-lg transition-all active:scale-95"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

            </nav>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 bg-white/95 dark:bg-[#060914]/98 backdrop-blur-3xl z-[999] p-8 md:hidden animate-in fade-in duration-200 flex flex-col">
                    <div className="flex justify-end w-full mb-12">
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="p-3 text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
                        >
                            <X className="w-8 h-8" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-8 text-center w-full max-w-xs mx-auto flex-1 justify-center pb-20">
                        {[
                            { label: 'Ecosystem', href: '#ecosystem' },
                            { label: 'Protocol', href: '#infrastructure' },
                            { label: 'Partnership', href: '#partnership' },
                            { label: 'Donate', href: '#donate' }
                        ].map((item, i) => (
                            <a
                                key={i}
                                href={item.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] hover:text-brand-600 dark:hover:text-brand-400 transition-all active:scale-95 py-2"
                            >
                                {item.label}
                            </a>
                        ))}
                        <button
                            onClick={() => { setIsPartnerModalOpen(true); setIsMenuOpen(false); }}
                            className="w-full mt-6 px-8 sm:px-12 py-5 rounded-2xl bg-brand-600 text-white font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-brand-600/20 active:scale-95 transition-all"
                        >
                            PARTNER NOW →
                        </button>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section className="relative pt-44 pb-32 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-brand-500/10 dark:bg-brand-600/10 rounded-full blur-[120px] pointer-events-none z-0 transition-colors" />

                <div className="max-w-5xl mx-auto relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 mb-8">
                        <Globe className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">Global Inclusion Protocol</span>
                    </div>

                    <h1 className="text-5xl sm:text-7xl md:text-9xl font-black mb-8 tracking-tighter leading-[0.85] text-slate-900 dark:text-white uppercase italic">
                        The Ecosystem <br />
                        <span className="bg-gradient-to-r from-brand-600 via-brand-400 to-fuchsia-400 bg-clip-text text-transparent">of Impact.</span>
                    </h1>

                    <p className="text-slate-600 dark:text-slate-400 text-xl md:text-2xl font-medium leading-relaxed mb-12 max-w-3xl mx-auto">
                        A decentralized movement of <span className="text-slate-900 dark:text-white font-bold">developers</span>, <span className="text-slate-900 dark:text-white font-bold">partners</span>, and <span className="text-slate-900 dark:text-white font-bold">donors</span> building the future of financial inclusion.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={() => setIsPartnerModalOpen(true)}
                            className="group px-8 py-5 rounded-2xl bg-slate-900 dark:bg-brand-500 text-white dark:text-white font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-brand-600 dark:hover:bg-brand-400 transition-all shadow-2xl shadow-brand-500/20"
                        >
                            Become a Partner <Handshake className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <a
                            href="#donate"
                            className="px-8 py-5 rounded-2xl bg-white dark:bg-emerald-500/10 border border-slate-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-widest hover:bg-emerald-50 dark:hover:bg-emerald-500/20 transition-all backdrop-blur-md shadow-sm dark:shadow-none"
                        >
                            Support the Cause — $
                        </a>
                    </div>
                </div>
            </section>

            {/* Core Pillars */}
            <section id="ecosystem" className="py-32 px-6 bg-slate-50/50 dark:bg-white/[0.01] transition-colors">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-black mb-20 text-slate-900 dark:text-white uppercase italic">Three Pillars of Growth.</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Cpu className="w-10 h-10 text-brand-600 dark:text-brand-400" />,
                                title: "Infrastructure",
                                desc: "Open-source smart contracts and verifiable identity protocols built on secure blockchain technology.",
                                link: "#infrastructure",
                                cta: "Explore Tech"
                            },
                            {
                                icon: <Users className="w-10 h-10 text-brand-500 dark:text-brand-400" />,
                                title: "Partnership",
                                desc: "NGOs, governments, and corporations scaling impact through white-label deployment.",
                                link: "#partnership",
                                cta: "View Hub"
                            },
                            {
                                icon: <Coins className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />,
                                title: "Donation",
                                desc: "Transparent, cryptographically verified milestone-based grants for students.",
                                link: "#donate",
                                cta: "Donate Now"
                            }
                        ].map((pillar, i) => (
                            <div key={i} className="glass-panel bg-white dark:bg-transparent p-10 rounded-[40px] border border-slate-200 dark:border-white/5 hover:border-brand-500/30 dark:hover:border-white/10 transition-all text-left flex flex-col group shadow-lg dark:shadow-none">
                                <div className="mb-8 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl w-fit group-hover:scale-110 transition-transform">{pillar.icon}</div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">{pillar.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-10 flex-grow font-medium">{pillar.desc}</p>
                                <a href={pillar.link} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-white transition-colors">
                                    {pillar.cta} <ArrowRight className="w-3 h-3" />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Protocol Infrastructure */}
            <section id="infrastructure" className="py-32 px-6 border-y border-slate-200 dark:border-white/5 bg-white dark:bg-transparent transition-colors">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
                    <div className="lg:w-1/2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-brand-500/10 border border-brand-500/20 mb-8">
                            <Terminal className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">For Developers</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight text-slate-900 dark:text-white uppercase italic">Fork the Protocol. <br /> Own the Impact.</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 leading-relaxed italic font-medium">
                            "Transparency is not a feature; it's the foundation."
                        </p>
                        <div className="space-y-6">
                            {[
                                "EVM-compatible Mainnet Node Access",
                                "Decentralized ID (DID) for every learner",
                                "Immutable audit trail of grant distribution",
                                "Open APIs for NGO integration"
                            ].map((feat, i) => (
                                <div key={i} className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                                    <div className="p-1 bg-brand-500/10 dark:bg-indigo-500/20 rounded">
                                        <Zap className="w-3 h-3 text-brand-600 dark:text-indigo-400" />
                                    </div>
                                    <span className="font-black text-[10px] tracking-widest uppercase">{feat}</span>
                                </div>
                            ))}
                        </div>
                        <a
                            href="https://github.com/mrgigi/herfuture-chain"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex px-8 py-4 rounded-xl bg-slate-900 dark:bg-white/5 border border-slate-900 dark:border-white/10 hover:bg-brand-600 dark:hover:bg-white/10 text-white dark:text-white transition-all mt-12 text-[10px] font-black uppercase tracking-widest gap-3 items-center shadow-xl dark:shadow-none"
                        >
                            <Github className="w-4 h-4" /> REPOSITORY ACCESS
                        </a>
                    </div>
                    <div className="lg:w-1/2 relative">
                        <img src="/images/tech_ecosystem_african.png" alt="African Tech Collaboration" className="rounded-[40px] opacity-80 filter brightness-75 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent pointer-events-none rounded-[40px]" />
                    </div>
                </div>
            </section>

            {/* Partnership Section */}
            <section id="partnership" className="py-32 px-6 bg-slate-100/50 dark:bg-slate-900/10 transition-colors">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-6xl font-black mb-12 italic uppercase text-slate-900 dark:text-white">Join the Movement.</h2>
                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-16 max-w-3xl mx-auto font-medium">
                        Whether you're a local NGO in Lagos or a global development agency, our white-label infrastructure allows you to deploy verifiable aid programs in weeks, not years.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        <div className="p-10 rounded-[40px] bg-white dark:bg-indigo-500/5 border border-slate-200 dark:border-indigo-500/10 shadow-lg dark:shadow-none">
                            <Handshake className="text-brand-600 dark:text-indigo-400 w-10 h-10 mb-6" />
                            <h4 className="text-xl font-black mb-4 uppercase text-[10px] tracking-[0.2em] text-slate-900 dark:text-white">Strategic Alliances</h4>
                            <p className="text-slate-500 dark:text-slate-500 text-sm leading-relaxed font-medium">Combine resources and expertise to scale our learning path to new regions and demographics.</p>
                        </div>
                        <div className="p-10 rounded-[40px] bg-white dark:bg-purple-500/5 border border-slate-200 dark:border-purple-500/10 shadow-lg dark:shadow-none">
                            <Layers className="text-fuchsia-600 dark:text-purple-400 w-10 h-10 mb-6" />
                            <h4 className="text-xl font-black mb-4 uppercase text-[10px] tracking-[0.2em] text-slate-900 dark:text-white">Implementation Partners</h4>
                            <p className="text-slate-500 dark:text-slate-500 text-sm leading-relaxed font-medium">License our platform to manage your own cohorts of learners with absolute transparency.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Donation Section */}
            <section id="donate" className="py-32 px-6 bg-brand-500 relative overflow-hidden transition-colors">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
                <div className="max-w-5xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-20">
                    <div className="lg:w-1/2">
                        <h2 className="text-white dark:text-[#060914] text-5xl md:text-7xl font-black tracking-tighter leading-none mb-8 uppercase italic">Direct <br /> Impact.</h2>
                        <p className="text-white dark:text-[#060914] text-xl font-black mb-10 leading-relaxed opacity-80 uppercase tracking-tight">
                            Every dollar you donate is locked in a smart contract and released only when a student verifies her learning milestone. No middleman. No leakage.
                        </p>
                        <div className="flex gap-4">
                            <div className="bg-[#060914] dark:bg-[#060914]/50 backdrop-blur-md text-white p-6 rounded-3xl flex-1 text-center shadow-2xl">
                                <div className="text-3xl font-black mb-1">$1,200</div>
                                <div className="text-[10px] uppercase font-black opacity-50 tracking-[0.2em]">Sponsor a Learner</div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-md text-[#060914] dark:text-[#060914]/80 p-6 rounded-3xl flex-1 text-center border border-white/30">
                                <div className="text-3xl font-black mb-1">100%</div>
                                <div className="text-[10px] uppercase font-black opacity-70 tracking-[0.2em]">Transparency</div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:w-1/2 bg-[#060914] dark:bg-[#060914]/80 backdrop-blur-xl p-10 rounded-[50px] shadow-2xl border border-white/5">
                        <h3 className="text-2xl font-black mb-8 text-white flex items-center gap-3 uppercase italic tracking-tight">
                            <Heart className="text-red-500 fill-red-500 w-6 h-6" /> Support the Cause
                        </h3>
                        <div className="space-y-4 mb-8">
                            {[10, 50, 100, 500].map((amt) => (
                                <button key={amt} className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black transition-all active:scale-95 uppercase tracking-widest text-xs">
                                    DONATE ${amt}
                                </button>
                            ))}
                            <button className="w-full py-4 rounded-2xl bg-brand-500 text-white font-black uppercase tracking-widest text-xs active:scale-95 transition-all shadow-xl shadow-brand-500/20">Custom Amount</button>
                        </div>
                        <p className="text-slate-500 text-[10px] text-center uppercase tracking-[0.2em] font-black">Payments processed via CUSO / Credit Card</p>
                    </div>
                </div>
            </section>

            <Footer />

            {/* Partner Modal */}
            {isPartnerModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 dark:bg-[#060914]/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="relative w-full max-w-lg glass-panel bg-white dark:bg-transparent p-8 md:p-12 rounded-[50px] border border-slate-200 dark:border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setIsPartnerModalOpen(false)}
                            className="absolute top-8 right-8 p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all font-black"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-8 text-center flex flex-col items-center">
                            <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 flex items-center justify-center mb-6">
                                <Handshake className="w-8 h-8 text-brand-600 dark:text-brand-400" />
                            </div>
                            <h3 className="text-3xl font-black mb-4 text-slate-900 dark:text-white uppercase italic tracking-tight">Ecosystem Partner.</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
                                Join our mission to build decentralized socio-economic infrastructure. We are looking for development agencies, workforce partners, and employers.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-brand-50 dark:bg-brand-500/10 rounded-xl">
                                        <Mail className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Ecosystem Contact</div>
                                        <div className="text-sm font-bold text-slate-900 dark:text-white selection:bg-brand-500/50">herfuturechain@gmail.com</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText('herfuturechain@gmail.com');
                                        alert('Email copied to clipboard!');
                                    }}
                                    className="p-3 text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-xl transition-all active:scale-95"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => window.location.href = 'mailto:herfuturechain@gmail.com'}
                            className="w-full py-5 mt-8 rounded-2xl bg-brand-500 hover:bg-brand-400 text-white font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-brand-500/20"
                        >
                            Start Conversation
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
