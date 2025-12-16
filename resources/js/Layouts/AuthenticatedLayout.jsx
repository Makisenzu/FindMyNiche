import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        { 
            name: 'Dashboard', 
            href: route('dashboard'), 
            icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
            current: route().current('dashboard')
        },
        { 
            name: 'Careers', 
            href: route('careers'), 
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
            current: route().current('careers')
        },
        { 
            name: 'Settings', 
            href: route('profile.edit'), 
            icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
            current: route().current('profile.edit')
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                
                * {
                    font-family: 'Inter', sans-serif;
                }
                
                .sidebar-link {
                    transition: all 0.15s ease;
                }
                
                .sidebar-link:hover {
                    background: rgba(139, 92, 246, 0.1);
                }
                
                .sidebar-link.active {
                    background: #8b5cf6;
                    color: white;
                }
                
                .sidebar-link.active svg {
                    color: white;
                }
            `}</style>

            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 
                transform transition-transform duration-300 ease-in-out flex flex-col
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
                    <Link href="/" className="flex items-center gap-2">
                        <ApplicationLogo className="h-8 w-8 fill-current text-violet-600" />
                        <span className="text-lg font-semibold text-gray-900">FindMyNiche</span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`
                                sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                                ${item.current 
                                    ? 'active' 
                                    : 'text-gray-700 hover:text-gray-900'
                                }
                            `}
                        >
                            <svg 
                                className="w-5 h-5 flex-shrink-0" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                            </svg>
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* User section at bottom with Logout button */}
                <div className="p-4 border-t border-gray-200 flex-shrink-0">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Log Out
                    </Link>
                </div>
            </div>

            <div className="lg:pl-64 flex flex-col min-h-screen">
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="flex-1 lg:flex-none">
                            {header && (
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {header}
                                </h2>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="text-gray-400 hover:text-gray-600 transition">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}