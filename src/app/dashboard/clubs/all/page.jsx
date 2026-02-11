'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Header from '@/components/dashboard/Header'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function AllClubs() {
    const [clubs, setClubs] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // all, verified, pending

    const router = useRouter()
    const supabase = createSupabaseClient()

    useEffect(() => {
        fetchClubs()
    }, [filter])

    const fetchClubs = async () => {
        try {
            let query = supabase
                .from('clubs')
                .select(`
                    *,
                    club_members (
                        user_id,
                        role,
                        profiles (full_name, avatar_url)
                    )
                `)
                .order('created_at', { ascending: false })

            if (filter === 'verified') {
                query = query.eq('is_approved', true)
            } else if (filter === 'pending') {
                query = query.eq('is_approved', false)
            }

            const { data, error } = await query

            if (error) throw error

            // Process data to get member count and leads
            const processedClubs = data?.map(club => {
                const members = club.club_members || []
                const leads = members.filter(m => m.role === 'lead')
                return {
                    ...club,
                    memberCount: members.length,
                    leads: leads.map(l => l.profiles)
                }
            }) || []

            setClubs(processedClubs)
        } catch (err) {
            console.error('Error fetching clubs:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="pb-12 text-white">
            <Header
                title="Campus Clubs"
                subtitle="EXPLORE ALL LOGICAL NODES"
            />

            <div className="">
                {/* Filter Tabs */}
                <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-4 scrollbar-none">
                    {['all', 'verified', 'pending'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border ${filter === status
                                ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                                : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-white hover:border-zinc-600'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center py-32">
                        <div className="w-12 h-12 border-2 border-zinc-800 border-t-white rounded-full animate-spin mb-6"></div>
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] animate-pulse">Syncing Registry...</p>
                    </div>
                ) : clubs.length === 0 ? (
                    <div className="bg-zinc-900/50 rounded-[2.5rem] p-24 text-center border border-zinc-800 border-dashed">
                        <div className="w-20 h-20 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-8">
                            <svg className="w-10 h-10 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tighter">void_signal</h3>
                        <p className="text-zinc-500 text-sm font-medium">
                            {filter === 'all'
                                ? "No clubs have been initialized in this sector."
                                : `No ${filter} frequencies detected.`}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {clubs.map((club) => (
                            <Link
                                key={club.id}
                                href={`/dashboard/clubs/${club.id}`}
                                className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden hover:border-zinc-700 hover:bg-zinc-900/80 transition-all group flex flex-col h-full"
                            >
                                {/* Cover Image */}
                                <div className="h-44 bg-zinc-800 relative overflow-hidden shrink-0">
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent z-10 opacity-60"></div>
                                    {club.cover_image ? (
                                        <img
                                            src={club.cover_image}
                                            alt={club.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-900 to-zinc-900">
                                            <svg className="w-16 h-16 text-zinc-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Status Badge */}
                                    <div className="absolute top-6 right-6 z-20">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border backdrop-blur-md ${club.is_approved
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                            }`}>
                                            {club.is_approved ? 'Verified' : 'Pending'}
                                        </span>
                                    </div>

                                    {/* Logo */}
                                    {club.logo_url && (
                                        <div className="absolute bottom-0 left-8 transform translate-y-1/2 z-20">
                                            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border-4 border-zinc-900 shadow-2xl overflow-hidden">
                                                <img
                                                    src={club.logo_url}
                                                    alt={`${club.name} logo`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-8 pt-10 flex flex-col flex-grow">
                                    <h3 className="text-2xl font-black text-white mb-3 group-hover:text-purple-400 transition-colors line-clamp-1 tracking-tighter uppercase">
                                        {club.name}
                                    </h3>

                                    <p className="text-sm text-zinc-500 font-medium line-clamp-2 mb-8 leading-relaxed italic">
                                        {club.description || 'No data broadcast found.'}
                                    </p>

                                    {/* Stats */}
                                    <div className="mt-auto pt-6 border-t border-zinc-800 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex -space-x-2">
                                                {club.leads.slice(0, 3).map((lead, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="w-8 h-8 rounded-lg border-2 border-zinc-900 bg-zinc-800 overflow-hidden shrink-0"
                                                    >
                                                        {lead?.avatar_url ? (
                                                            <img
                                                                src={lead.avatar_url}
                                                                alt={lead.full_name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-zinc-500 text-[10px] font-black">
                                                                {lead?.full_name?.[0]?.toUpperCase() || 'L'}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                                                {club.leads.length} {club.leads.length === 1 ? 'Lead' : 'Leads'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800/50 rounded-lg text-zinc-400">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <span className="text-xs font-black">{club.memberCount}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
