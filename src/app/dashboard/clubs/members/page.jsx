'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

export default function ClubMembersViewer() {
    const [clubs, setClubs] = useState([])
    const [selectedClub, setSelectedClub] = useState(null)
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [membersLoading, setMembersLoading] = useState(false)
    const supabase = createSupabaseClient()

    useEffect(() => {
        fetchClubs()
    }, [])

    const fetchClubs = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('clubs')
            .select('*')
            .eq('is_approved', true)

        if (data) {
            setClubs(data)
            if (data.length > 0) {
                handleClubSelect(data[0])
            }
        }
        setLoading(false)
    }

    const handleClubSelect = async (club) => {
        setSelectedClub(club)
        setMembersLoading(true)
        const { data, error } = await supabase
            .from('club_members')
            .select(`
                role,
                profiles (
                    id,
                    full_name,
                    email,
                    avatar_url,
                    institute_name
                )
            `)
            .eq('club_id', club.id)

        if (data) {
            setMembers(data)
        }
        setMembersLoading(false)
    }

    const lead = members.find(m => m.role === 'lead')
    const generalMembers = members.filter(m => m.role !== 'lead')

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            <div className="max-w-7xl mx-auto px-6 pt-12">
                <div className="mb-12">
                    <h1 className="text-4xl font-black gradient-text tracking-tighter mb-4">Club Directories</h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Select a community to view its hierarchy</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Club Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6 px-2">Verified Communities</h2>
                        <div className="space-y-2">
                            {clubs.map(club => (
                                <button
                                    key={club.id}
                                    onClick={() => handleClubSelect(club)}
                                    className={`w-full text-left p-4 rounded-2xl transition-all border ${selectedClub?.id === club.id
                                        ? 'bg-primary/10 border-primary/50 text-white shadow-lg shadow-primary/10'
                                        : 'bg-white/[0.02] border-white/5 text-gray-400 hover:bg-white/5 hover:border-white/10'
                                        }`}
                                >
                                    <div className="font-black text-sm">{club.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Members Content */}
                    <div className="lg:col-span-3">
                        {selectedClub ? (
                            <div className="animate-fade-in">
                                {membersLoading ? (
                                    <div className="flex items-center justify-center h-64">
                                        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    <div className="space-y-12">
                                        {/* Lead Section */}
                                        <section>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8 px-1">Club Leadership</h3>
                                            {lead ? (
                                                <div className="glass-card p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-transparent border-primary/20 flex flex-col md:flex-row items-center gap-8">
                                                    <div className="relative group">
                                                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                                        <div className="relative w-32 h-32 rounded-full overflow-hidden bg-black border-2 border-white/10">
                                                            {lead.profiles?.avatar_url ? (
                                                                <img
                                                                    src={lead.profiles.avatar_url}
                                                                    alt={lead.profiles.full_name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white/20">
                                                                    {lead.profiles?.full_name?.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="absolute bottom-0 right-0 bg-primary text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border-2 border-black">
                                                            Lead
                                                        </div>
                                                    </div>
                                                    <div className="text-center md:text-left flex-grow">
                                                        <h4 className="text-3xl font-black text-white mb-2 tracking-tight">{lead.profiles?.full_name}</h4>
                                                        <p className="text-primary font-bold uppercase tracking-[0.2em] text-xs mb-4">{lead.profiles?.institute_name || 'Academic Institution Not Specified'}</p>
                                                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                                            <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                                {lead.profiles?.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="glass-card p-12 text-center rounded-[2.5rem] border-dashed border-white/5 text-gray-600 font-bold uppercase tracking-widest text-xs">
                                                    No leadership assigned to this community
                                                </div>
                                            )}
                                        </section>

                                        {/* Members Section */}
                                        <section>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-8 px-1">Co-Working Members</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {generalMembers.length > 0 ? (
                                                    generalMembers.map(member => (
                                                        <div key={member.profiles?.id} className="glass-card p-6 rounded-[2rem] border border-white/5 hover:bg-white/[0.03] transition-all flex items-center gap-6 group">
                                                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black border border-white/5 flex-shrink-0 group-hover:border-primary/50 transition-colors">
                                                                {member.profiles?.avatar_url ? (
                                                                    <img
                                                                        src={member.profiles.avatar_url}
                                                                        alt={member.profiles.full_name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-xl font-black text-white/10 group-hover:text-primary/30">
                                                                        {member.profiles?.full_name?.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-black text-white text-lg tracking-tight group-hover:text-primary transition-colors">{member.profiles?.full_name}</h4>
                                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{member.profiles?.institute_name || 'Institute Pending'}</p>
                                                                <p className="text-[10px] font-bold text-gray-600 truncate max-w-[150px]">{member.profiles?.email}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="col-span-full glass-card p-12 text-center rounded-[2.5rem] border-dashed border-white/5 text-gray-700 font-bold uppercase tracking-widest text-[10px]">
                                                        Operational network expanding...
                                                    </div>
                                                )}
                                            </div>
                                        </section>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-20 glass-card rounded-[3rem] border-dashed border-white/5">
                                <div className="text-6xl mb-8 opacity-20">🛡️</div>
                                <h3 className="text-xl font-bold text-gray-500 uppercase tracking-widest">Protocol Stalled</h3>
                                <p className="text-gray-700 text-sm mt-4 max-w-xs font-medium">Select a verified campus organization from the directory to initialize data transmission.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
