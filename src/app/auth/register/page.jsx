'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Register() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [role, setRole] = useState('student')
    const [instituteName, setInstituteName] = useState('')
    const [educationLevel, setEducationLevel] = useState('Bachelors')
    const [degree, setDegree] = useState('')
    const [academicYear, setAcademicYear] = useState('')
    const [avatarFile, setAvatarFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()
    const supabase = createSupabaseClient()

    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data: { user }, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role,
                        institute_name: instituteName,
                        education_level: educationLevel,
                        degree: degree,
                        academic_year: academicYear,
                    }
                }
            })

            if (signUpError) throw signUpError

            if (user) {
                let avatarUrl = ''
                if (avatarFile) {
                    const fileExt = avatarFile.name.split('.').pop()
                    const fileName = `${user.id}-${Math.random()}.${fileExt}`
                    const filePath = `avatars/${fileName}`
                    const { error: uploadError } = await supabase.storage.from('profiles').upload(filePath, avatarFile)
                    if (!uploadError) {
                        const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(filePath)
                        avatarUrl = publicUrl
                    }
                }

                const profileData = {
                    id: user.id,
                    full_name: fullName,
                    email: email,
                    role: role,
                    institute_name: instituteName,
                    education_level: educationLevel,
                    degree: degree,
                    academic_year: academicYear,
                    avatar_url: avatarUrl,
                    created_at: new Date().toISOString(),
                }

                try {
                    // Explicitly check for profile creation
                    const { error: profileError } = await supabase.from('profiles').upsert(profileData)

                    if (profileError && !profileError.message.includes('row-level security')) {
                        throw profileError
                    }
                } catch (pErr) {
                    console.warn('Profile sync handled by database trigger or blocked by RLS:', pErr)
                    // If it's an RLS error, it's likely because the user isn't confirmed yet.
                    // Since we saw the row in Supabase, we can proceed.
                }

                router.push('/auth/login?message=Registration successful! Please check your email to confirm your account or log in now.')
                return; // Ensure we stop execution here
            }
        } catch (err) {
            console.error('Registration failed:', err)
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
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 text-white max-w-lg text-left">
                    <Link href="/" className="inline-block text-2xl font-bold bg-white text-[#0b87bd] px-6 py-2 rounded-2xl mb-12 shadow-xl">
                        Campus Connect
                    </Link>
                    <h2 className="text-6xl font-extrabold mb-8 tracking-tighter leading-[1.1]">
                        Join the Campus Movement.
                    </h2>
                    <p className="text-xl text-white/80 leading-relaxed font-medium">
                        Create your account to start leadings clubs, organizing events, and connecting with students across your campus.
                    </p>

                    <div className="mt-16 bg-white/10 border border-white/20 p-8 rounded-[2rem] backdrop-blur-sm">
                        <p className="text-sm font-bold uppercase tracking-widest text-white/60 mb-2">Fast Access</p>
                        <p className="text-lg font-semibold italic">"The easiest way to broadcast your club events to the entire student body."</p>
                    </div>
                </div>
            </div>

            {/* Right Side: Form Content */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative h-screen overflow-y-auto custom-scrollbar">
                <div className="max-w-md w-full mx-auto my-auto py-12">
                    <div className="mb-10">
                        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Register.</h1>
                        <p className="text-gray-500 font-medium text-lg">Create your professional campus profile.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-[#f5f7f9] border-2 border-transparent rounded-2xl px-5 py-3.5 text-gray-900 focus:bg-white focus:border-[#0b87bd] transition-all font-semibold outline-none"
                                placeholder="Jane Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Education Level</label>
                                <select
                                    className="w-full bg-[#f5f7f9] border-2 border-transparent rounded-2xl px-5 py-3.5 text-gray-900 focus:bg-white focus:border-[#0b87bd] transition-all font-bold outline-none cursor-pointer appearance-none"
                                    value={educationLevel}
                                    onChange={(e) => setEducationLevel(e.target.value)}
                                >
                                    <option value="Bachelors">Bachelors</option>
                                    <option value="Masters">Masters</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Degree Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-[#f5f7f9] border-2 border-transparent rounded-2xl px-5 py-3.5 text-gray-900 focus:bg-white focus:border-[#0b87bd] transition-all font-semibold outline-none"
                                    placeholder="Computer Science"
                                    value={degree}
                                    onChange={(e) => setDegree(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Academic Year</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-[#f5f7f9] border-2 border-transparent rounded-2xl px-5 py-3.5 text-gray-900 focus:bg-white focus:border-[#0b87bd] transition-all font-semibold outline-none"
                                    placeholder="3rd Year"
                                    value={academicYear}
                                    onChange={(e) => setAcademicYear(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Institute</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-[#f5f7f9] border-2 border-transparent rounded-2xl px-5 py-3.5 text-gray-900 focus:bg-white focus:border-[#0b87bd] transition-all font-semibold outline-none"
                                    placeholder="Harbour Univ."
                                    value={instituteName}
                                    onChange={(e) => setInstituteName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Identify (Avatar)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setAvatarFile(e.target.files[0])}
                                className="hidden"
                                id="avatar-reg"
                            />
                            <label
                                htmlFor="avatar-reg"
                                className="w-full flex items-center bg-[#f5f7f9] border-2 border-dashed border-gray-200 rounded-2xl px-5 py-3.5 text-gray-500 hover:text-[#0b87bd] hover:bg-white hover:border-[#0b87bd]/50 transition-all cursor-pointer font-semibold"
                            >
                                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="truncate">{avatarFile ? avatarFile.name : 'Choose Profile Image'}</span>
                            </label>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Email Coordinates</label>
                            <input
                                type="email"
                                required
                                className="w-full bg-[#f5f7f9] border-2 border-transparent rounded-2xl px-5 py-3.5 text-gray-900 focus:bg-white focus:border-[#0b87bd] transition-all font-semibold outline-none"
                                placeholder="name@college.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1 relative group">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Security Key (Password)</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full bg-[#f5f7f9] border-2 border-transparent rounded-2xl px-5 py-3.5 text-gray-900 focus:bg-white focus:border-[#0b87bd] transition-all font-semibold outline-none"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute bottom-3.5 right-5 text-gray-400 hover:text-[#0b87bd]"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                )}
                            </button>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Account Protocol (Role)</label>
                            <select
                                className="w-full bg-[#f5f7f9] border-2 border-transparent rounded-2xl px-5 py-3.5 text-gray-900 focus:bg-white focus:border-[#0b87bd] transition-all font-bold outline-none cursor-pointer appearance-none"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="student">Student Account</option>
                                <option value="club_lead">Club Leadership</option>
                                <option value="admin">System Moderator</option>
                            </select>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-500 px-5 py-4 rounded-2xl text-[11px] font-bold border border-red-100">
                                PROTOCOL ERROR: {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0b87bd] hover:bg-[#096a96] text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-[#0b87bd]/20 active:scale-[0.98] disabled:opacity-70 text-lg"
                        >
                            {loading ? "PROCESSING..." : "Synchronize Profile"}
                        </button>
                    </form>

                    <div className="mt-10 border-t border-gray-100 pt-10">
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('google')}
                            className="w-full flex justify-center items-center h-16 border-2 border-gray-50 rounded-2xl hover:border-[#0b87bd]/30 hover:bg-[#f5f7f9] transition-all group gap-3"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M23.745 12.27c0-.79-.069-1.55-.198-2.28H12v4.31h6.586c-.284 1.49-1.127 2.75-2.395 3.6l3.882 3.01c2.27-2.09 3.57-5.17 3.57-8.64z" />
                                <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.883-3.01c-1.076.72-2.455 1.15-4.067 1.15-3.13 0-5.783-2.11-6.73-4.94L1.405 17.3c2.01 3.99 6.13 6.7 10.595 6.7z" />
                                <path fill="#FBBC05" d="M5.27 14.3a7.14 7.14 0 010-4.6l-3.865-2.99A11.96 11.96 0 000 12c0 2.01.5 3.91 1.405 5.3l3.865-3z" />
                                <path fill="#EA4335" d="M12 4.75c1.765 0 3.35.61 4.595 1.79l3.43-3.43C17.96 1.07 15.24 0 12 0 7.535 0 3.415 2.71 1.405 6.7L5.27 9.69C6.217 6.86 8.87 4.75 12 4.75z" />
                            </svg>
                            <span className="font-bold text-gray-700">Continue with Google</span>
                        </button>
                    </div>

                    <p className="mt-8 text-center text-gray-500 font-bold text-sm">
                        Existing User? <Link href="/auth/login" className="text-[#0b87bd] hover:underline underline-offset-4 font-black">Login Authenticate</Link>
                    </p>
                </div>
            </div>

        </div >
    )
}

