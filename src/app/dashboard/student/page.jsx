import { createSupabaseServer } from '@/lib/supabase/server'
import Header from '@/components/dashboard/Header'
import Link from 'next/link'

export default async function StudentDashboard() {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch stats
    const { count: eventsCount } = await supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'published')
    const { count: clubsCount } = await supabase.from('clubs').select('*', { count: 'exact', head: true }).eq('is_approved', true)

    // Fetch My Communities (clubs the user is a member of)
    const { data: myMemberships, count: myCommunitiesCount } = await supabase
        .from('club_members')
        .select('*, clubs(*)', { count: 'exact' })
        .eq('user_id', user.id)

    const myClubs = myMemberships?.map(m => m.clubs) || []

    // Fetch upcoming events
    const { data: upcomingEvents } = await supabase
        .from('events')
        .select('*, clubs(name, logo_url)')
        .eq('status', 'published')
        .order('event_date', { ascending: true })
        .limit(5)

    const stats = [
        { name: 'Live Comms', value: eventsCount || 0, color: 'text-purple-500', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z' },
        { name: 'Active Nodes', value: clubsCount || 0, color: 'text-blue-500', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        { name: 'My Frequencies', value: myCommunitiesCount || 0, color: 'text-pink-500', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    ]

    return (
        <div className="pb-12 text-white">
            <Header
                title="Student Hub"
                subtitle="MONITORING CAMPUS FREQUENCIES"
                user={user}
            />

            <div className="space-y-12">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {stats.map((stat) => (
                        <div key={stat.name} className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">{stat.name}</p>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-4xl font-black tracking-tighter text-white">{stat.value}</h2>
                                    <div className={`w-2 h-2 rounded-full ${stat.color.replace('text', 'bg')} animate-pulse`}></div>
                                </div>
                            </div>
                            <svg className={`absolute -right-4 -bottom-4 w-24 h-24 ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d={stat.icon} />
                            </svg>
                        </div>
                    ))}
                </div>

                {/* Main Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Events Feed */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Live Transmission Feed</h2>
                            <Link href="/dashboard/student/events" className="text-[10px] font-black text-white uppercase tracking-widest hover:text-purple-400 transition-colors">See History &rarr;</Link>
                        </div>

                        <div className="space-y-6">
                            {upcomingEvents?.length > 0 ? upcomingEvents.map((event) => (
                                <div key={event.id} className="bg-zinc-900/50 border border-zinc-800/50 p-6 rounded-3xl group hover:border-zinc-700 hover:bg-zinc-900 transition-all">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                                            {event.clubs?.logo_url ? (
                                                <img src={event.clubs.logo_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-black">{event.clubs?.name?.[0]}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm">{event.clubs?.name}</h4>
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                                {new Date(event.event_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="ml-auto px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded-md text-[9px] font-black text-purple-400 uppercase tracking-widest">
                                            Broadcast
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-black text-white mb-4 tracking-tighter group-hover:text-purple-400 transition-colors">{event.title}</h3>
                                    <p className="text-zinc-400 text-sm font-medium leading-relaxed line-clamp-2 mb-6">{event.description}</p>

                                    <div className="flex items-center justify-between pt-6 border-t border-zinc-800/50">
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5 text-blue-400">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                </svg>
                                                {event.location}
                                            </span>
                                        </div>
                                        <Link href={`/dashboard/events/${event.id}`} className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all group-hover:scale-105">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-12 border-2 border-dashed border-zinc-900 rounded-3xl text-center">
                                    <p className="text-zinc-600 font-bold text-[10px] uppercase tracking-widest">No signals detected</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Communities Sidebar */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Active Nodes</h2>
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
                            <div className="space-y-6">
                                {myClubs.length > 0 ? myClubs.map((club) => (
                                    <Link key={club.id} href={`/dashboard/clubs/${club.id}`} className="flex items-center gap-4 group">
                                        <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center group-hover:border-white transition-all">
                                            {club.logo_url ? (
                                                <img src={club.logo_url} alt={club.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-black text-white text-lg">{club.name[0]}</span>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-black text-white text-sm group-hover:text-purple-400 transition-colors tracking-tight">{club.name}</h4>
                                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Node Verified</p>
                                        </div>
                                    </Link>
                                )) : (
                                    <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest text-center py-4">No nodes connected</p>
                                )}
                            </div>

                            <Link href="/dashboard/student/clubs" className="block w-full text-center mt-10 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all font-mono">
                                EXPLORE ALL NODES
                            </Link>
                        </div>

                        {/* Special Actions */}
                        <div className="bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/20 rounded-3xl p-8 relative overflow-hidden group">
                            <div className="relative z-10">
                                <h4 className="text-lg font-black mb-2 tracking-tighter">Elevate Auth Privileges</h4>
                                <p className="text-zinc-500 text-xs font-medium leading-relaxed mb-6 italic">Apply for Club Lead status to initiate your own transmissions and manage campus nodes.</p>
                                <Link href="/dashboard/student/about" className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    Initiate Request
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

