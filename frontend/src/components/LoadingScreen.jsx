import React from 'react';

const LoadingScreen = ({ message = "Synchronizing Curriculum..." }) => {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#060912]">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
            </div>

            {/* Main Content */}
            <div className="relative flex flex-col items-center">
                {/* Animated Svg Logo/Icon Container */}
                <div className="relative w-24 h-24 mb-12">
                    {/* Pulsing ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-brand-500/20 animate-[ping_3s_linear_infinite]" />
                    <div className="absolute -inset-4 rounded-full border border-fuchsia-500/10 animate-[ping_2s_linear_infinite]" />

                    {/* Center Logo/Spinner */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-16 h-16 animate-[spin_2s_linear_infinite]" viewBox="0 0 100 100">
                            <defs>
                                <linearGradient id="loader-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#d946ef" />
                                </linearGradient>
                            </defs>
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="url(#loader-gradient)"
                                strokeWidth="8"
                                strokeDasharray="180 100"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>

                    {/* Central static icon or logo mark */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                    </div>
                </div>

                {/* Text Details */}
                <div className="text-center space-y-3">
                    <h3 className="text-xl font-black text-white italic tracking-tight uppercase animate-in fade-in slide-in-from-bottom-2 duration-700">
                        {message}
                    </h3>
                    <div className="flex items-center justify-center gap-2">
                        <div className="h-1 w-12 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-brand-500 to-fuchsia-500 w-full animate-[loading-bar_1.5s_ease-in-out_infinite]" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
                            On-Chain Bridge Active
                        </span>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />
        </div>
    );
};

export default LoadingScreen;
