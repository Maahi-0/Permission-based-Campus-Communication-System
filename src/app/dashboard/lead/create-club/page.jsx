'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Header from '@/components/dashboard/Header'

export default function CreateClub() {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [logoFile, setLogoFile] = useState(null)
    const [coverFile, setCoverFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    const router = useRouter()
    const supabase = createSupabaseClient()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Authentication required')

            let logoUrl = ''
            let coverUrl = ''

            // Upload Logo if exists
            if (logoFile) {
                const ext = logoFile.name.split('.').pop()
                const path = `club-logos/${Date.now()}.${ext}`
                const { error: uploadError } = await supabase.storage.from('clubs').upload(path, logoFile)
                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage.from('clubs').getPublicUrl(path)
                    logoUrl = publicUrl
                }
            }

            // Upload Cover if exists
            if (coverFile) {
                const ext = coverFile.name.split('.').pop()
                const path = `club-covers/${Date.now()}.${ext}`
                const { error: uploadError } = await supabase.storage.from('clubs').upload(path, coverFile)
                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage.from('clubs').getPublicUrl(path)
                    coverUrl = publicUrl
                }
            }

            // 1. Insert the club
            const { data: club, error: clubError } = await supabase
                .from('clubs')
                .insert({
                    name,
                    description,
                    is_approved: false,
                    logo_url: logoUrl,
                    cover_image: coverUrl
                })
                .select()
                .single()

            if (clubError) throw clubError

            // 2. Add the user as lead
            const { error: memberError } = await supabase
                .from('club_members')
                .insert({
                    club_id: club.id,
                    user_id: user.id,
                    role: 'lead'
                })

            if (memberError) throw memberError

            setSuccess(true)
            setTimeout(() => {
                router.push('/dashboard/lead')
            }, 2000)

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="pb-12 text-white">
            <Header
                title="Club Registration"
                subtitle="INITIALIZE NEW CAMPUS SECTOR"
            />

            <div className="max-w-4xl mx-auto">
                <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 md:p-16 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 blur-3xl -mr-48 -mt-48"></div>

                    {success ? (
                        <div className="text-center py-20 relative z-10">
                            <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce">
                                <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Transmission Successful</h2>
                            <p className="text-zinc-500 font-medium italic">Your club application is now being processed by terminal administration.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-1">Organization Callsign</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-zinc-800/30 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:bg-zinc-800 focus:border-white transition-all font-bold outline-none placeholder:text-zinc-700"
                                            placeholder="e.g. Robotics Collective"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-1">Mission Briefing</label>
                                        <textarea
                                            rows="8"
                                            required
                                            className="w-full bg-zinc-800/30 border border-zinc-800 rounded-[2rem] px-6 py-6 text-white focus:bg-zinc-800 focus:border-white transition-all font-medium outline-none placeholder:text-zinc-700 leading-relaxed italic"
                                            placeholder="Describe the club's objectives and intended operational frequency..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-1">Visual Identity (Logo)</label>
                                        <input type="file" id="logo-up" className="hidden" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
                                        <label htmlFor="logo-up" className="w-full h-24 bg-zinc-800/30 border border-zinc-800 border-dashed rounded-2xl flex items-center justify-center cursor-pointer hover:border-white hover:bg-zinc-800 transition-all group overflow-hidden">
                                            {logoFile ? (
                                                <span className="text-xs font-black text-white truncate px-6">{logoFile.name}</span>
                                            ) : (
                                                <div className="flex flex-col items-center gap-1">
                                                    <svg className="w-6 h-6 text-zinc-700 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                                    <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest group-hover:text-white">Upload Vector</span>
                                                </div>
                                            )}
                                        </label>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-1">Cover Graphic</label>
                                        <input type="file" id="cover-up" className="hidden" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} />
                                        <label htmlFor="cover-up" className="w-full h-40 bg-zinc-800/30 border border-zinc-800 border-dashed rounded-2xl flex items-center justify-center cursor-pointer hover:border-white hover:bg-zinc-800 transition-all group">
                                            {coverFile ? (
                                                <span className="text-xs font-black text-white truncate px-6">{coverFile.name}</span>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2">
                                                    <svg className="w-8 h-8 text-zinc-700 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest group-hover:text-white">Upload Wide Graphic</span>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black tracking-widest uppercase italic">
                                    PROTOCOL_ERROR: {error}
                                </div>
                            )}

                            <div className="pt-6 border-t border-zinc-800 flex flex-col items-center">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full max-w-md bg-white text-black font-black py-6 rounded-2xl transition-all shadow-xl shadow-white/5 hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-50 text-xs uppercase tracking-[0.4em]"
                                >
                                    {loading ? "INITIALIZING SECTOR..." : "Authorize Registry Request"}
                                </button>
                                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em] mt-8 italic">
                                    Verification cycles typically resolve within 48 standard hours
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
