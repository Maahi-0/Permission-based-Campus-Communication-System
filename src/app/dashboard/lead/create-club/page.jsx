'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Header from '@/components/dashboard/Header'

export default function CreateClub() {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
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

            // 1. Insert the club
            const { data: club, error: clubError } = await supabase
                .from('clubs')
                .insert({ name, description, is_approved: false })
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
                router.refresh()
            }, 2000)

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="pb-12 h-full">
            <Header
                title="Club Registration"
                subtitle="Apply to lead a new campus organization"
            />

            <div className="px-10">
                <div className="max-w-3xl bg-white rounded-[2.5rem] p-12 shadow-xl border border-gray-100">
                    {success ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-[#22C55E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-black text-[#1E1E2D] mb-2">Application Submitted!</h2>
                            <p className="text-gray-500 font-medium">Your club is now pending verification by administration.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Organization Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-[#F8F9FB] border-2 border-transparent rounded-2xl px-6 py-4 text-gray-900 focus:bg-white focus:border-[#22C55E]/20 transition-all font-bold outline-none placeholder:text-gray-300 shadow-sm"
                                        placeholder="e.g. Robotics & AI Club"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">About the Club</label>
                                    <textarea
                                        rows="6"
                                        required
                                        className="w-full bg-[#F8F9FB] border-2 border-transparent rounded-3xl px-6 py-5 text-gray-900 focus:bg-white focus:border-[#22C55E]/20 transition-all font-medium outline-none placeholder:text-gray-300 shadow-sm"
                                        placeholder="Explain the club's mission, objective, and planned activities for the student body..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-500 px-6 py-4 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#1E1E2D] hover:bg-black text-white font-black py-5 rounded-2xl transition-all transform active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-black/10 flex items-center justify-center gap-3"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <span>Submit Registration Request</span>
                                    )}
                                </button>
                                <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-6">
                                    Verification usually takes 24-48 business hours
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
