import { Handshake, Github } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
    const navigate = useNavigate();

    return (
        <footer className="py-20 px-6 border-t border-white/5 bg-[#060914]">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
                <div>
                    <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-6 h-6 rounded-md bg-brand-500 flex items-center justify-center font-black text-white italic text-[10px]">H</div>
                        <span className="font-bold tracking-tight text-white uppercase tracking-widest text-sm">HerFuture Chain</span>
                    </div>
                    <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                        Pioneering distributed socio-economic mobility for the girl child. Open-source, transparent, and built for impact.
                    </p>
                    <div className="flex gap-4 mt-8">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer">
                            <Handshake className="w-4 h-4" />
                        </div>
                        <a
                            href="https://github.com/mrgigi/herfuture-chain"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        >
                            <Github className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
                    <div>
                        <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-white mb-6">Ecosystem</h4>
                        <ul className="space-y-4 text-slate-500 text-sm font-medium">
                            <li onClick={() => navigate('/signup')} className="hover:text-brand-400 cursor-pointer transition-colors">Academy</li>
                            <li onClick={() => navigate('/impact')} className="hover:text-amber-400 cursor-pointer transition-colors">Impact Data</li>
                            <li className="hover:text-emerald-400 cursor-pointer transition-colors opacity-50">On-Chain Audit</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-white mb-6">Company</h4>
                        <ul className="space-y-4 text-slate-500 text-sm font-medium">
                            <li onClick={() => navigate('/')} className="hover:text-brand-400 cursor-pointer transition-colors">Manifesto</li>
                            <li onClick={() => navigate('/gate')} className="hover:text-brand-400 cursor-pointer transition-colors">Infrastructure</li>
                            <li className="hover:text-brand-400 cursor-pointer transition-colors opacity-50">Partners</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-white mb-6">Legal</h4>
                        <ul className="space-y-4 text-slate-500 text-sm font-medium text-[9px] uppercase tracking-widest">
                            <li className="hover:text-white cursor-pointer transition-colors">Privacy</li>
                            <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto mt-20 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-600">
                <span>© 2026 HERFUTURE PROTOCOL. AN OPEN SOURCE PROJECT.</span>
                <div className="flex gap-6">
                    <span className="hover:text-white cursor-pointer transition-colors">CELO</span>
                    <span className="hover:text-white cursor-pointer transition-colors">UNICEF HUB</span>
                    <a
                        href="https://github.com/mrgigi/herfuture-chain"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white cursor-pointer transition-colors"
                    >
                        GITHUB
                    </a>
                </div>
            </div>
        </footer>
    );
}
