import { createSupabaseServer } from '@/lib/supabase/server'
import Header from '@/components/dashboard/Header'
import Link from 'next/link'

export default async function ProfilePage() {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) return null

    return (
        <div className="pb-12 text-white">
            <Header
                title="Profile Identity"
                subtitle="CORE AUTHENTICATION NODE"
                user={user}
            />

            <div className="max-w-4xl mx-auto mt-10">
                <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
                    {/* Cover / Header Section */}
                    <div className="h-48 bg-gradient-to-r from-purple-900/40 via-blue-900/40 to-black relative">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                        <div className="absolute -bottom-16 left-12 flex items-end gap-6">
                            <div className="w-32 h-32 rounded-3xl bg-zinc-900 p-1 border-2 border-zinc-800 shadow-2xl relative group">
                                <div className="w-full h-full rounded-2xl overflow-hidden bg-zinc-800 flex items-center justify-center">
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-black text-white">{profile.full_name?.[0]}</span>
                                    )}
                                </div>
                            </div>
                            <div className="mb-4">
                                <h1 className="text-3xl font-black tracking-tighter text-white">{profile.full_name}</h1>
                                <p className="text-zinc-500 font-bold text-xs uppercase tracking-[0.2em]">{profile.role.replace('_', ' ')} NODE</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats / Info Bar */}
                    <div className="mt-20 px-12 pb-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4">Official Identification</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 group">
                                            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.1em]">Email Coordinate</p>
                                                <p className="text-sm font-bold text-white">{profile.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 group">
                                            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.1em]">Nexus / Institute</p>
                                                <p className="text-sm font-bold text-white">{profile.institute_name}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4">Academic Protocol</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 group">
                                            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.1em]">Degree Level</p>
                                                <p className="text-sm font-bold text-white">{profile.education_level} - {profile.degree}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 group">
                                            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.1em]">Cycle / Year</p>
                                                <p className="text-sm font-bold text-white">{profile.academic_year}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-zinc-800/30 rounded-3xl p-8 border border-zinc-800 relative overflow-hidden flex flex-col justify-center">
                                <div className="relative z-10 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    </div>
                                    <h4 className="text-lg font-black text-white mb-2 uppercase tracking-tighter">Secure Authorization</h4>
                                    <p className="text-zinc-500 text-xs font-medium leading-relaxed mb-8 italic">Your node is currently active and verified. Security protocols are fully operational.</p>
                                    <Link href="/dashboard/profile/edit" className="inline-block px-10 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-all">Update Identity</Link>
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl -mr-16 -mt-16"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
