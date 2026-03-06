import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { User, Activity, LayoutGrid, ArrowRight } from 'lucide-react';

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
            {/* Header Nav */}
            <nav className="relative z-30 px-6 py-6 flex justify-between items-center bg-transparent w-full max-w-7xl mx-auto">
                <div className="flex items-center gap-2 cursor-pointer transition-transform active:scale-95" onClick={() => navigate('/')}>
                    <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center font-black text-white italic">H</div>
                    <span className="font-bold tracking-tight text-white uppercase tracking-widest text-sm hidden sm:block">HerFuture</span>
                </div>
            </nav>

            <div className="flex-grow flex flex-col relative">
                {/* Hero Background */}
                <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-brand-600/10 to-transparent pointer-events-none" />
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-600/10 blur-[120px] pointer-events-none" />
                <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />

                <div className="max-w-6xl mx-auto px-6 pt-10 pb-32 relative z-10">
                    {/* Header */}
                    <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 mb-6 backdrop-blur-sm">
                            <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">Mainnet Beta Gateway</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter">
                            Select Your <span className="bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">Pathway.</span>
                        </h1>
                        <p className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed font-medium">
                            Empowering teen mothers, out-of-school girls and unemployed girls through blockchain-verified education and grants.
                        </p>
                    </div>

                    {/* High Fidelity Visual Banner */}
                    <div className="mb-20 relative p-1 pb-0 glass-panel rounded-[48px] border border-white/10 overflow-hidden shadow-2xl group">
                        <img
                            src="/images/banner.png"
                            alt="Empowerment Hub"
                            className="w-full h-[380px] object-cover rounded-[44px] transition-transform duration-[2000ms] group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C] via-[#0A0F1C]/10 to-transparent" />
                        <div className="absolute bottom-10 left-10 md:left-16 max-w-lg">
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tighter">The Future is Verified.</h2>
                            <p className="text-slate-300 text-sm md:text-base font-medium opacity-90 leading-relaxed">Bridging the gap for teen mothers, out-of-school girls and unemployed girls.</p>
                        </div>
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
                </div>
            </div>

            <Footer />
        </div>
    );
}
