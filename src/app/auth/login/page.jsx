'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const router = useRouter()
    const searchParams = useSearchParams()
    const message = searchParams.get('message')
    const supabase = createSupabaseClient()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error
            window.location.href = '/dashboard'
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSocialLogin = async (provider) => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            })
            if (error) throw error
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className="min-h-screen flex bg-white font-sans overflow-hidden">
            {/* Left Side: Visual/Branding (Out of the box) */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#0b87bd] relative items-center justify-center p-20 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 text-white max-w-lg">
                    <Link href="/" className="inline-block text-2xl font-bold bg-white text-[#0b87bd] px-6 py-2 rounded-2xl mb-12 shadow-xl shadow-[#096a96]/20">
                        Campus Connect
                    </Link>
                    <h2 className="text-6xl font-extrabold mb-8 tracking-tighter leading-[1.1]">
                        Welcome Back to your Campus Hub.
                    </h2>
                    <p className="text-xl text-white/80 leading-relaxed font-medium">
                        Log in to coordinate events, manage your clubs, and stay connected with your campus community in real-time.
                    </p>

                    <div className="mt-16 flex items-center gap-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0b87bd] bg-gray-200 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" />
                                </div>
                            ))}
                        </div>
                        <p className="text-sm font-bold text-white/90">Joined by 500+ Campus Leads</p>
                    </div>
                </div>
            </div>

            {/* Right Side: Form Content */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative">
                {/* Mobile Tablet Logo */}
                <div className="lg:hidden mb-12 flex justify-center">
                    <Link href="/" className="text-3xl font-bold text-[#0b87bd]">Campus Connect</Link>
                </div>

                <div className="max-w-md w-full mx-auto">
                    <div className="mb-12">
                        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Login.</h1>
                        <p className="text-gray-500 font-medium">Enter your credentials to access your dashboard.</p>
                    </div>

                    {message && (
                        <div className="mb-8 bg-[#0b87bd]/10 border border-[#0b87bd]/20 text-[#0b87bd] px-6 py-4 rounded-2xl text-sm font-bold text-center">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#0b87bd] transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-[#f5f7f9] border-2 border-transparent rounded-[1.25rem] pl-14 pr-6 py-4 text-gray-900 focus:bg-white focus:border-[#0b87bd] transition-all font-semibold outline-none placeholder:text-gray-400"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
                                <button type="button" className="text-xs font-bold text-[#0b87bd] hover:underline">Forgot?</button>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#0b87bd] transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full bg-[#f5f7f9] border-2 border-transparent rounded-[1.25rem] pl-14 pr-14 py-4 text-gray-900 focus:bg-white focus:border-[#0b87bd] transition-all font-semibold outline-none placeholder:text-gray-400"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-500 px-6 py-4 rounded-2xl text-sm font-bold border border-red-100 italic">
                                &gt; {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0b87bd] hover:bg-[#096a96] text-white font-black py-4 rounded-[1.25rem] transition-all transform hover:shadow-xl hover:shadow-[#0b87bd]/20 active:scale-[0.98] disabled:opacity-70 text-lg shadow-lg shadow-[#0b87bd]/10"
                        >
                            {loading ? "AUTHENTICATING..." : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-12">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                            <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest group">
                                <span className="bg-white px-4 text-gray-400">Social Login Access</span>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                type="button"
                                onClick={() => handleSocialLogin('google')}
                                className="w-full flex justify-center items-center h-16 border-2 border-gray-50 rounded-2xl hover:border-[#0b87bd]/30 hover:bg-[#f5f7f9] transition-all group gap-3"
                            >
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M23.745 12.27c0-.79-.069-1.55-.198-2.28H12v4.31h6.586c-.284 1.49-1.127 2.75-2.395 3.6l3.882 3.01c2.27-2.09 3.57-5.17 3.57-8.64z" />
                                    <path fill="#5fea84ff" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.883-3.01c-1.076.72-2.455 1.15-4.067 1.15-3.13 0-5.783-2.11-6.73-4.94L1.405 17.3c2.01 3.99 6.13 6.7 10.595 6.7z" />
                                    <path fill="#FBBC05" d="M5.27 14.3a7.14 7.14 0 010-4.6l-3.865-2.99A11.96 11.96 0 000 12c0 2.01.5 3.91 1.405 5.3l3.865-3z" />
                                    <path fill="#EA4335" d="M12 4.75c1.765 0 3.35.61 4.595 1.79l3.43-3.43C17.96 1.07 15.24 0 12 0 7.535 0 3.415 2.71 1.405 6.7L5.27 9.69C6.217 6.86 8.87 4.75 12 4.75z" />
                                </svg>
                                <span className="font-bold text-gray-700">Continue with Google</span>
                            </button>
                        </div>
                    </div>

                    <p className="mt-12 text-center text-gray-500 font-bold text-sm">
                        New to Campus? <Link href="/auth/register" className="text-[#0b87bd] hover:underline underline-offset-4 decoration-2">Create Account</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

