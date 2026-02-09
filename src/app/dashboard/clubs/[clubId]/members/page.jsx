'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ManageMembers() {
    const { clubId } = useParams()
    const [members, setMembers] = useState([])
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(true)
    const [isLead, setIsLead] = useState(false)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const supabase = createSupabaseClient()

    useEffect(() => {
        fetchData()
    }, [clubId])

    const fetchData = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Check if lead
            const { data: membership } = await supabase
                .from('club_members')
                .select('role')
                .eq('club_id', clubId)
                .eq('user_id', user.id)
                .single()

            if (membership?.role !== 'lead') {
                setIsLead(false)
                return
            }
            setIsLead(true)

            // 2. Fetch members
            const { data: membersData } = await supabase
                .from('club_members')
                .select(`
                  role,
                  user_id,
                  profiles (
                    full_name,
                    email,
                    role
                  )
                `)
                .eq('club_id', clubId)

            setMembers(membersData || [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleAddMember = async (e) => {
        e.preventDefault()
        setMessage(null)
        setError(null)

        try {
            // Find user by email
            const { data: profile, error: searchError } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', email)
                .single()

            if (searchError || !profile) {
                throw new Error('User not found with that email address.')
            }

            const { error: insertError } = await supabase
                .from('club_members')
                .insert({
                    club_id: clubId,
                    user_id: profile.id,
                    role: 'member'
                })

            if (insertError) throw insertError

            setMessage('Member added successfully!')
            setEmail('')
            fetchData()
        } catch (err) {
            setError(err.message)
        }
    }

    if (loading) return <div className="p-20 text-center">Loading...</div>
    if (!isLead) return <div className="p-20 text-center text-red-500">Access Denied. Only Club Leads can manage members.</div>

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="mb-10">
                <Link href={`/dashboard/clubs/${clubId}`} className="text-sm text-gray-500 hover:text-primary transition-colors mb-4 inline-block">
                    &larr; Back to Club
                </Link>
                <h1 className="text-4xl font-bold gradient-text">Manage Club Members</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="glass p-6 rounded-2xl border border-white/10 shadow-xl">
                        <h3 className="text-xl font-bold mb-4">Add Member</h3>
                        <form onSubmit={handleAddMember} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">User Email</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="user@college.edu"
                                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <button className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20">
                                Add to Club
                            </button>
                            {error && <p className="text-red-500 text-xs mt-2 bg-red-500/10 p-2 rounded">{error}</p>}
                            {message && <p className="text-green-500 text-xs mt-2 bg-green-500/10 p-2 rounded">{message}</p>}
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="glass rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                        <table className="w-full">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Club Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {members.map((member) => (
                                    <tr key={member.user_id} className="hover:bg-white/2 transition-colors">
                                        <td className="px-6 py-4 text-white font-medium">{member.profiles?.full_name}</td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">{member.profiles?.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${member.role === 'lead' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-gray-500/10 text-gray-500 border border-white/5'}`}>
                                                {member.role}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
