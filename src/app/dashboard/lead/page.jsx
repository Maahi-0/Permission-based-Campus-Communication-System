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
        <div className="pb-12">
            <Header
                title="Lead Command"
                subtitle="Manage your campus organizations and organize events."
                user={user}
            />

            <div className="px-10 space-y-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat) => (
                        <div key={stat.name} className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative group overflow-hidden">
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

                {/* Management Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black tracking-tight text-[#0b87bd] uppercase tracking-widest">My Managed Clubs</h2>
                            <Link href="/dashboard/lead/create-club" className="px-6 py-2.5 bg-[#0b87bd] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#0b87bd]/20 hover:bg-[#096a96] transition-all">Register New Club</Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {clubs.length > 0 ? clubs.map(club => (
                                <div key={club.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${club.is_approved ? 'bg-[#0b87bd]/10 text-[#0b87bd]' : 'bg-orange-500/10 text-orange-500'}`}>
                                            {club.is_approved ? 'Verified' : 'Pending Verification'}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-[#1E1E2D] group-hover:text-[#0b87bd] transition-colors mb-2 leading-tight">{club.name}</h3>
                                    <p className="text-gray-500 text-sm font-medium line-clamp-2 mb-8">{club.description}</p>
                                    <div className="flex items-center gap-2 pt-6 border-t border-gray-50">
                                        <Link href={`/dashboard/lead/members?club=${club.id}`} className="flex-1 text-center py-3 bg-[#f5f7f9] rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#1E1E2D] transition-colors">Members</Link>
                                        <Link href={`/dashboard/lead/create-event?club=${club.id}`} className="flex-1 text-center py-3 bg-[#1E1E2D] rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-black transition-colors">Add Event</Link>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-2 bg-white rounded-[2rem] p-16 text-center border-2 border-dashed border-gray-100">
                                    <p className="text-gray-400 font-black uppercase tracking-widest text-xs mb-4">No clubs under your leadership</p>
                                    <Link href="/dashboard/lead/create-club" className="text-[#0b87bd] font-black uppercase tracking-widest text-[10px] hover:underline">Apply for club lead</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-xl font-black tracking-tight text-[#0b87bd] uppercase tracking-widest">Quick Actions</h2>
                        <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
                            <div className="p-4 space-y-1">
                                {[
                                    { name: 'Add New Member', path: '/dashboard/lead/add-member', icon: 'M18 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0' },
                                    { name: 'View Live Events', path: '/dashboard/lead/live-events', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
                                    { name: 'Browse All Clubs', path: '/dashboard/lead/all-clubs', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
                                ].map(action => (
                                    <Link key={action.name} href={action.path} className="flex items-center gap-4 p-4 hover:bg-[#f5f7f9] rounded-2xl transition-all group">
                                        <div className="w-10 h-10 bg-gray-50 group-hover:bg-white rounded-xl flex items-center justify-center text-gray-400 group-hover:text-[#0b87bd] transition-all">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={action.icon} />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-bold text-gray-600 group-hover:text-[#1E1E2D]">{action.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-[2rem] p-8 text-white relative shadow-2xl overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 -mr-16 -mt-16 rounded-full group-hover:scale-110 transition-transform"></div>
                            <h4 className="text-lg font-black tracking-tight mb-2">Club verification</h4>
                            <p className="text-white/80 text-xs font-medium leading-relaxed mb-6">Your club status is currently active. Keep your events up to date to maintain your verified badge.</p>
                            <Link href="/dashboard/lead/all-clubs" className="inline-block px-6 py-3 bg-white text-orange-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all">Support Center</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
