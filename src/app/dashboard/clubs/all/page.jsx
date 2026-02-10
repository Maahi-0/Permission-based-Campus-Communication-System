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
        <div className="pb-12 h-full">
            <Header
                title="Campus Clubs"
                subtitle="Explore all student organizations"
            />

            <div className="px-10">
                {/* Filter Tabs */}
                <div className="flex items-center gap-2 mb-8">
                    {['all', 'verified', 'pending'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === status
                                ? 'bg-[#0b87bd] text-white shadow-lg shadow-[#0b87bd]/20'
                                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center py-20">
                        <div className="w-10 h-10 border-4 border-[#0b87bd]/20 border-t-[#0b87bd] rounded-full animate-spin mb-4"></div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Clubs...</p>
                    </div>
                ) : clubs.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-16 text-center border-2 border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-black text-[#1E1E2D] mb-2">No Clubs Found</h3>
                        <p className="text-gray-500 text-sm">
                            {filter === 'all'
                                ? "No clubs have been registered yet."
                                : `No ${filter} clubs found.`}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {clubs.map((club) => (
                            <Link
                                key={club.id}
                                href={`/dashboard/clubs/${club.id}`}
                                className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl transition-all group cursor-pointer"
                            >
                                {/* Cover Image */}
                                <div className="h-40 bg-gradient-to-br from-[#0b87bd]/10 to-[#096a96]/5 relative overflow-hidden">
                                    {club.cover_image ? (
                                        <img
                                            src={club.cover_image}
                                            alt={club.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="w-16 h-16 text-[#0b87bd]/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Status Badge */}
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-sm ${club.is_approved
                                            ? 'bg-[#0b87bd]/90 text-white border-white/20'
                                            : 'bg-orange-500/90 text-white border-white/20'
                                            }`}>
                                            {club.is_approved ? 'Verified' : 'Pending'}
                                        </span>
                                    </div>

                                    {/* Logo */}
                                    {club.logo_url && (
                                        <div className="absolute bottom-0 left-6 transform translate-y-1/2">
                                            <div className="w-16 h-16 rounded-2xl bg-white border-4 border-white shadow-xl overflow-hidden">
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
                                <div className="p-6 pt-8">
                                    <h3 className="text-xl font-black text-[#1E1E2D] mb-2 group-hover:text-[#0b87bd] transition-colors line-clamp-1">
                                        {club.name}
                                    </h3>

                                    <p className="text-sm text-gray-600 font-medium line-clamp-2 mb-6 leading-relaxed">
                                        {club.description || 'No description available'}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-2">
                                                {club.leads.slice(0, 3).map((lead, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="w-8 h-8 rounded-full border-2 border-white bg-[#0b87bd]/10 overflow-hidden"
                                                    >
                                                        {lead?.avatar_url ? (
                                                            <img
                                                                src={lead.avatar_url}
                                                                alt={lead.full_name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[#0b87bd] text-xs font-black">
                                                                {lead?.full_name?.[0]?.toUpperCase() || 'L'}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-xs font-bold text-gray-500">
                                                {club.leads.length} {club.leads.length === 1 ? 'Lead' : 'Leads'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <span className="text-xs font-bold">{club.memberCount}</span>
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
