import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import {
    ArrowRight,
    ShieldCheck,
    Zap,
    Globe,
    Users,
    LineChart,
    ArrowUpRight,
    CheckCircle2,
    Smartphone,
    Database,
    ChevronDown,
    Activity,
    User,
    LayoutGrid,
    Briefcase,
    Heart,
    Lock,
    Cpu,
    Github,
    Handshake,
    Mail,
    Copy,
    Menu,
    X,
    AlertCircle
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function LandingPage() {
    const navigate = useNavigate();
    const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
    const [activeAccordionTrack, setActiveAccordionTrack] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const levelLessons = {
        T1: [
            "Self-Leadership & Confidence",
            "Mental Health & Emotional Resilience",
            "Hygiene, Health & Child Wellbeing",
            "Job Readiness & Interview Skills"
        ],
        T2: [
            "Digital Literacy & AI Tools",
            "Virtual Assistant Skills",
            "Content Creation & Social Media",
            "Graphic Design Basics",
            "Data Entry & AI-Assisted Work",
            "Freelancing & First Client"
        ],
        T3: [
            "Financial Literacy & Understanding Money",
            "Saving & Budgeting",
            "Investment Basics",
            "Branding, Marketing & Pricing",
            "Entrepreneurship & Small Business",
            "Managing Money & Long-Term Thinking"
        ]
    };

    const portals = [
        {
            title: "Student Portal",
            desc: "Learn high-demand digital skills and earn your future through milestone-based grants.",
            icon: <User className="w-6 h-6 text-emerald-400" />,
            link: "/signup",
            color: "emerald",
            tag: "OPEN ACCESS"
        },
        {
            title: "Impact & Audit",
            desc: (
                <>
                    Real-time transparency. Every grant is cryptographically verified.
                    <br />
                    <span
                        onClick={(e) => { e.stopPropagation(); navigate('/verify'); }}
                        className="mt-2 block font-bold text-white hover:text-brand-400 transition-colors cursor-pointer pointer-events-auto"
                    >
                        Are you an employer? Verify a student credential
                    </span>
                </>
            ),
            icon: <Activity className="w-6 h-6 text-amber-400" />,
            link: "/impact",
            color: "amber",
            tag: "FOR DONORS"
        },
        {
            title: "Management Hub",
            desc: "Control center for administrators to scale the learning path and manage global impact.",
            icon: <LayoutGrid className="w-6 h-6 text-purple-400" />,
            link: "/admin",
            color: "purple",
            tag: "ADMIN ONLY"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#060914] text-slate-800 dark:text-slate-100 font-sans selection:bg-brand-500/30 overflow-x-hidden transition-colors duration-300">
            {/* Top Navigation */}
            <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/80 dark:bg-[#060914]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 transition-colors duration-300">
                <div className="flex items-center gap-2 cursor-pointer h-10" onClick={() => navigate('/')}>
                    <img src="/images/logo.svg" alt="HerFuture Chain Logo" className="h-full w-auto hidden dark:block" />
                    <img src="/images/logo.svg" alt="HerFuture Chain Logo" className="h-full w-auto block dark:hidden invert" />
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    <a href="#problem" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">The Problem</a>
                    <a href="#solution" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">Our Solution</a>
                    <a href="#how-it-works" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">How it Works</a>
                    <a href="#impact" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">Impact & Audit</a>
                </div>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <button
                        onClick={() => navigate('/signup')}
                        className="hidden sm:block px-6 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    >
                        GET STARTED
                    </button>

                    <button
                        className="md:hidden p-2 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-white/5 rounded-lg transition-all active:scale-95"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className="fixed inset-0 bg-white/95 dark:bg-[#060914]/98 backdrop-blur-3xl z-[999] p-8 md:hidden animate-in fade-in duration-200 flex flex-col items-center justify-center">
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="absolute top-8 right-8 p-3 text-slate-500 dark:text-white/50 hover:text-slate-800 dark:hover:text-white transition-all active:scale-95"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <div className="flex flex-col gap-8 text-center w-full max-w-xs">
                            {[
                                { label: 'The Problem', href: '#problem' },
                                { label: 'Our Solution', href: '#solution' },
                                { label: 'How it Works', href: '#how-it-works' },
                                { label: 'Impact & Audit', href: '#impact' }
                            ].map((item, i) => (
                                <a
                                    key={i}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] hover:text-brand-500 dark:hover:text-brand-400 transition-all active:scale-95 py-2"
                                >
                                    {item.label}
                                </a>
                            ))}
                            <button
                                onClick={() => { navigate('/signup'); setIsMenuOpen(false); }}
                                className="w-full mt-6 px-12 py-5 rounded-2xl bg-brand-600 text-white font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-brand-600/20 active:scale-95 transition-all"
                            >
                                GET STARTED →
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="relative pt-44 pb-32 px-6 overflow-hidden">
                {/* High-Fidelity Cinematic Background */}
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                    <img
                        src="/images/hero.png"
                        alt="HerFuture Hub"
                        className="w-full h-full object-cover opacity-20 dark:opacity-30 transform scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-50/20 via-slate-50/10 dark:from-[#060914] dark:via-[#060914]/60 to-slate-50 dark:to-[#060914] z-10 transition-colors duration-300" />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-brand-300/30 dark:bg-brand-600/10 rounded-full blur-[120px] pointer-events-none z-20" />

                <div className="max-w-4xl mx-auto relative z-30 text-center">


                    <h1 className="text-5xl sm:text-7xl md:text-9xl font-black mb-8 tracking-tighter leading-[0.85] text-slate-900 dark:text-white animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        HerFuture <br />
                        <span className="bg-gradient-to-r from-emerald-500 via-brand-500 to-brand-500 dark:from-emerald-400 dark:via-brand-400 dark:to-brand-400 bg-clip-text text-transparent">Chain.</span>
                    </h1>

                    <p className="text-slate-600 dark:text-slate-400 text-xl md:text-2xl font-medium leading-relaxed mb-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        Open-source blockchain infrastructure for <span className="text-slate-900 dark:text-white font-bold">verifiable skills</span> and <span className="text-slate-900 dark:text-white font-bold">financial inclusion</span>.
                    </p>

                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm md:text-base mb-12 animate-in fade-in slide-in-from-bottom-7 duration-1000 font-medium leading-relaxed">
                        The world's first decentralized socio-economic engine for teen moms, out-of-school and unemployed girls.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <button
                            onClick={() => navigate('/signup')}
                            className="group px-8 py-5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-[#060914] font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-brand-500 hover:text-white transition-all active:scale-95 shadow-2xl shadow-brand-500/20"
                        >
                            Start Learning <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </button>
                        <button
                            onClick={() => setIsPartnerModalOpen(true)}
                            className="px-8 py-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-black text-xs uppercase tracking-widest hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-400 transition-all backdrop-blur-md"
                        >
                            Partner With Us
                        </button>
                    </div>
                </div>
            </section>

            {/* The Problem */}
            <section id="problem" className="py-32 px-6 border-y border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/10 transition-colors duration-300">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 mb-8">
                            <AlertCircle className="w-3 h-3 text-red-500 dark:text-red-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 dark:text-red-400">Exclusion Crisis</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight text-slate-900 dark:text-white">
                            Invisible Skills. <br />
                            Broken Futures.
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-10">
                            Millions of girls across Nigeria are excluded from education and employment due to poverty, early pregnancy, displacement, and lack of access to formal financial systems.
                        </p>

                        <div className="space-y-4">
                            {[
                                "No recognized certificates",
                                "Limited access to employment",
                                "Exclusion from financial systems",
                                "Lack of transparent support",
                                "No pathways to the digital economy"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 text-slate-500">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                                    <span className="text-sm font-semibold italic">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="glass-panel p-2 rounded-[40px] border border-white/5 relative group overflow-hidden">
                            <img
                                src="/images/community.png"
                                alt="Nigerian Digital Hub"
                                className="rounded-[38px] w-full aspect-square object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute inset-x-8 bottom-8 glass-panel p-6 rounded-3xl border border-white/10 backdrop-blur-xl translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                <h3 className="text-xl font-bold mb-2 italic">A Path Forward</h3>
                                <p className="text-slate-400 text-xs">Helping you build a life you love, right from your community.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Solution */}
            <section id="solution" className="py-32 px-6 relative overflow-hidden bg-white dark:bg-transparent transition-colors duration-300">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-300/20 dark:bg-brand-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-brand-100 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 mb-8">
                        <ShieldCheck className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">The Solution</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black mb-10 tracking-tight text-slate-900 dark:text-white leading-tight">
                        Integrated Identity, <br /> Education & Inclusion.
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-12">
                        HerFuture Chain provides open-source blockchain infrastructure built on <span className="text-emerald-600 dark:text-celo font-bold">Celo</span>. We enable teen moms, out-of-school and unemployed girls to build verified digital identities, earn credentials, and access transparent financial support.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                        {[
                            { icon: <Smartphone className="text-brand-600 dark:text-brand-400" />, title: "Secure Identity" },
                            { icon: <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" />, title: "Tamper-Proof" },
                            { icon: <LineChart className="text-indigo-600 dark:text-indigo-400" />, title: "Scalable Support" }
                        ].map((item, i) => (
                            <div key={i} className="glass-panel p-6 rounded-3xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex flex-col items-center shadow-lg dark:shadow-none">
                                <div className="mb-4">{item.icon}</div>
                                <span className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">{item.title}</span>
                            </div>
                        ))}
                    </div>

                    <div className="glass-panel p-2 rounded-[60px] bg-slate-100/50 dark:bg-transparent border border-slate-200 dark:border-white/10 max-w-3xl mx-auto shadow-[0_0_80px_rgba(16,185,129,0.1)] relative overflow-hidden">
                        <img
                            src="/images/blockchain.png"
                            alt="Blockchain Visual"
                            className="rounded-[58px] w-full object-cover h-[400px]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 dark:from-[#060914] via-transparent to-transparent opacity-60 dark:opacity-40" />
                    </div>
                </div>
            </section>

            {/* How It Works (Timeline Style) */}
            <section id="how-it-works" className="py-32 px-6 bg-slate-50 dark:bg-slate-900/10 transition-colors duration-300">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900 dark:text-white">The Success Loop</h2>
                        <p className="text-slate-500 uppercase tracking-widest text-[10px] font-black">Five Phases of Empowerment</p>
                    </div>

                    <div className="space-y-12">
                        {[
                            {
                                id: "01",
                                title: "Digital Identity",
                                subtitle: "Decentralized wallets for every user",
                                desc: "Each learner receives a decentralized digital identity. This allows them to build a permanent record of learning achievements, digital awards, and economic activity.",
                                icon: <Smartphone className="w-8 h-8" />
                            },
                            {
                                id: "02",
                                title: "Skills Development",
                                subtitle: "3 Levels + Wellbeing Strand",
                                desc: (
                                    <div className="space-y-4 text-left">
                                        <p>Comprehensive 6-month program covering 18 professional lessons and weekly wellbeing sessions:</p>
                                        <div className="grid grid-cols-1 gap-3 mt-4">
                                            {[
                                                { id: 'T1', label: 'Track 1', title: 'Foundations & Wellbeing' },
                                                { id: 'T2', label: 'Track 2', title: 'Income Skills' },
                                                { id: 'T3', label: 'Track 3', title: 'Money & Business' }
                                            ].map((track) => (
                                                <div key={track.id} className="overflow-hidden bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/5 text-left shadow-sm dark:shadow-none">
                                                    <button
                                                        onClick={() => setActiveAccordionTrack(activeAccordionTrack === track.id ? null : track.id)}
                                                        className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors group"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`text-[10px] font-black uppercase ${track.id === 'T1' ? 'text-brand-600 dark:text-brand-400' : track.id === 'T2' ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-500 dark:text-orange-400'}`}>
                                                                {track.id.replace('T', 'Level ')}
                                                            </div>
                                                            <div className="font-bold text-slate-800 dark:text-white text-sm">{track.title}</div>
                                                        </div>
                                                        <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-white transition-transform duration-300 ${activeAccordionTrack === track.id ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    <div className={`transition-all duration-300 ease-in-out ${activeAccordionTrack === track.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                                                        <div className="px-5 pb-5 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {levelLessons[track.id].map((lesson, lIdx) => (
                                                                <div key={lIdx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                                                    <div className={`w-1 h-1 rounded-full ${track.id === 'T1' ? 'text-brand-500 dark:text-brand-400 bg-current' : track.id === 'T2' ? 'text-emerald-500 dark:text-emerald-400 bg-current' : 'text-orange-500 dark:text-orange-400 bg-current'}`} />
                                                                    <span className="text-xs text-slate-600 dark:text-slate-300">{lesson}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ),
                                icon: <Cpu className="w-8 h-8" />
                            },
                            {
                                id: "03",
                                title: "Blockchain Credentials",
                                subtitle: "Globally verifiable achievements",
                                desc: "When learners complete courses, digital awards are issued on-chain. These are tamper-proof, globally verifiable, and portable across employers.",
                                icon: <ShieldCheck className="w-8 h-8" />
                            },
                            {
                                id: "04",
                                title: "Transparent Digital Rewards",
                                subtitle: "Rewards for reaching your goals",
                                desc: "Learners receive support through smart contracts. Rewards are automatically released when milestones are completed, ensuring transparency and reducing leakage.",
                                icon: <Database className="w-8 h-8" />
                            },
                            {
                                id: "05",
                                title: "Pathways to Income",
                                subtitle: "Upwork, Fiverr & Entrepreneurship",
                                desc: "Graduates gain access to digital marketplaces to launch micro-businesses or remote careers, transforming from students into active economic members.",
                                icon: <Briefcase className="w-8 h-8" />
                            }
                        ].map((step, i) => (
                            <div key={i} className="flex flex-col md:flex-row gap-12 items-center group">
                                <div className="text-7xl font-black text-slate-200 dark:text-white/5 opacity-80 dark:opacity-50 group-hover:text-brand-200 dark:group-hover:text-brand-500/10 transition-colors md:w-32">{step.id}</div>
                                <div className="flex-1 glass-panel bg-white/80 dark:bg-transparent p-10 rounded-[50px] border border-slate-200 dark:border-white/5 group-hover:border-brand-300 dark:group-hover:border-brand-500/20 transition-all shadow-xl dark:shadow-none">
                                    <div className="flex items-center gap-6 mb-6 text-left">
                                        <div className="p-4 bg-brand-100 dark:bg-brand-500/10 rounded-2xl text-brand-600 dark:text-brand-400">{step.icon}</div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{step.title}</h3>
                                            <p className="text-brand-600 dark:text-brand-500/70 text-[10px] uppercase font-black tracking-widest">{step.subtitle}</p>
                                        </div>
                                    </div>
                                    <div className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base text-left">
                                        {step.desc}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Who We Serve */}
            <section className="py-32 px-6 bg-white dark:bg-transparent transition-colors duration-300">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-20">
                    <div className="lg:w-1/3">
                        <h2 className="text-4xl font-black mb-8 leading-tight text-slate-900 dark:text-white">Who We <br /> Serve.</h2>
                        <p className="text-slate-600 dark:text-slate-500 text-sm leading-relaxed mb-8">
                            HerFuture Chain is designed for teen moms, out-of-school and unemployed girls who face significant barriers to education and employment.
                        </p>
                        <Heart className="w-12 h-12 text-pink-500/20 dark:text-pink-500/20 text-pink-500 opacity-50 dark:opacity-100" />
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            "Teen Moms",
                            "Out-of-school Girls",
                            "Internally Displaced (IDPs)",
                            "Conflict-Affected Youth",
                            "Unbanked Communities",
                            "Marginalized Minorities"
                        ].map((target, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-between group hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all cursor-default">
                                <span className="text-lg font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">{target}</span>
                                <ArrowUpRight className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-brand-500 dark:group-hover:text-brand-400" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Infrastructure Section */}
            <section className="py-32 px-6 border-y border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/10 transition-colors duration-300">
                <div className="max-w-6xl mx-auto text-center mb-20">
                    <h2 className="text-4xl font-black mb-6 text-slate-900 dark:text-white">Open Infrastructure.</h2>
                    <p className="text-slate-600 dark:text-slate-500 max-w-xl mx-auto">Designed for replication. Governments and NGOs can use our APIs to scale aid programs with zero leakage.</p>
                    <div className="flex justify-center gap-8 mt-12">
                        {[
                            { icon: <Lock className="text-slate-500 dark:text-slate-400" />, label: "Smart Contracts" },
                            { icon: <Cpu className="text-slate-500 dark:text-slate-400" />, label: "Frameworks" },
                            {
                                icon: <Github className="text-slate-500 dark:text-slate-400" />,
                                label: "Public Gits",
                                link: "https://github.com/mrgigi/herfuture-chain"
                            },
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center gap-3 group">
                                {item.link ? (
                                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-transparent text-slate-600 dark:text-slate-400 group-hover:bg-brand-50 dark:group-hover:bg-brand-500/10 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-all shadow-sm dark:shadow-none">
                                        {item.icon}
                                    </a>
                                ) : (
                                    <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-transparent text-slate-600 dark:text-slate-400 shadow-sm dark:shadow-none">{item.icon}</div>
                                )}
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-400 transition-colors">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Impact - The Stats Section */}
            <section id="impact" className="py-32 px-6 bg-brand-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                        <div>
                            <h2 className="text-white dark:text-[#060914] text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6">Pilot Outcomes.</h2>
                            <p className="text-white/80 dark:text-[#060914]/60 text-lg font-bold uppercase tracking-widest">Transforming teen moms and unemployed girls from students into active leaders</p>
                        </div>
                        <div className="bg-white dark:bg-[#060914] text-slate-800 dark:text-white/50 p-4 px-8 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-2xl">
                            Verified on <span className="text-emerald-500 dark:text-celo">Celo</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-white dark:text-[#060914]">
                        {[
                            { val: "200", label: "ID Onboarded" },
                            { val: "75%", label: "Completion Rate" },
                            { val: "60%", label: "Job Placement" },
                            { val: "100%", label: "Verifiable" }
                        ].map((stat, i) => (
                            <div key={i}>
                                <div className="text-7xl font-black tracking-tighter mb-2">{stat.val}</div>
                                <div className="text-xs uppercase font-black tracking-widest opacity-80 dark:opacity-60">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stakeholder Portals */}
            <section id="portals" className="py-32 px-6 bg-white dark:bg-transparent transition-colors duration-300">
                <div className="max-w-6xl mx-auto text-center mb-20">
                    <h2 className="text-4xl font-black mb-6 text-slate-900 dark:text-white">Enter the Chain.</h2>
                    <p className="text-slate-600 dark:text-slate-500 max-w-xl mx-auto">Choose your entry point into the ecosystem. Whether you are a student, a donor, or an administrator.</p>
                </div>

                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 text-left">
                    {portals.map((portal, idx) => (
                        <div
                            key={idx}
                            onClick={() => navigate('/')}
                            className="group relative glass-panel bg-slate-50 dark:bg-transparent p-10 rounded-[50px] border border-slate-200 dark:border-white/5 hover:border-brand-300 dark:hover:border-brand-500/30 transition-all duration-700 cursor-pointer overflow-hidden flex flex-col h-full shadow-lg dark:shadow-none"
                        >
                            <div className="mb-8 w-fit p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 group-hover:bg-brand-50 dark:group-hover:bg-brand-500/10 group-hover:border-brand-200 dark:group-hover:border-brand-500/20 transition-colors shadow-sm dark:shadow-none">
                                {portal.icon}
                            </div>
                            <div className="mb-4 inline-flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${portal.color === 'emerald' ? 'bg-emerald-500 dark:bg-emerald-400' : portal.color === 'amber' ? 'bg-amber-500 dark:bg-amber-400' : 'bg-purple-500 dark:bg-purple-400'} animate-pulse`} />
                                <span className="text-[10px] font-black tracking-widest uppercase text-slate-500">{portal.tag}</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">{portal.title}</h3>
                            <p className="text-slate-600 dark:text-slate-500 text-sm leading-relaxed mb-12 flex-grow">
                                {portal.desc}
                            </p>
                            <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-white transition-colors">
                                Enter Portal <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-44 px-6 relative overflow-hidden text-center bg-slate-50 dark:bg-transparent border-t border-slate-200 dark:border-transparent transition-colors duration-300">
                <h2 className="text-5xl md:text-7xl font-black mb-12 tracking-tight text-slate-900 dark:text-white">Join the Future <br /> of Learning & Work.</h2>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <button
                        onClick={() => navigate('/signup')}
                        className="px-12 py-6 rounded-3xl bg-brand-500 text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-brand-500/30 active:scale-95 transition-all"
                    >
                        Apply as a Learner
                    </button>
                    <button
                        onClick={() => setIsPartnerModalOpen(true)}
                        className="px-12 py-6 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-black uppercase tracking-widest text-xs hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm dark:shadow-none"
                    >
                        Partner With Us
                    </button>
                </div>
            </section>

            <Footer />

            {/* Partner Modal */}
            {isPartnerModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 dark:bg-[#060914]/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="relative w-full max-w-lg glass-panel bg-white dark:bg-transparent p-8 md:p-12 rounded-[50px] border border-slate-200 dark:border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setIsPartnerModalOpen(false)}
                            className="absolute top-8 right-8 p-2 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 flex items-center justify-center mb-6">
                                <Handshake className="w-8 h-8 text-brand-500 dark:text-brand-400" />
                            </div>
                            <h3 className="text-3xl font-black mb-4 text-slate-900 dark:text-white">Partner With Us</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                Join our mission to build decentralized socio-economic infrastructure. We are looking for development agencies, workforce partners, and employers.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-brand-100 dark:bg-brand-500/10 rounded-xl">
                                        <Mail className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Contact Email</div>
                                        <div className="text-sm font-bold text-slate-900 dark:text-white selection:bg-brand-500/50">aagencyltd@gmail.com</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText('aagencyltd@gmail.com');
                                        alert('Email copied to clipboard!');
                                    }}
                                    className="p-3 text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-xl transition-all active:scale-95"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => window.location.href = 'mailto:aagencyltd@gmail.com'}
                            className="w-full py-5 mt-8 rounded-2xl bg-brand-500 hover:bg-brand-400 text-white font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                        >
                            Send Email Now
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
