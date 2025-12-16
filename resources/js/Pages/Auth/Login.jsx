import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <style>{`
                .login-title {
                    font-family: 'Newsreader', serif;
                }
                
                .gradient-border {
                    position: relative;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 1px;
                    border-radius: 0.75rem;
                }
                
                .gradient-border-inner {
                    background: white;
                    border-radius: calc(0.75rem - 1px);
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fade-in-up {
                    animation: fadeInUp 0.6s ease-out forwards;
                }
                
                .stagger-1 { animation-delay: 0.1s; opacity: 0; }
                .stagger-2 { animation-delay: 0.2s; opacity: 0; }
                .stagger-3 { animation-delay: 0.3s; opacity: 0; }
                .stagger-4 { animation-delay: 0.4s; opacity: 0; }
                .stagger-5 { animation-delay: 0.5s; opacity: 0; }
                
                .input-focus-effect:focus {
                    border-color: #667eea !important;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
                    transition: all 0.2s ease;
                }
                
                .btn-gradient {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    border: none !important;
                }
                
                .btn-gradient:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px -5px rgba(102, 126, 234, 0.4) !important;
                }
                
                .btn-gradient:active:not(:disabled) {
                    transform: translateY(0);
                }
                
                .social-btn {
                    transition: all 0.2s ease;
                    border: 1.5px solid #e5e7eb;
                }
                
                .social-btn:hover {
                    border-color: #667eea;
                    background: #f8f9ff;
                    transform: translateY(-1px);
                }
            `}</style>

            <div className="gradient-border">
                <div className="gradient-border-inner bg-white p-8 md:p-10">
                    <div className="text-center mb-8 animate-fade-in-up stagger-1">
                        <h1 className="login-title text-3xl font-semibold text-gray-900 mb-2">
                            Welcome back
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Sign in to continue to your account
                        </p>
                    </div>

                    {status && (
                        <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 animate-fade-in-up stagger-2">
                            <p className="text-sm font-medium text-green-800">
                                {status}
                            </p>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        <div className="animate-fade-in-up stagger-2">
                            <InputLabel 
                                htmlFor="email" 
                                value="Email address" 
                                className="text-gray-700 font-medium mb-2"
                            />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg input-focus-effect"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="you@example.com"
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div className="animate-fade-in-up stagger-3">
                            <div className="flex items-center justify-between mb-2">
                                <InputLabel 
                                    htmlFor="password" 
                                    value="Password" 
                                    className="text-gray-700 font-medium"
                                />
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-xs text-violet-600 hover:text-violet-700 font-medium transition-colors"
                                    >
                                        Forgot?
                                    </Link>
                                )}
                            </div>
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg input-focus-effect"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Enter your password"
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="flex items-center animate-fade-in-up stagger-4">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                            />
                            <span className="ml-2 text-sm text-gray-600">
                                Keep me signed in
                            </span>
                        </div>

                        <div className="animate-fade-in-up stagger-4">
                            <PrimaryButton
                                className="w-full btn-gradient text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={processing}
                            >
                                {processing ? 'Signing in...' : 'Sign in'}
                            </PrimaryButton>
                        </div>
                    </form>

                    <div className="relative my-8 animate-fade-in-up stagger-5">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500 font-medium">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className="animate-fade-in-up stagger-5">
                        <a
                            href={route('google.redirect')}
                            className="social-btn flex w-full items-center justify-center gap-3 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-gray-700"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Sign in with Google
                        </a>
                    </div>

                    {/* <div className="mt-8 text-center text-sm text-gray-600 animate-fade-in-up stagger-5">
                        Don't have an account?{' '}
                        <Link 
                            href={route('register')} 
                            className="font-semibold text-violet-600 hover:text-violet-700 transition-colors"
                        >
                            Sign up
                        </Link>
                    </div> */}
                </div>
            </div>
        </GuestLayout>
    );
}