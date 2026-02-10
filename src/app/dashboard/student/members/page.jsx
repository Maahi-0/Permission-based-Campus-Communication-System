import { createSupabaseServer } from '@/lib/supabase/server'
import Header from '@/components/dashboard/Header'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function StudentMembersPage() {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    // Fetch all members with their club memberships
    const { data: members } = await supabase
        .from('profiles')
        .select(`
            *,
            club_members (
                club_id,
                role,
                joined_at,
                clubs (
                    name
                )
            )
        `)
        .order('full_name', { ascending: true })

    return (
        <div className="pb-12 text-[#1E1E2D]">
            <Header
                title="Campus Directory"
                subtitle="Browse all registered student members and club leads."
                user={user}
            />

            <div className="px-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {members?.length > 0 ? members.map(member => (
                        <div key={member.id} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                            {/* Profile Photo */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-gray-100 bg-gray-50">
                                        {member.avatar_url ? (
                                            <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl font-black text-[#0b87bd]">
                                                {member.full_name?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-[#1E1E2D] tracking-tight group-hover:text-[#0b87bd] transition-colors">{member.full_name}</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{member.role?.replace('_', ' ')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Education Details */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-sm">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <span className="font-bold text-gray-600">{member.institute_name || 'N/A'}</span>
                                </div>

                                {member.degree && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        <span className="font-bold text-gray-600">{member.education_level} - {member.degree}</span>
                                    </div>
                                )}

                                {member.academic_year && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="font-bold text-gray-600">{member.academic_year}</span>
                                    </div>
                                )}
                            </div>

                            {/* Club Memberships */}
                            {member.club_members && member.club_members.length > 0 && (
                                <div className="pt-4 border-t border-gray-50 mb-6">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Member Of</p>
                                    <div className="space-y-2">
                                        {member.club_members.slice(0, 2).map((membership, idx) => (
                                            <div key={idx} className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-gray-600">{membership.clubs?.name}</span>
                                                <span className="text-[9px] font-black text-[#0b87bd] uppercase tracking-widest px-2 py-1 bg-[#0b87bd]/5 rounded-full">
                                                    {membership.role}
                                                </span>
                                            </div>
                                        ))}
                                        {member.club_members.length > 2 && (
                                            <p className="text-[9px] font-bold text-gray-400">+{member.club_members.length - 2} more</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Join Date - No Delete Button Here */}
                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                    Joined {new Date(member.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full bg-white rounded-[2rem] p-20 text-center border shadow-sm border-gray-100">
                            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No members found in registry</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
