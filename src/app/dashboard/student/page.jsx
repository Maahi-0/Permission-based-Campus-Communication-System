import { createSupabaseServer } from '@/lib/supabase/server'
import Header from '@/components/dashboard/Header'
import Link from 'next/link'

export default async function StudentDashboard() {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch stats
    const { count: eventsCount } = await supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'published')
    const { count: clubsCount } = await supabase.from('clubs').select('*', { count: 'exact', head: true }).eq('is_approved', true)

    // Fetch upcoming events
    const { data: upcomingEvents } = await supabase
        .from('events')
        .select('*, clubs(name)')
        .eq('status', 'published')
        .order('event_date', { ascending: true })
        .limit(5)

    const stats = [
        { name: 'Live Events', value: eventsCount || 0, change: '+12%', color: 'from-[#22C55E] to-[#16A34A]', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { name: 'Active Clubs', value: clubsCount || 0, change: '+3', color: 'from-[#F59E0B] to-[#D97706]', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        { name: 'My Communities', value: '4', change: 'Personal', color: 'from-[#8B5CF6] to-[#7C3AED]', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    ]

    return (
        <div className="pb-12">
            <Header
                title="Student Hub"
                subtitle="Discover events and connect with campus communities."
                user={user}
            />

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
                            <h2 className="text-xl font-black tracking-tight text-[#1E1E2D]">Discover Events</h2>
                            <Link href="/dashboard/student/events" className="text-xs font-black text-[#22C55E] uppercase tracking-widest hover:underline decoration-2 underline-offset-4">View All</Link>
                        </div>

                        <div className="space-y-4">
                            {upcomingEvents?.map((event) => (
                                <div key={event.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-6 hover:shadow-xl transition-all group">
                                    <div className="w-20 h-20 bg-[#F8F7F3] rounded-2xl flex flex-col items-center justify-center border-2 border-transparent group-hover:border-[#22C55E]/20 transition-all">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(event.event_date).toLocaleString('default', { month: 'short' })}</span>
                                        <span className="text-2xl font-black text-[#1E1E2D]">{new Date(event.event_date).getDate()}</span>
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[9px] font-black text-[#22C55E] uppercase tracking-widest bg-[#22C55E]/10 px-2 py-0.5 rounded-full">{event.clubs?.name}</span>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">{new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <h3 className="text-lg font-black text-[#1E1E2D] group-hover:text-[#22C55E] transition-colors">{event.title}</h3>
                                        <p className="text-gray-500 text-sm font-medium line-clamp-1">{event.description}</p>
                                    </div>
                                    <button className="w-12 h-12 rounded-2xl bg-gray-50 group-hover:bg-[#22C55E] text-gray-400 group-hover:text-white flex items-center justify-center transition-all">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-xl font-black tracking-tight text-[#1E1E2D]">Active Communities</h2>
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <div className="space-y-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-4 group cursor-pointer">
                                        <div className="w-12 h-12 rounded-2xl bg-[#F8F7F3] overflow-hidden">
                                            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=Club${i}`} alt="club" />
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-black text-[#1E1E2D] text-sm group-hover:text-[#22C55E] transition-colors">Campus Tech Club</h4>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">120+ Active Members</p>
                                        </div>
                                        <div className="w-2 h-2 rounded-full bg-[#22C55E]"></div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-8 py-4 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#1E1E2D] transition-all shadow-lg shadow-gray-200">
                                Explore All Clubs
                            </button>
                        </div>

                        <div className="bg-gradient-to-br from-[#1E1E2D] to-black rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-2xl">
                            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#22C55E]/10 rounded-full blur-3xl group-hover:bg-[#22C55E]/20 transition-all"></div>
                            <h4 className="text-lg font-black mb-2 tracking-tight">Upgrade Your Access</h4>
                            <p className="text-white/60 text-xs font-medium leading-relaxed mb-6">Want to create your own club? Apply for a Lead position and start your journey.</p>
                            <button className="px-6 py-3 bg-[#22C55E] hover:bg-[#16A34A] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                Go Pro
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
