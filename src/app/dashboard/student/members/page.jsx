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
        <div className="pb-12 text-white">
            <Header
                title="Campus Directory"
                subtitle="BROWSE ALL REGISTERED NODES"
                user={user}
            />

            <div className="">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {members?.length > 0 ? members.map(member => (
                        <div key={member.id} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 hover:bg-zinc-900 hover:border-zinc-700 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-purple-500/10 transition-all"></div>

                            {/* Profile Photo */}
                            <div className="flex items-start justify-between mb-8">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-800 group-hover:border-zinc-600 transition-colors shrink-0">
                                        {member.avatar_url ? (
                                            <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white/20">
                                                {member.full_name?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-black text-lg text-white tracking-tight group-hover:text-purple-400 transition-colors truncate">{member.full_name}</h3>
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{member.role?.replace('_', ' ')} NODE</p>
                                    </div>
                                </div>
                            </div>

                            {/* Education Details */}
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-xs">
                                    <svg className="w-4 h-4 text-zinc-600 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <span className="font-bold text-zinc-400 truncate">{member.institute_name || 'N/A'}</span>
                                </div>

                                {member.degree && (
                                    <div className="flex items-center gap-3 text-xs">
                                        <svg className="w-4 h-4 text-zinc-600 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                        </svg>
                                        <span className="font-bold text-zinc-400 truncate">{member.education_level} - {member.degree}</span>
                                    </div>
                                )}

                                {member.academic_year && (
                                    <div className="flex items-center gap-3 text-xs">
                                        <svg className="w-4 h-4 text-zinc-600 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="font-bold text-zinc-400">{member.academic_year} CYCLE</span>
                                    </div>
                                )}
                            </div>

                            {/* Club Memberships */}
                            {member.club_members && member.club_members.length > 0 && (
                                <div className="pt-6 border-t border-zinc-800/50 mb-6">
                                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4">Frequency Sync</p>
                                    <div className="space-y-3">
                                        {member.club_members.slice(0, 2).map((membership, idx) => (
                                            <div key={idx} className="flex items-center justify-between">
                                                <span className="text-xs font-black text-zinc-400 truncate pr-4">{membership.clubs?.name}</span>
                                                <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded-md shrink-0">
                                                    {membership.role}
                                                </span>
                                            </div>
                                        ))}
                                        {member.club_members.length > 2 && (
                                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest pl-1">+{member.club_members.length - 2} ADDITONAL CHANNELS</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Join Date */}
                            <div className="pt-6 border-t border-zinc-800/50 flex items-center justify-between opacity-50">
                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">
                                    INITIALIZED_{new Date(member.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full bg-zinc-900 border border-zinc-800 border-dashed rounded-3xl p-20 text-center">
                            <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-xs">Registry is currently void of signal</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
