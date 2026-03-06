import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { User, Activity, LayoutGrid, ArrowRight, ShieldCheck, Phone, Link2 } from 'lucide-react';

export default function Gateway() {
    const navigate = useNavigate();

    const portals = [
        {
            title: "Student Portal",
            hook: "Learn digital skills. Earn milestone grants. Build your future.",
            icon: <User className="w-6 h-6 text-emerald-400" />,
            action: "ENTER PORTAL",
            link: "/signup",
            color: "emerald",
            metric: "Graduates: 1,200+"
        },
        {
            title: "Impact & Audit",
            hook: (
                <>
                    Real-time transparency. Every Dollar. Every Girl. Every Step.
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
            action: "VIEW IMPACT",
            link: "/impact",
            color: "amber",
            metric: "Total Distributed: $12,450"
        },
        {
            title: "Management Hub",
            hook: "Control the curriculum. Manage the chain. Scale the impact.",
            icon: <LayoutGrid className="w-6 h-6 text-purple-400" />,
            action: "MANAGE PLATFORM",
            link: "/admin",
            color: "purple",
            metric: "Online: 154 Students"
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-[#0A0F1C] text-slate-100 font-sans overflow-x-hidden">
            <div className="flex-grow flex flex-col relative">
                {/* Hero Background */}
                <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-brand-600/10 to-transparent pointer-events-none" />
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-600/10 blur-[120px] pointer-events-none" />
                <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />

                <div className="max-w-6xl mx-auto px-6 pt-20 pb-32 relative z-10">
                    {/* Header */}
                    <div className="text-center mb-20 animate-in fade-in slide-in-from-top-4 duration-1000">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 mb-6 backdrop-blur-sm">
                            <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">Mainnet Beta Gateway</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
                            HerFuture <span className="bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent underline decoration-brand-500/30">Chain</span>
                        </h1>
                        <p className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed">
                            The world's first decentralized socio-economic engine for high-potential teen mothers.
                        </p>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        {portals.map((portal, idx) => (
                            <div
                                key={idx}
                                onClick={() => navigate(portal.link)}
                                className="group glass-panel p-8 rounded-[40px] border border-white/5 hover:border-white/10 transition-all duration-500 cursor-pointer flex flex-col h-full relative overflow-hidden"
                            >
                                {/* Hover Gradient */}
                                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${portal.color === 'emerald' ? 'from-emerald-500/0 via-emerald-500/40 to-emerald-500/0' :
                                    portal.color === 'amber' ? 'from-amber-500/0 via-amber-500/40 to-amber-500/0' :
                                        'from-purple-500/0 via-purple-500/40 to-purple-500/0'
                                    } opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                                <div className={`w-14 h-14 rounded-2xl mb-8 flex items-center justify-center bg-slate-900/80 border border-white/5 shadow-inner`}>
                                    {portal.icon}
                                </div>

                                <h3 className="text-2xl font-bold mb-3 text-white group-hover:translate-x-1 transition-transform">{portal.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-grow">
                                    {portal.hook}
                                </p>

                                {portal.metric && (
                                    <div className="mb-6 px-4 py-2 rounded-xl bg-white/5 border border-white/5 inline-flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${portal.color === 'amber' ? 'bg-amber-400' : 'bg-purple-400'} animate-pulse`} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">{portal.metric}</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-white transition-colors">
                                    {portal.action} <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        ))}
                    </div>


                    {/* Tech Showcase */}
                    <div className="max-w-4xl mx-auto glass-panel p-12 rounded-[50px] border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                            <Phone className="w-48 h-48 rotate-12" />
                        </div>

                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-bold mb-6">Why Phone Numbers?</h2>
                                <p className="text-slate-400 mb-8 leading-relaxed">
                                    Traditional crypto is too complex for unbanked teen mothers. We map their daily mobile identity to a secure blockchain vault.
                                </p>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl w-fit">
                                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                        <span className="text-xs font-bold text-emerald-400">CELO SOCIAL CONNECT</span>
                                    </div>
                                    <div className="flex items-center gap-4 bg-brand-500/10 border border-brand-500/20 p-3 rounded-2xl w-fit">
                                        <Link2 className="w-5 h-5 text-brand-400" />
                                        <span className="text-xs font-bold text-brand-400">ON-CHAIN IDENTITY MAPPING</span>
                                    </div>
                                </div>
                            </div>

                            {/* Visual Flow */}
                            <div className="flex flex-col gap-4 items-center md:items-end">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center shadow-2xl relative">
                                        <Phone className="w-8 h-8 text-slate-400" />
                                        <div className="absolute inset-0 bg-brand-500/10 filter blur-xl" />
                                    </div>
                                    <div className="h-[2px] w-8 bg-gradient-to-r from-slate-700 to-brand-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                                    <div className="w-20 h-20 rounded-3xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                                        <ShieldCheck className="w-10 h-10 text-brand-400" />
                                    </div>
                                    <div className="h-[2px] w-8 bg-gradient-to-r from-brand-500 to-slate-700 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center shadow-2xl relative">
                                        <Link2 className="w-8 h-8 text-slate-400" />
                                    </div>
                                </div>
                                <div className="mt-4 text-center md:text-right">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Zero-Friction Onboarding</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
