'use client'

import { useState, Suspense } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'

function LoginForm() {
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
                    redirectTo: `${window.location.protocol}//${window.location.host}/auth/callback`
                }
            })
            if (error) throw error
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className="min-h-screen flex bg-black font-sans">
            {/* Left Side: Visual/Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-zinc-900 border-r border-zinc-800 relative items-center justify-center p-20 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]"></div>

                <div className="relative z-10 text-white max-w-lg">
                    <Link href="/" className="inline-block mb-12 transform hover:scale-105 transition-all">
                        <Logo className="text-white w-auto h-12" showText={false} />
                    </Link>
                    <h2 className="text-6xl font-black mb-8 tracking-tighter leading-[1] text-white">
                        Access the <br />Campus Hub.
                    </h2>
                    <p className="text-xl text-zinc-500 leading-relaxed font-medium">
                        Log in to coordinate events, manage your clubs, and stay connected with your campus community in real-time.
                    </p>

                    <div className="mt-16 flex items-center gap-6">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-800 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" />
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Node verified by 500+ Leads</p>
                    </div>
                </div>
            </div>

            {/* Right Side: Form Content */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-16 lg:px-24 py-12 relative overflow-y-auto bg-black">
                {/* Mobile Tablet Logo */}
                <div className="lg:hidden mb-12 flex justify-center">
                    <Link href="/">
                        <Logo className="text-white w-auto h-12" showText={false} />
                    </Link>
                </div>

                <div className="max-w-md w-full mx-auto">
                    <div className="mb-12">
                        <h1 className="text-4xl font-black text-white mb-4 tracking-tighter">AUTHENTICATE.</h1>
                        <p className="text-zinc-500 font-bold text-xs uppercase tracking-[0.25em]">ENTER PERMISSION KEY</p>
                    </div>

                    {message && (
                        <div className="mb-10 bg-zinc-900 border border-zinc-800 text-zinc-400 px-6 py-4 rounded-2xl text-xs font-bold text-center tracking-widest uppercase">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] pl-1">Identifier (Email)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-white transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl pl-14 pr-6 py-4 text-white focus:bg-zinc-900 focus:border-white transition-all font-bold outline-none placeholder:text-zinc-700 text-sm tracking-wide"
                                    placeholder="name@institute.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Credentials (Password)</label>
                                <button type="button" className="text-[9px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">Recover?</button>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-white transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl pl-14 pr-14 py-4 text-white focus:bg-zinc-900 focus:border-white transition-all font-bold outline-none placeholder:text-zinc-700 text-sm tracking-wide"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-5 flex items-center text-zinc-600 hover:text-white focus:outline-none transition-colors"
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
                            <div className="bg-red-500/10 text-red-500 px-6 py-4 rounded-2xl text-[10px] font-black border border-red-500/20 italic tracking-widest">
                                AUTH_ERROR: {error.toUpperCase()}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black font-black py-5 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 text-sm uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                        >
                            {loading ? "AUTHENTICATING..." : "Initiate Access"}
                        </button>
                    </form>

                    <div className="mt-16">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-900"></div></div>
                            <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.4em]">
                                <span className="bg-black px-6 text-zinc-600">Secure OAuth Access</span>
                            </div>
                        </div>

                        <div className="mt-10">
                            <button
                                type="button"
                                onClick={() => handleSocialLogin('google')}
                                className="w-full flex justify-center items-center h-14 border border-zinc-800 rounded-2xl hover:border-white hover:bg-zinc-900 transition-all group gap-4"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#ffffff" d="M23.745 12.27c0-.79-.069-1.55-.198-2.28H12v4.31h6.586c-.284 1.49-1.127 2.75-2.395 3.6l3.882 3.01c2.27-2.09 3.57-5.17 3.57-8.64z" />
                                    <path fill="#ffffff" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.883-3.01c-1.076.72-2.455 1.15-4.067 1.15-3.13 0-5.783-2.11-6.73-4.94L1.405 17.3c2.01 3.99 6.13 6.7 10.595 6.7z" />
                                    <path fill="#ffffff" d="M5.27 14.3a7.14 7.14 0 010-4.6l-3.865-2.99A11.96 11.96 0 000 12c0 2.01.5 3.91 1.405 5.3l3.865-3z" />
                                    <path fill="#ffffff" d="M12 4.75c1.765 0 3.35.61 4.595 1.79l3.43-3.43C17.96 1.07 15.24 0 12 0 7.535 0 3.415 2.71 1.405 6.7L5.27 9.69C6.217 6.86 8.87 4.75 12 4.75z" />
                                </svg>
                                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Continue with Google</span>
                            </button>
                        </div>
                    </div>

                    <p className="mt-12 text-center text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em]">
                        New to Campus? <Link href="/auth/register" className="text-white hover:underline underline-offset-4 decoration-2">Create Profile</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function Login() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0b87bd]"></div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}

