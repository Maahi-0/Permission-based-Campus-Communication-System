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
        .select('*, clubs(name)')
        .eq('status', 'published')
        .order('event_date', { ascending: true })
        .limit(5)

    const stats = [
        { name: 'Live Events', value: eventsCount || 0, change: '+12%', color: 'from-[#0b87bd] to-[#096a96]', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { name: 'Active Clubs', value: clubsCount || 0, change: '+3', color: 'from-[#F59E0B] to-[#D97706]', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        { name: 'My Communities', value: myCommunitiesCount || 0, change: 'Personal', color: 'from-[#8B5CF6] to-[#7C3AED]', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    ]

    return (
        <div className="pb-12 text-[#1E1E2D]">
            <Header
                title="Student Hub"
                subtitle="Discover events and connect with campus communities."
                user={user}
            />

            {/* Dashboard Hero Banner - Full Width Edge-to-Edge */}
            <div className="relative w-full h-80 md:h-[400px] overflow-hidden group mb-10">
                <img
                    src="/images/campus-connect-hero.png"
                    alt="Hero"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0b87bd] via-[#0b87bd]/40 to-transparent flex flex-col justify-center p-12 md:p-24">
                    <div className="max-w-7xl mx-auto w-full px-6 md:px-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full w-fit mb-4">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">System Online</span>
                        </div>
                        <h2 className="text-5xl font-black text-white tracking-tighter mb-4 drop-shadow-xl">
                            Welcome Back, {user.user_metadata?.full_name?.split(' ')[0] || 'Student'}!
                        </h2>
                        <p className="text-white/90 text-lg font-medium max-w-xl leading-relaxed drop-shadow-md">
                            Your campus ecosystem is active. Discover new events and connect with your communities below.
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-10 space-y-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat) => (
                        <div key={stat.name} className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100/50 hover:shadow-xl hover:shadow-gray-200/50 transition-all group overflow-hidden relative">
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-[0.03] -mr-16 -mt-16 rounded-full group-hover:scale-110 transition-transform`}></div>
                            <div className="flex items-start justify-between mb-6">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                                    </svg>
                                </div>
                                <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-widest border border-gray-100">{stat.change}</span>
                            </div>
                            <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">{stat.name}</p>
                            <h2 className="text-4xl font-black tracking-tighter text-[#1E1E2D]">{stat.value}</h2>
                        </div>
                    ))}
                </div>

                {/* Main Section: split layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black tracking-tight text-[#0b87bd] uppercase tracking-widest">Discover Events</h2>
                            <Link href="/dashboard/student/events" className="text-xs font-black text-[#0b87bd] uppercase tracking-widest hover:underline decoration-2 underline-offset-4">View All</Link>
                        </div>

                        <div className="space-y-4">
                            {upcomingEvents?.length > 0 ? upcomingEvents.map((event) => (
                                <div key={event.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-6 hover:shadow-xl transition-all group">
                                    <div className="w-20 h-20 bg-[#f5f7f9] rounded-2xl flex flex-col items-center justify-center border-2 border-transparent group-hover:border-[#0b87bd]/20 transition-all">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(event.event_date).toLocaleString('default', { month: 'short' })}</span>
                                        <span className="text-2xl font-black text-[#1E1E2D]">{new Date(event.event_date).getDate()}</span>
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[9px] font-black text-[#0b87bd] uppercase tracking-widest bg-[#0b87bd]/10 px-2 py-0.5 rounded-full">{event.clubs?.name}</span>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">{new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <h3 className="text-lg font-black text-[#1E1E2D] group-hover:text-[#0b87bd] transition-colors">{event.title}</h3>
                                        <p className="text-gray-500 text-sm font-medium line-clamp-1">{event.description}</p>
                                    </div>
                                    <button className="w-12 h-12 rounded-2xl bg-gray-50 group-hover:bg-[#0b87bd] text-gray-400 group-hover:text-white flex items-center justify-center transition-all">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            )) : (
                                <div className="bg-white p-12 rounded-[2rem] border-2 border-dashed border-gray-100 text-center">
                                    <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">No upcoming transmissions detected.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-xl font-black tracking-tight text-[#0b87bd] uppercase tracking-widest">Active Communities</h2>
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <div className="space-y-6">
                                {myClubs.length > 0 ? myClubs.map((club, i) => (
                                    <div key={club.id} className="flex items-center gap-4 group cursor-pointer">
                                        <div className="w-12 h-12 rounded-2xl bg-[#f5f7f9] overflow-hidden border border-gray-100 flex items-center justify-center">
                                            {club.logo_url ? (
                                                <img src={club.logo_url} alt={club.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-black text-[#0b87bd] text-lg">{club.name[0]}</span>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-black text-[#1E1E2D] text-sm group-hover:text-[#0b87bd] transition-colors">{club.name}</h4>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verified Member</p>
                                        </div>
                                        <div className="w-2 h-2 rounded-full bg-[#0b87bd]"></div>
                                    </div>
                                )) : (
                                    <div className="text-center py-4">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">You haven't joined any clubs yet.</p>
                                    </div>
                                )}
                            </div>
                            <Link href="/dashboard/student/clubs" className="block w-full text-center mt-8 py-4 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#1E1E2D] transition-all shadow-lg shadow-gray-200">
                                Explore All Clubs
                            </Link>
                        </div>

                        <div className="bg-gradient-to-br from-[#1E1E2D] to-black rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-2xl">
                            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#0b87bd]/10 rounded-full blur-3xl group-hover:bg-[#0b87bd]/20 transition-all"></div>
                            <h4 className="text-lg font-black mb-2 tracking-tight">Upgrade Your Access</h4>
                            <p className="text-white/60 text-xs font-medium leading-relaxed mb-6">Want to create your own club? Apply for a Lead position and start your journey.</p>
                            <Link href="/dashboard/student/about" className="inline-block px-6 py-3 bg-[#0b87bd] hover:bg-[#096a96] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                Learn More
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

