import { createSupabaseServer } from '@/lib/supabase/server'
import Header from '@/components/dashboard/Header'
import Link from 'next/link'

export default async function LeadDashboard() {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch My Clubs (Clubs where I am lead)
    const { data: myClubs } = await supabase
        .from('club_members')
        .select(`
            club_id,
            clubs (
                id,
                name,
                description,
                is_approved
            )
        `)
        .eq('user_id', user.id)
        .eq('role', 'lead')

    const clubs = myClubs?.map(mc => mc.clubs) || []

    // Total members across all my clubs
    const { count: totalMembers } = await supabase
        .from('club_members')
        .select('*', { count: 'exact', head: true })
        .in('club_id', clubs.map(c => c.id))

    // Total events created for my clubs
    const { count: totalEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .in('club_id', clubs.map(c => c.id))

    const stats = [
        { name: 'Club Members', value: totalMembers || 0, change: 'total', color: 'from-[#3B82F6] to-[#2563EB]', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { name: 'My Events', value: totalEvents || 0, change: 'across clubs', color: 'from-[#EC4899] to-[#DB2777]', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { name: 'Managed Clubs', value: clubs.length, change: 'verified', color: 'from-[#0b87bd] to-[#096a96]', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    ]

    return (
        <div className="pb-12 text-white">
            <Header
                title="Lead Command"
                subtitle="MONITORING ORG FREQUENCIES"
                user={user}
            />

            <div className="space-y-12">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat) => (
                        <div key={stat.name} className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">{stat.name}</p>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-4xl font-black tracking-tighter text-white">{stat.value}</h2>
                                    <div className={`w-2 h-2 rounded-full bg-purple-500 animate-pulse`}></div>
                                </div>
                            </div>
                            <svg className={`absolute -right-4 -bottom-4 w-24 h-24 text-zinc-500 opacity-5 group-hover:opacity-10 transition-opacity`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d={stat.icon} />
                            </svg>
                        </div>
                    ))}
                </div>

                {/* Management Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Managed Nodes</h2>
                            <Link href="/dashboard/lead/create-club" className="px-6 py-2.5 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all font-mono">INITIALIZE NEW NODE</Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {clubs.length > 0 ? clubs.map(club => (
                                <div key={club.id} className="bg-zinc-900/50 border border-zinc-800/50 p-8 rounded-3xl group hover:border-zinc-700 hover:bg-zinc-900 transition-all">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${club.is_approved ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                                            {club.is_approved ? 'Active Frequency' : 'Pending Sync'}
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-white group-hover:text-purple-400 transition-colors mb-2 tracking-tighter">{club.name}</h3>
                                    <p className="text-zinc-500 text-sm font-medium line-clamp-2 mb-8 italic">"{club.description}"</p>
                                    <div className="flex items-center gap-3 pt-6 border-t border-zinc-800/50">
                                        <Link href={`/dashboard/lead/members?club=${club.id}`} className="flex-1 text-center py-3 bg-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors border border-zinc-700">Members</Link>
                                        <Link href={`/dashboard/lead/create-event?club=${club.id}`} className="flex-1 text-center py-3 bg-purple-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-purple-500 transition-colors">Broadcast</Link>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-2 p-16 border-2 border-dashed border-zinc-900 rounded-3xl text-center">
                                    <p className="text-zinc-700 font-black uppercase tracking-widest text-[10px] mb-4">No active nodes under your auth code</p>
                                    <Link href="/dashboard/lead/create-club" className="text-purple-400 font-black uppercase tracking-widest text-[9px] hover:underline">Deploy initial node &rarr;</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Fast Protocols</h2>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
                            <div className="space-y-2">
                                {[
                                    { name: 'Inject New Member', path: '/dashboard/lead/add-member', icon: 'M18 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0' },
                                    { name: 'Monitor Live Feed', path: '/dashboard/lead/live-events', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
                                    { name: 'Global Node Directory', path: '/dashboard/lead/all-clubs', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
                                ].map(action => (
                                    <Link key={action.name} href={action.path} className="flex items-center gap-4 p-4 hover:bg-zinc-800 rounded-2xl transition-all group border border-transparent hover:border-zinc-700">
                                        <div className="w-10 h-10 bg-zinc-800 group-hover:bg-zinc-700 rounded-xl flex items-center justify-center text-zinc-600 group-hover:text-purple-400 transition-all border border-zinc-700">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={action.icon} />
                                            </svg>
                                        </div>
                                        <span className="text-[10px] font-black text-zinc-500 group-hover:text-white uppercase tracking-widest">{action.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/20 rounded-3xl p-8 relative overflow-hidden group">
                            <div className="relative z-10">
                                <h4 className="text-lg font-black mb-2 tracking-tighter">Frequency Shield</h4>
                                <p className="text-zinc-500 text-xs font-medium leading-relaxed mb-6 italic">Your lead status is verified. Maintain your transmission uptime to retain protocol priority.</p>
                                <Link href="/dashboard/lead/all-clubs" className="inline-block px-8 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    Status Report
                                </Link>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-purple-500/20 transition-all"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
