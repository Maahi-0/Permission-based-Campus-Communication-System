'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/dashboard/Header'
import Link from 'next/link'

export default function ClubDetail() {
    const { clubId } = useParams()
    const router = useRouter()
    const supabase = createSupabaseClient()

    const [club, setClub] = useState(null)
    const [members, setMembers] = useState([])
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [isLead, setIsLead] = useState(false)
    const [currentUser, setCurrentUser] = useState(null)

    // Image upload states
    const [uploadingCover, setUploadingCover] = useState(false)
    const [uploadingLogo, setUploadingLogo] = useState(false)

    useEffect(() => {
        fetchClubData()
    }, [clubId])

    const fetchClubData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUser(user)

            // Fetch club details
            const { data: clubData, error: clubError } = await supabase
                .from('clubs')
                .select('*')
                .eq('id', clubId)
                .single()

            if (clubError) throw clubError
            setClub(clubData)

            // Fetch members
            const { data: membersData, error: membersError } = await supabase
                .from('club_members')
                .select(`
                    user_id,
                    role,
                    profiles (full_name, email, avatar_url, institute_name)
                `)
                .eq('club_id', clubId)

            if (membersError) throw membersError
            setMembers(membersData || [])

            // Check if current user is a lead
            const userIsLead = membersData?.some(m => m.user_id === user?.id && m.role === 'lead')
            setIsLead(userIsLead)

            // Fetch events
            const { data: eventsData, error: eventsError } = await supabase
                .from('events')
                .select('*')
                .eq('club_id', clubId)
                .eq('status', 'published')
                .order('event_date', { ascending: true })

            if (eventsError) throw eventsError
            setEvents(eventsData || [])

        } catch (err) {
            console.error('Error fetching club data:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = async (file, type) => {
        if (!file || !isLead) return

        const setUploading = type === 'cover' ? setUploadingCover : setUploadingLogo
        setUploading(true)

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${clubId}-${type}-${Date.now()}.${fileExt}`
            const filePath = `clubs/${fileName}`

            // Upload to storage
            const { error: uploadError } = await supabase.storage
                .from('profiles')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('profiles')
                .getPublicUrl(filePath)

            // Update club record
            const updateField = type === 'cover' ? 'cover_image' : 'logo_url'
            const { error: updateError } = await supabase
                .from('clubs')
                .update({ [updateField]: publicUrl })
                .eq('id', clubId)

            if (updateError) throw updateError

            await fetchClubData()
        } catch (err) {
            console.error('Error uploading image:', err)
            alert('Failed to upload image: ' + err.message)
        } finally {
            setUploading(false)
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-[#22C55E]/20 border-t-[#22C55E] rounded-full animate-spin mb-4"></div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Club...</p>
            </div>
        )
    }

    if (!club) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-2xl font-black text-gray-900 mb-2">Club Not Found</h2>
                <Link href="/dashboard/clubs/all" className="text-[#22C55E] font-bold hover:underline">
                    ← Back to All Clubs
                </Link>
            </div>
        )
    }

    const leads = members.filter(m => m.role === 'lead')
    const regularMembers = members.filter(m => m.role === 'member')

    return (
        <div className="pb-12">
            {/* Cover Image Section */}
            <div className="relative h-80 bg-gradient-to-br from-[#22C55E]/10 to-[#16A34A]/5 overflow-hidden">
                {club.cover_image ? (
                    <img
                        src={club.cover_image}
                        alt={club.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-32 h-32 text-[#22C55E]/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                {/* Upload Cover Button (Leads Only) */}
                {isLead && (
                    <label className="absolute top-6 right-6 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-900 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-white transition-all shadow-lg flex items-center gap-2">
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e.target.files[0], 'cover')}
                            disabled={uploadingCover}
                        />
                        {uploadingCover ? (
                            <>
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin"></div>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Change Cover
                            </>
                        )}
                    </label>
                )}

                {/* Back Button */}
                <Link
                    href="/dashboard/clubs/all"
                    className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </Link>
            </div>

            {/* Club Info Section */}
            <div className="px-10 -mt-16 relative z-10">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-gray-100">
                    <div className="flex items-start gap-6 mb-8">
                        {/* Logo */}
                        <div className="relative">
                            <div className="w-32 h-32 rounded-3xl bg-white border-4 border-white shadow-xl overflow-hidden">
                                {club.logo_url ? (
                                    <img
                                        src={club.logo_url}
                                        alt={`${club.name} logo`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#22C55E]/10 to-[#16A34A]/5 flex items-center justify-center">
                                        <span className="text-4xl font-black text-[#22C55E]">
                                            {club.name[0]?.toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Upload Logo Button (Leads Only) */}
                            {isLead && (
                                <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#22C55E] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#16A34A] transition-all shadow-lg border-4 border-white">
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e.target.files[0], 'logo')}
                                        disabled={uploadingLogo}
                                    />
                                    {uploadingLogo ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </label>
                            )}
                        </div>

                        {/* Club Details */}
                        <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="text-4xl font-black text-[#1E1E2D] mb-2">{club.name}</h1>
                                    <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${club.is_approved
                                            ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20'
                                            : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                                        }`}>
                                        {club.is_approved ? '✓ Verified Club' : 'Pending Verification'}
                                    </span>
                                </div>

                                {isLead && (
                                    <Link
                                        href={`/dashboard/lead/members?club=${clubId}`}
                                        className="px-6 py-3 bg-[#22C55E] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#16A34A] transition-all shadow-lg shadow-[#22C55E]/20"
                                    >
                                        Manage Club
                                    </Link>
                                )}
                            </div>

                            <p className="text-gray-600 font-medium leading-relaxed mb-6">
                                {club.description || 'No description available for this club.'}
                            </p>

                            {/* Stats */}
                            <div className="flex items-center gap-8">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-gray-900">{members.length}</p>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Members</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-gray-900">{events.length}</p>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Events</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Members List */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Club Leads */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-black text-[#1E1E2D] mb-6 flex items-center gap-2">
                                <svg className="w-6 h-6 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                                Club Leadership
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {leads.map((member) => (
                                    <div key={member.user_id} className="flex items-center gap-4 p-4 bg-[#F8F9FB] rounded-2xl hover:bg-gray-50 transition-all">
                                        <div className="w-14 h-14 rounded-xl bg-[#22C55E]/10 overflow-hidden flex-shrink-0">
                                            {member.profiles?.avatar_url ? (
                                                <img
                                                    src={member.profiles.avatar_url}
                                                    alt={member.profiles.full_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[#22C55E] text-xl font-black">
                                                    {member.profiles?.full_name?.[0]?.toUpperCase() || 'L'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-gray-900 truncate">{member.profiles?.full_name || 'Unknown'}</p>
                                            <p className="text-xs text-gray-500 font-medium truncate">{member.profiles?.email}</p>
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-[#22C55E]/10 text-[#22C55E] rounded text-[9px] font-black uppercase tracking-widest">
                                                Lead
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Regular Members */}
                        {regularMembers.length > 0 && (
                            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                                <h2 className="text-xl font-black text-[#1E1E2D] mb-6">Members ({regularMembers.length})</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {regularMembers.map((member) => (
                                        <div key={member.user_id} className="flex items-center gap-4 p-4 bg-[#F8F9FB] rounded-2xl hover:bg-gray-50 transition-all">
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                                {member.profiles?.avatar_url ? (
                                                    <img
                                                        src={member.profiles.avatar_url}
                                                        alt={member.profiles.full_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-black">
                                                        {member.profiles?.full_name?.[0]?.toUpperCase() || 'M'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 truncate">{member.profiles?.full_name || 'Unknown'}</p>
                                                <p className="text-xs text-gray-500 font-medium truncate">{member.profiles?.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Upcoming Events */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-black text-[#1E1E2D] mb-6">Upcoming Events</h2>
                            {events.length === 0 ? (
                                <div className="text-center py-8">
                                    <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No upcoming events</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {events.slice(0, 5).map((event) => (
                                        <div key={event.id} className="p-4 bg-[#F8F9FB] rounded-2xl hover:bg-gray-50 transition-all">
                                            <h3 className="font-black text-gray-900 mb-2 line-clamp-1">{event.title}</h3>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="font-medium">{formatDate(event.event_date)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="font-medium">{event.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
