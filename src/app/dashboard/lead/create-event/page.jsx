'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/dashboard/Header'

export default function CreateEvent() {
    const searchParams = useSearchParams()
    const clubIdParam = searchParams.get('club')

    const [myClubs, setMyClubs] = useState([])
    const [selectedClubId, setSelectedClubId] = useState(clubIdParam || '')
    const [loading, setLoading] = useState(false)
    const [fetchingClubs, setFetchingClubs] = useState(true)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_date: '',
        location: '',
        status: 'published'
    })

    const router = useRouter()
    const supabase = createSupabaseClient()

    useEffect(() => {
        const fetchMyClubs = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data, error } = await supabase
                    .from('club_members')
                    .select(`
                        club_id,
                        clubs (id, name, is_approved)
                    `)
                    .eq('user_id', user.id)
                    .eq('role', 'lead')

                if (error) throw error

                const approvedClubs = data
                    ?.map(item => item.clubs)
                    .filter(club => club.is_approved) || []

                setMyClubs(approvedClubs)
                if (approvedClubs.length > 0 && !selectedClubId) {
                    setSelectedClubId(approvedClubs[0].id)
                }
            } catch (err) {
                console.error('Error fetching clubs:', err)
            } finally {
                setFetchingClubs(false)
            }
        }
        fetchMyClubs()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!selectedClubId) {
            setError('Please select a verified club first.')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase
                .from('events')
                .insert({
                    ...formData,
                    club_id: selectedClubId
                })

            if (error) throw error

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
                title="Event Dispatch"
                subtitle="Broadcast a new activity to the campus community"
            />

            <div className="px-10">
                <div className="max-w-4xl bg-white rounded-[2.5rem] p-12 shadow-xl border border-gray-100">
                    {success ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-[#22C55E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-black text-[#1E1E2D] mb-2">Event Published!</h2>
                            <p className="text-gray-500 font-medium">Your event is now live and visible to all students.</p>
                        </div>
                    ) : fetchingClubs ? (
                        <div className="flex flex-col items-center py-20">
                            <div className="w-10 h-10 border-4 border-[#22C55E]/20 border-t-[#22C55E] rounded-full animate-spin mb-4"></div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Identifying Authorized Clubs...</p>
                        </div>
                    ) : myClubs.length === 0 ? (
                        <div className="text-center py-12 bg-[#F8F9FB] rounded-[2rem] border-2 border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-black text-[#1E1E2D] mb-2">No Verified Clubs Found</h3>
                            <p className="text-gray-500 text-sm mb-6">You must lead at least one verified club to create events.</p>
                            <button onClick={() => router.push('/dashboard/lead/create-club')} className="px-6 py-3 bg-[#22C55E] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-[#16A34A] shadow-lg shadow-[#22C55E]/20">Apply for Club Lead</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Hosting Organization</label>
                                    <select
                                        required
                                        className="w-full bg-[#F8F9FB] border-2 border-transparent rounded-2xl px-6 py-4 text-gray-900 focus:bg-white focus:border-[#22C55E]/20 transition-all font-bold outline-none shadow-sm appearance-none"
                                        value={selectedClubId}
                                        onChange={(e) => setSelectedClubId(e.target.value)}
                                    >
                                        {myClubs.map(club => (
                                            <option key={club.id} value={club.id}>{club.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Event Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-[#F8F9FB] border-2 border-transparent rounded-2xl px-6 py-4 text-gray-900 focus:bg-white focus:border-[#22C55E]/20 transition-all font-bold outline-none placeholder:text-gray-300 shadow-sm"
                                        placeholder="e.g. Workshop on Smart Contracts"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className="w-full bg-[#F8F9FB] border-2 border-transparent rounded-2xl px-6 py-4 text-gray-900 focus:bg-white focus:border-[#22C55E]/20 transition-all font-bold outline-none shadow-sm"
                                        value={formData.event_date}
                                        onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Location</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-[#F8F9FB] border-2 border-transparent rounded-2xl px-6 py-4 text-gray-900 focus:bg-white focus:border-[#22C55E]/20 transition-all font-bold outline-none placeholder:text-gray-300 shadow-sm"
                                        placeholder="e.g. Block C, Room 402"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Detailed Description</label>
                                    <textarea
                                        rows="5"
                                        required
                                        className="w-full bg-[#F8F9FB] border-2 border-transparent rounded-3xl px-6 py-5 text-gray-900 focus:bg-white focus:border-[#22C55E]/20 transition-all font-medium outline-none placeholder:text-gray-300 shadow-sm"
                                        placeholder="What is this event about? Mention requirements, highlights, and agenda..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-500 px-6 py-4 rounded-2xl text-xs font-bold border border-red-100 italic">
                                    &gt; {error}
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-black py-5 rounded-2xl transition-all transform active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-[#22C55E]/20 flex items-center justify-center gap-3"
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <span>Publish Live Event</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
