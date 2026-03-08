import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';

/**
 * YoutubePlayer
 * Uses the YouTube IFrame Player API to hide all native controls
 * and shows only: Play/Pause, Seek bar (with ±10s skip), Volume slider.
 */

function extractVideoId(url) {
    if (!url) return null;
    try {
        if (url.includes('youtube.com/watch')) {
            return new URL(url).searchParams.get('v');
        }
        if (url.includes('youtu.be/')) {
            return url.split('youtu.be/')[1].split('?')[0];
        }
        if (url.includes('youtube.com/embed/')) {
            return url.split('youtube.com/embed/')[1].split('?')[0];
        }
    } catch { /* ignore */ }
    return null;
}

// Load the YouTube IFrame API script once globally
let ytApiLoading = false;
let ytApiReady = false;
const ytReadyCallbacks = [];

function loadYTApi(cb) {
    if (ytApiReady && window.YT?.Player) { cb(); return; }
    ytReadyCallbacks.push(cb);
    if (!ytApiLoading) {
        ytApiLoading = true;
        window.onYouTubeIframeAPIReady = () => {
            ytApiReady = true;
            ytReadyCallbacks.forEach(fn => fn());
            ytReadyCallbacks.length = 0;
        };
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
    }
}

export default function YoutubePlayer({ url }) {
    const containerRef = useRef(null);
    const playerRef = useRef(null);
    const intervalRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(80);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const hideTimeout = useRef(null);

    const videoId = extractVideoId(url);

    const startProgressTimer = useCallback(() => {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            if (playerRef.current?.getCurrentTime) {
                setCurrentTime(playerRef.current.getCurrentTime());
                setDuration(playerRef.current.getDuration() || 0);
            }
        }, 500);
    }, []);

    useEffect(() => {
        if (!videoId) return;

        loadYTApi(() => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }

            const divId = `yt-player-${videoId}`;
            const div = document.createElement('div');
            div.id = divId;
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
                containerRef.current.appendChild(div);
            }

            playerRef.current = new window.YT.Player(divId, {
                videoId,
                playerVars: {
                    controls: 0,          // hide native controls
                    rel: 0,               // no related videos
                    modestbranding: 1,    // minimal branding
                    iv_load_policy: 3,    // no annotations
                    playsinline: 1,       // play inline on iOS
                    fs: 0,               // disable native fullscreen button
                    disablekb: 1,        // disable keyboard shortcuts
                },
                events: {
                    onReady: (e) => {
                        e.target.setVolume(80);
                        setDuration(e.target.getDuration());
                    },
                    onStateChange: (e) => {
                        const YT = window.YT.PlayerState;
                        if (e.data === YT.PLAYING) {
                            setIsPlaying(true);
                            startProgressTimer();
                        } else {
                            setIsPlaying(false);
                            clearInterval(intervalRef.current);
                        }
                    },
                },
            });
        });

        return () => {
            clearInterval(intervalRef.current);
        };
    }, [videoId, startProgressTimer]);

    const togglePlay = () => {
        if (!playerRef.current) return;
        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    };

    const handleSeek = (e) => {
        const val = Number(e.target.value);
        setCurrentTime(val);
        playerRef.current?.seekTo(val, true);
    };

    const skip = (secs) => {
        if (!playerRef.current) return;
        const t = playerRef.current.getCurrentTime() + secs;
        playerRef.current.seekTo(Math.max(0, t), true);
    };

    const handleVolume = (e) => {
        const val = Number(e.target.value);
        setVolume(val);
        setIsMuted(val === 0);
        playerRef.current?.setVolume(val);
        playerRef.current?.unMute();
    };

    const toggleMute = () => {
        if (!playerRef.current) return;
        if (isMuted) {
            playerRef.current.unMute();
            playerRef.current.setVolume(volume || 50);
            setIsMuted(false);
        } else {
            playerRef.current.mute();
            setIsMuted(true);
        }
    };

    const formatTime = (s) => {
        if (!s || isNaN(s)) return '0:00';
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    const revealControls = () => {
        setShowControls(true);
        clearTimeout(hideTimeout.current);
        hideTimeout.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    };

    if (!videoId) {
        return (
            <div className="w-full aspect-video bg-slate-900 flex flex-col items-center justify-center text-center p-6">
                <Play className="w-10 h-10 text-slate-700 mb-3" />
                <p className="text-slate-500 text-sm">Video coming soon</p>
            </div>
        );
    }

    return (
        <div
            className="w-full aspect-video bg-black relative select-none group"
            onMouseMove={revealControls}
            onTouchStart={revealControls}
            onClick={togglePlay}
        >
            {/* YouTube IFrame mounts here */}
            <div ref={containerRef} className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" />

            {/* Gradient overlay for controls */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            {/* Big centre play/pause indicator */}
            <div
                className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
            >
                {!isPlaying && (
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                )}
            </div>

            {/* Custom Controls Bar */}
            <div
                className={`absolute bottom-0 left-0 right-0 px-4 pb-3 pt-6 transition-opacity duration-300 pointer-events-auto ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Seek bar */}
                <div className="mb-2 flex items-center gap-2">
                    <span className="text-white/60 text-[10px] font-mono w-9 shrink-0">{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        step={0.5}
                        value={currentTime}
                        onChange={handleSeek}
                        className="flex-1 h-1.5 rounded-full appearance-none bg-white/20 cursor-pointer accent-brand-500"
                        style={{
                            background: `linear-gradient(to right, #7c3aed ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) 0%)`,
                        }}
                    />
                    <span className="text-white/60 text-[10px] font-mono w-9 shrink-0 text-right">{formatTime(duration)}</span>
                </div>

                {/* Buttons row */}
                <div className="flex items-center gap-3">
                    {/* Skip back */}
                    <button
                        onClick={() => skip(-10)}
                        className="text-white/70 hover:text-white transition-colors flex flex-col items-center"
                        title="Back 10s"
                    >
                        <SkipBack className="w-5 h-5" />
                    </button>

                    {/* Play / Pause */}
                    <button
                        onClick={togglePlay}
                        className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:bg-brand-400 transition-colors shrink-0"
                    >
                        {isPlaying
                            ? <Pause className="w-4 h-4 text-black" />
                            : <Play className="w-4 h-4 text-black ml-0.5" />
                        }
                    </button>

                    {/* Skip forward */}
                    <button
                        onClick={() => skip(10)}
                        className="text-white/70 hover:text-white transition-colors"
                        title="Forward 10s"
                    >
                        <SkipForward className="w-5 h-5" />
                    </button>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Volume */}
                    <div className="flex items-center gap-2">
                        <button onClick={toggleMute} className="text-white/70 hover:text-white transition-colors">
                            {isMuted || volume === 0
                                ? <VolumeX className="w-4 h-4" />
                                : <Volume2 className="w-4 h-4" />
                            }
                        </button>
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={isMuted ? 0 : volume}
                            onChange={handleVolume}
                            className="w-20 h-1.5 rounded-full appearance-none cursor-pointer accent-brand-500"
                            style={{
                                background: `linear-gradient(to right, #7c3aed ${isMuted ? 0 : volume}%, rgba(255,255,255,0.2) 0%)`,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
