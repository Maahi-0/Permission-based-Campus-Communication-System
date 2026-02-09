'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Header from '@/components/dashboard/Header'

export default function AddMember() {
    const [myClubs, setMyClubs] = useState([])
    const [selectedClubId, setSelectedClubId] = useState('')
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('member')
    const [loading, setLoading] = useState(false)
    const [fetchingClubs, setFetchingClubs] = useState(true)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

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

                const clubs = data?.map(item => item.clubs) || []
                setMyClubs(clubs)
                if (clubs.length > 0) {
                    setSelectedClubId(clubs[0].id)
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
            setError('Please select a club first.')
            return
        }

        setLoading(true)
        setError(null)

        try {
            // Find user by email
            const { data: profiles, error: searchError } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', email.toLowerCase().trim())
                .single()

            if (searchError || !profiles) {
                throw new Error('User not found. Please ensure they have registered on the platform.')
            }

            // Add member to club
            const { error: insertError } = await supabase
                .from('club_members')
                .insert({
                    club_id: selectedClubId,
                    user_id: profiles.id,
                    role: role
                })

            if (insertError) {
                if (insertError.code === '23505') {
                    throw new Error('This user is already a member of this club.')
                }
                throw insertError
            }

            setSuccess(true)
            setEmail('')
            setTimeout(() => {
                setSuccess(false)
            }, 3000)

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="pb-12 h-full">
            <Header
                title="Invitation Portal"
                subtitle="Add students to your club organization"
            />

            <div className="px-10">
                <div className="max-w-2xl bg-white rounded-[2.5rem] p-12 shadow-xl border border-gray-100">
                    {fetchingClubs ? (
                        <div className="flex flex-col items-center py-20">
                            <div className="w-10 h-10 border-4 border-[#0b87bd]/20 border-t-[#0b87bd] rounded-full animate-spin mb-4"></div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Your Clubs...</p>
                        </div>
                    ) : myClubs.length === 0 ? (
                        <div className="text-center py-12 bg-[#f5f7f9] rounded-[2rem] border-2 border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-black text-[#1E1E2D] mb-2">No Clubs Found</h3>
                            <p className="text-gray-500 text-sm mb-6">You must lead at least one club to add members.</p>
                            <button onClick={() => router.push('/dashboard/lead/create-club')} className="px-6 py-3 bg-[#0b87bd] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-[#096a96] shadow-lg shadow-[#0b87bd]/20">Create Your Club</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Select Club</label>
                                    <select
                                        required
                                        className="w-full bg-[#f5f7f9] border-2 border-transparent rounded-2xl px-6 py-4 text-gray-900 focus:bg-white focus:border-[#0b87bd]/20 transition-all font-bold outline-none shadow-sm appearance-none"
                                        value={selectedClubId}
                                        onChange={(e) => setSelectedClubId(e.target.value)}
                                    >
                                        {myClubs.map(club => (
                                            <option key={club.id} value={club.id}>
                                                {club.name} {!club.is_approved && '(Pending Verification)'}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Student Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-[#f5f7f9] border-2 border-transparent rounded-2xl px-6 py-4 text-gray-900 focus:bg-white focus:border-[#0b87bd]/20 transition-all font-bold outline-none placeholder:text-gray-300 shadow-sm"
                                        placeholder="student@university.edu"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <p className="text-[10px] text-gray-400 font-medium pl-1">The student must already have an account on Campus Connect</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Member Role</label>
                                    <select
                                        className="w-full bg-[#f5f7f9] border-2 border-transparent rounded-2xl px-6 py-4 text-gray-900 focus:bg-white focus:border-[#0b87bd]/20 transition-all font-bold outline-none shadow-sm appearance-none"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                    >
                                        <option value="member">Regular Member</option>
                                        <option value="lead">Co-Lead / Administrator</option>
                                    </select>
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

                            {success && (
                                <div className="bg-[#0b87bd]/10 text-[#0b87bd] px-6 py-4 rounded-2xl text-xs font-bold border border-[#0b87bd]/20 flex items-center gap-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Member added successfully!
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#0b87bd] hover:bg-[#096a96] text-white font-black py-5 rounded-2xl transition-all transform active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-[#0b87bd]/20 flex items-center justify-center gap-3"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Adding Member...</span>
                                        </>
                                    ) : (
                                        <span>Add to Club</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="max-w-2xl mt-8 p-6 rounded-2xl bg-blue-50 border border-blue-100">
                    <h3 className="text-blue-600 font-black mb-2 flex items-center gap-2 text-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        How It Works
                    </h3>
                    <p className="text-gray-600 text-xs leading-relaxed">
                        Enter the email address of a registered Campus Connect user. They will be immediately added to your club roster.
                        Members can view club events and participate in activities. Co-Leads can help manage the club and create events.
                    </p>
                </div>
            </div>
        </div>
    )
}
