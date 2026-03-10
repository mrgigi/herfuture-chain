import { Github, Facebook, Instagram, Linkedin, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
    const navigate = useNavigate();

    return (
        <footer className="pt-12 pb-20 px-6 border-t border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-[#060914] transition-colors duration-300">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8 md:gap-12">
                <div>
                    <div className="flex items-center gap-2 mb-6 cursor-pointer h-10" onClick={() => navigate('/')}>
                        <img src="/images/logo.svg" alt="HerFuture Chain Logo" className="h-full w-auto hidden dark:block" />
                        <img src="/images/logo.svg" alt="HerFuture Chain Logo" className="h-full w-auto block dark:hidden invert" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-500 text-sm max-w-xs leading-relaxed">
                        Pioneering distributed socio-economic mobility for teen moms, out-of-school and unemployed girls. Open-source, transparent, and built for impact.
                    </p>
                    <div className="flex gap-4 mt-8">
                        <a
                            href="https://github.com/mrgigi/herfuture-chain"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white transition-all hover:bg-slate-50 dark:hover:bg-white/10 shadow-sm dark:shadow-none"
                        >
                            <Github className="w-4 h-4" />
                        </a>
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white transition-all hover:bg-slate-50 dark:hover:bg-white/10 cursor-pointer shadow-sm dark:shadow-none">
                            <Facebook className="w-4 h-4" />
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white transition-all hover:bg-slate-50 dark:hover:bg-white/10 cursor-pointer shadow-sm dark:shadow-none">
                            <Instagram className="w-4 h-4" />
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white transition-all hover:bg-slate-50 dark:hover:bg-white/10 cursor-pointer shadow-sm dark:shadow-none">
                            <Linkedin className="w-4 h-4" />
                        </div>
                        {/* TikTok Custom Icon */}
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white transition-all hover:bg-slate-50 dark:hover:bg-white/10 cursor-pointer shadow-sm dark:shadow-none">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-.99.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.89-.23-2.74.24-.73.41-1.31 1.07-1.58 1.87-.2.55-.25 1.15-.15 1.74.25.95 1.05 1.76 1.97 2.13.78.33 1.66.39 2.48.14.74-.21 1.41-.67 1.84-1.3.43-.61.64-1.35.66-2.09.02-2.39.01-4.78.01-7.18s0-4.78 0-7.18z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
                    <div>
                        <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-800 dark:text-white mb-6">Ecosystem</h4>
                        <ul className="space-y-4 text-slate-600 dark:text-slate-500 text-sm font-medium">
                            <li onClick={() => navigate('/signup')} className="hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer transition-colors">Academy</li>
                            <li onClick={() => navigate('/impact')} className="hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors">Impact Data</li>
                            <li className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors opacity-50">On-Chain Audit</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-800 dark:text-white mb-6">Company</h4>
                        <ul className="space-y-4 text-slate-600 dark:text-slate-500 text-sm font-medium">
                            <li onClick={() => navigate('/')} className="hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer transition-colors">Manifesto</li>
                            <li onClick={() => navigate('/')} className="hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer transition-colors">Infrastructure</li>
                            <li className="hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer transition-colors opacity-50">Partners</li>
                        </ul>
                    </div>
                    <div className="hidden md:block">
                        <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-800 dark:text-white mb-6">Legal</h4>
                        <ul className="space-y-4 text-slate-600 dark:text-slate-500 text-sm font-medium">
                            <li className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
                            <li className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Terms of Service</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-600">
                <span>© 2026 HerFuture Protocol. An open source project.</span>

                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex items-center gap-1.5 order-2 md:order-1">
                        Built with <span className="text-yellow-500 dark:text-yellow-400 animate-pulse text-xs">💛</span> on the <span className="text-emerald-600 dark:text-celo">Celo</span> Blockchain
                    </div>
                    <div className="hidden md:block h-3 w-px bg-slate-300 dark:bg-white/10 order-2" />
                    <div className="flex items-center gap-2 order-1 md:order-3 opacity-80 dark:opacity-60">
                        <span>v1.2 Protocol Beta</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
