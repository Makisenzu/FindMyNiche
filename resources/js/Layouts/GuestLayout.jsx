import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Newsreader:wght@600&display=swap');
                
                .guest-layout {
                    font-family: 'DM Sans', sans-serif;
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                
                .floating-shape {
                    animation: float 6s ease-in-out infinite;
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                .logo-animate {
                    animation: fadeIn 0.5s ease-out;
                }
                
                .logo-glow {
                    filter: drop-shadow(0 10px 25px rgba(102, 126, 234, 0.3));
                    transition: filter 0.3s ease;
                }
                
                .logo-glow:hover {
                    filter: drop-shadow(0 15px 35px rgba(102, 126, 234, 0.5));
                }
            `}</style>

            <div className="guest-layout min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden bg-gradient-to-br from-slate-50 via-violet-50 to-blue-50">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 floating-shape"></div>
                    <div className="absolute top-40 right-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 floating-shape" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 floating-shape" style={{ animationDelay: '4s' }}></div>
                </div>

                <div className="relative z-10 w-full max-w-md">
                    {children}
                </div>
            </div>
        </>
    );
}