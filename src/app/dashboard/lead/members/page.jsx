'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/dashboard/Header'

export default function Members() {
    const searchParams = useSearchParams()
    const clubIdParam = searchParams.get('club')

    const [myClubs, setMyClubs] = useState([])
    const [selectedClubId, setSelectedClubId] = useState(clubIdParam || '')
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [removingMember, setRemovingMember] = useState(null)

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
                        clubs (id, name)
                    `)
                    .eq('user_id', user.id)
                    .eq('role', 'lead')

                if (error) throw error

                const clubs = data?.map(item => item.clubs) || []
                setMyClubs(clubs)
                if (clubs.length > 0 && !selectedClubId) {
                    setSelectedClubId(clubs[0].id)
                }
            } catch (err) {
                console.error('Error fetching clubs:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchMyClubs()
    }, [])

    useEffect(() => {
        if (selectedClubId) {
            fetchMembers()
        }
    }, [selectedClubId])

    const fetchMembers = async () => {
        try {
            const { data, error } = await supabase
                .from('club_members')
                .select(`
                    user_id,
                    role,
                    profiles (full_name, email, avatar_url)
                `)
                .eq('club_id', selectedClubId)

            if (error) throw error
            setMembers(data || [])
        } catch (err) {
            console.error('Error fetching members:', err)
        }
    }

    const handleRemoveMember = async (userId) => {
        if (!confirm('Are you sure you want to remove this member from the club?')) return

        setRemovingMember(userId)
        try {
            const { error } = await supabase
                .from('club_members')
                .delete()
                .eq('club_id', selectedClubId)
                .eq('user_id', userId)

            if (error) throw error

            await fetchMembers()
        } catch (err) {
            console.error('Error removing member:', err)
            alert('Failed to remove member: ' + err.message)
        } finally {
            setRemovingMember(null)
        }
    }

    const handleRoleChange = async (userId, newRole) => {
        try {
            const { error } = await supabase
                .from('club_members')
                .update({ role: newRole })
                .eq('club_id', selectedClubId)
                .eq('user_id', userId)

            if (error) throw error

            await fetchMembers()
        } catch (err) {
            console.error('Error updating role:', err)
            alert('Failed to update role: ' + err.message)
        }
    }

    return (
        <div className="pb-12 h-full">
            <Header
                title="Member Management"
                subtitle="View and manage your club roster"
            />

            <div className="px-10">
                {loading ? (
                    <div className="flex flex-col items-center py-20">
                        <div className="w-10 h-10 border-4 border-[#22C55E]/20 border-t-[#22C55E] rounded-full animate-spin mb-4"></div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading...</p>
                    </div>
                ) : myClubs.length === 0 ? (
                    <div className="max-w-2xl bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-black text-[#1E1E2D] mb-2">No Clubs Found</h3>
                        <p className="text-gray-500 text-sm mb-6">You must lead at least one club to manage members.</p>
                        <button onClick={() => router.push('/dashboard/lead/create-club')} className="px-6 py-3 bg-[#22C55E] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-[#16A34A] shadow-lg shadow-[#22C55E]/20">Create Your Club</button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <select
                                className="bg-white border-2 border-gray-100 rounded-2xl px-6 py-3 text-gray-900 font-bold outline-none shadow-sm appearance-none hover:border-[#22C55E]/20 transition-all"
                                value={selectedClubId}
                                onChange={(e) => setSelectedClubId(e.target.value)}
                            >
                                {myClubs.map(club => (
                                    <option key={club.id} value={club.id}>{club.name}</option>
                                ))}
                            </select>

                            <button
                                onClick={() => router.push('/dashboard/lead/add-member')}
                                className="px-6 py-3 bg-[#22C55E] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#22C55E]/20 hover:bg-[#16A34A] transition-all flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Member
                            </button>
                        </div>

                        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                            {members.length === 0 ? (
                                <div className="p-16 text-center">
                                    <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No members yet</p>
                                    <button
                                        onClick={() => router.push('/dashboard/lead/add-member')}
                                        className="mt-4 text-[#22C55E] font-bold text-sm hover:underline"
                                    >
                                        Add your first member
                                    </button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-[#F8F9FB] border-b border-gray-100">
                                            <tr>
                                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Member</th>
                                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</th>
                                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {members.map((member) => (
                                                <tr key={member.user_id} className="hover:bg-[#F8F9FB]/50 transition-colors">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-[#22C55E]/10 flex items-center justify-center overflow-hidden">
                                                                {member.profiles?.avatar_url ? (
                                                                    <img src={member.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="text-[#22C55E] font-black text-sm">
                                                                        {member.profiles?.full_name?.[0]?.toUpperCase() || 'U'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="font-bold text-gray-900">{member.profiles?.full_name || 'Unknown'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-gray-500 text-sm font-medium">{member.profiles?.email || 'N/A'}</span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <select
                                                            value={member.role}
                                                            onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                                                            className="bg-transparent border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 outline-none hover:border-[#22C55E]/30 transition-all"
                                                        >
                                                            <option value="member">Member</option>
                                                            <option value="lead">Lead</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <button
                                                            onClick={() => handleRemoveMember(member.user_id)}
                                                            disabled={removingMember === member.user_id}
                                                            className="text-red-500 hover:text-red-700 font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
                                                        >
                                                            {removingMember === member.user_id ? 'Removing...' : 'Remove'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-gray-100">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-black text-gray-900 mb-1 text-sm">Member Count: {members.length}</h4>
                                    <p className="text-gray-500 text-xs leading-relaxed">
                                        You can promote members to Co-Lead status to help manage the club. Co-Leads can create events and add new members.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
