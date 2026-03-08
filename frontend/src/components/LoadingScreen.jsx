import React from 'react';
import { Sparkles, Heart, Star } from 'lucide-react';

const LoadingScreen = ({ message = "Preparing Your Journey..." }) => {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#060912] overflow-hidden">
            {/* Magical Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-fuchsia-500/20 rounded-full blur-[120px] animate-pulse delay-1000" />

                {/* Floating "Magic" Particles */}
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full animate-float"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            opacity: Math.random() * 0.5 + 0.2
                        }}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className="relative flex flex-col items-center scale-110">
                {/* Animated Icon Container */}
                <div className="relative w-32 h-32 mb-12 flex items-center justify-center">
                    {/* Pulsing Aura */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-500/20 via-fuchsia-500/20 to-brand-400/20 blur-2xl animate-pulse" />

                    {/* Floating Icons */}
                    <div className="relative flex items-center justify-center">
                        <Heart className="w-16 h-16 text-fuchsia-400 fill-fuchsia-400/20 animate-bounce transition-all duration-1000" />
                        <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-brand-400 animate-pulse" />
                        <Star className="absolute -bottom-2 -left-4 w-6 h-6 text-brand-300 animate-spin-slow" />
                    </div>

                    {/* Orbiting Sparkles */}
                    <div className="absolute inset-0 animate-spin-slow">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_15px_#fff]" />
                    </div>
                </div>

                {/* Inspirational Text */}
                <div className="text-center space-y-4 px-6">
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-white to-fuchsia-300 tracking-tight uppercase animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        {message}
                    </h3>

                    <div className="flex flex-col items-center gap-3">
                        <div className="h-1.5 w-40 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-gradient-to-r from-brand-400 via-fuchsia-400 to-brand-400 w-full animate-loading-slide" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-400/60 flex items-center gap-2">
                            <Sparkles className="w-3 h-3" /> HerFuture Chain • Generating Magic <Sparkles className="w-3 h-3" />
                        </span>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes loading-slide {
                  0% { transform: translateX(-100%); }
                  50% { transform: translateX(0); }
                  100% { transform: translateX(100%); }
                }
                @keyframes float {
                  0%, 100% { transform: translateY(0) scale(1); }
                  50% { transform: translateY(-40px) scale(1.5); }
                }
                .animate-spin-slow {
                  animation: spin 8s linear infinite;
                }
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                .animate-loading-slide {
                  animation: loading-slide 2.5s ease-in-out infinite;
                }
                .animate-float {
                  animation: float 10s ease-in-out infinite;
                }
              `}} />
        </div>
    );
};

export default LoadingScreen;
