import { useNavigate } from 'react-router-dom';

export default function Topbar({ title }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear persisted user session
        localStorage.removeItem('userEmail');
        // Redirect to signup/login page
        navigate('/signup');
    };

    return (
        <div className="md:ml-64 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-8 py-5 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-slate-100">{title}</h1>

            <div className="flex items-center gap-4">
                <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                    Logout
                </button>
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform">
                    <span className="font-semibold text-white">AJ</span>
                </div>
            </div>
        </div >
    )
}
