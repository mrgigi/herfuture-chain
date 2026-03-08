import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';

const AVATARS = [
    { id: 'avatar1', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amina&backgroundColor=ffd5dc&top=longHair,bob&clothing=blazerAndShirt&mouth=smile&eye=happy' },
    { id: 'avatar2', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kezia&backgroundColor=c0aede&top=hijab&clothing=blazerAndSweater&mouth=twinkle&eye=default' },
    { id: 'avatar3', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nala&backgroundColor=b6e3f4&top=longHairCurvy&clothing=shirtCrewNeck&mouth=smile&eye=happy' },
    { id: 'avatar4', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zara&backgroundColor=d1d4f9&top=bob&clothing=overall&mouth=twinkle&eye=default' }
];

export default function AvatarSelection() {
    const [selected, setSelected] = useState(null);
    const navigate = useNavigate();

    const handleConfirm = () => {
        if (selected) {
            localStorage.setItem('userAvatar', selected.url);
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-[#060912] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-fuchsia-900/20 via-slate-950 to-slate-950">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">Choose Your Character</h1>
                    <p className="text-slate-500 text-sm font-medium">Pick an avatar to represent you.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                    {AVATARS.map((avatar) => (
                        <div
                            key={avatar.id}
                            onClick={() => setSelected(avatar)}
                            className={`relative cursor-pointer group transition-all duration-500 ${selected?.id === avatar.id ? 'scale-105' : 'hover:scale-102'
                                }`}
                        >
                            <div className={`aspect-square rounded-[32px] overflow-hidden border-2 transition-all duration-500 bg-slate-900/50 backdrop-blur-xl ${selected?.id === avatar.id
                                ? 'border-brand-500 shadow-[0_0_40px_rgba(217,70,239,0.3)] bg-brand-500/10'
                                : 'border-white/10 group-hover:border-white/30'
                                }`}>
                                <img src={avatar.url} alt="Avatar" className="w-full h-full object-cover p-2" />
                            </div>

                            {selected?.id === avatar.id && (
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                                    <Check className="w-5 h-5 text-white" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleConfirm}
                    disabled={!selected}
                    className={`w-full py-5 rounded-[20px] font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 ${selected
                        ? 'bg-brand-500 text-white shadow-2xl shadow-brand-500/40 scale-100 hover:-translate-y-1 active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                        }`}
                >
                    Continue to Dashboard <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
