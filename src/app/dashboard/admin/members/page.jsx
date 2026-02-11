import { createSupabaseServer } from '@/lib/supabase/server'
import Header from '@/components/dashboard/Header'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function MembersPage() {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    // 1. Fetch all profiles
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
    }

    // 2. Fetch all memberships to join manually or via second query if needed
    // For now, let's try to get memberships for the fetched profiles
    const memberIds = profiles?.map(p => p.id) || []

    let members = profiles || []

    if (memberIds.length > 0) {
        const { data: memberships } = await supabase
            .from('club_members')
            .select('*, clubs(name)')
            .in('user_id', memberIds)

        // Attach memberships to profiles
        members = profiles.map(profile => ({
            ...profile,
            club_members: memberships?.filter(m => m.user_id === profile.id) || []
        }))
    }

    const isAdmin = profiles?.find(p => p.id === user.id)?.role === 'admin'

    return (
        <div className="pb-12 text-white">
            <Header
                title="Campus Directory"
                subtitle={isAdmin ? "CORE MEMBER REGISTRY & ACCESS CONTROL" : "AUTHORIZED CAMPUS NODES"}
                user={user}
            />

            <div className="px-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {members && members.length > 0 ? members.map(member => (
                        <div key={member.id} className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 relative overflow-hidden group hover:border-zinc-700 transition-all">
                            {/* Accent Glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-all"></div>

                            {/* Profile Photo & Identity */}
                            <div className="flex items-center gap-6 mb-10 relative z-10">
                                <div className="w-20 h-20 rounded-3xl overflow-hidden bg-zinc-800 border border-zinc-700 p-1 group-hover:border-white transition-all">
                                    <div className="w-full h-full rounded-2xl overflow-hidden bg-zinc-900 flex items-center justify-center">
                                        {member.avatar_url ? (
                                            <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white">
                                                {member.full_name?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tighter mb-1 uppercase tracking-tight group-hover:text-purple-400 transition-colors">
                                        {member.full_name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${member.role === 'admin' ? 'bg-red-500' : member.role === 'club_lead' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">{member.role?.replace('_', ' ')} NODE</p>
                                    </div>
                                </div>
                            </div>

                            {/* Technical Specs (Bio/Info) */}
                            <div className="space-y-6 mb-10 relative z-10">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 group/item">
                                        <div className="w-8 h-8 rounded-xl bg-zinc-800/50 flex items-center justify-center text-zinc-600 group-hover/item:text-white transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                        </div>
                                        <span className="text-[11px] font-bold text-zinc-400 group-hover/item:text-zinc-200 transition-colors">{member.institute_name || 'ORPHAN_NODE'}</span>
                                    </div>

                                    {member.degree && (
                                        <div className="flex items-center gap-4 group/item">
                                            <div className="w-8 h-8 rounded-xl bg-zinc-800/50 flex items-center justify-center text-zinc-600 group-hover/item:text-white transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                                            </div>
                                            <span className="text-[11px] font-bold text-zinc-400 group-hover/item:text-zinc-200 transition-colors">{member.education_level} : {member.degree}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 group/item">
                                        <div className="w-8 h-8 rounded-xl bg-zinc-800/50 flex items-center justify-center text-zinc-600 group-hover/item:text-white transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        </div>
                                        <span className="text-[11px] font-bold text-zinc-400 group-hover/item:text-zinc-200 transition-colors uppercase tracking-widest">{member.academic_year || 'SYNC_YEAR_UNKNOWN'}</span>
                                    </div>
                                </div>

                                {/* Club Affiliations */}
                                {member.club_members && member.club_members.length > 0 && (
                                    <div className="pt-6 border-t border-zinc-800">
                                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4 italic">Operational Affiliations</p>
                                        <div className="flex flex-wrap gap-2">
                                            {member.club_members.map((membership, idx) => (
                                                <div key={idx} className="px-3 py-1.5 bg-zinc-800 rounded-lg flex items-center gap-2 border border-zinc-800 hover:border-zinc-700 transition-all">
                                                    <span className="text-[9px] font-bold text-zinc-300">{membership.clubs?.name}</span>
                                                    <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                                                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-tighter">{membership.role}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Metadata / Footer */}
                            <div className="pt-6 border-t border-zinc-800/50 flex items-center justify-between relative z-10">
                                <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-[0.2em]">
                                    INITIALIZED: {new Date(member.created_at).toLocaleDateString()}
                                </span>

                                {isAdmin && member.id !== user.id && (
                                    <form action={async () => {
                                        'use server'
                                        const s = await createSupabaseServer()
                                        await s.from('profiles').delete().eq('id', member.id)
                                        await s.auth.admin.deleteUser(member.id)
                                        revalidatePath('/dashboard/admin/members')
                                    }}>
                                        <button className="px-5 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border border-red-500/20">
                                            Purge
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full bg-zinc-900 border border-zinc-800 rounded-[3rem] p-32 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-500/5 blur-3xl"></div>
                            <div className="relative z-10 space-y-6">
                                <div className="w-20 h-20 bg-zinc-800 border border-zinc-700 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse text-zinc-500">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Registry Null</h3>
                                <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px]">No active campus frequencies detected in this sector.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
