import React from 'react';

/**
 * Catches rendering chunk errors (e.g. from React.lazy) and general rendering
 * crashes so the user doesn't see a permanently blank screen.
 * Automatically reloads the page for ChunkLoadErrors since they usually resolve on refresh.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        const isChunkLoadError = error?.name === 'ChunkLoadError' || error?.message?.includes('Failed to fetch dynamically imported module');

        // If it's a dynamic import failure, try to auto-reload once
        if (isChunkLoadError) {
            const isReloaded = sessionStorage.getItem('chunk_reloaded');
            if (!isReloaded) {
                sessionStorage.setItem('chunk_reloaded', 'true');
                window.location.reload();
                return;
            }
        }
        sessionStorage.removeItem('chunk_reloaded');
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-[50vh] bg-transparent text-slate-300 flex-col p-6 text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h1>
                    <p className="mb-6 text-slate-400">There was a problem loading the page content. Please refresh the page.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-8 rounded-2xl transition-all shadow-lg shadow-brand-500/20"
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
