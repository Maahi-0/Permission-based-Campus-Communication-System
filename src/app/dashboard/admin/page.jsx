import { createSupabaseServer } from '@/lib/supabase/server'
import Header from '@/components/dashboard/Header'
import Link from 'next/link'
export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch Admin Stats
    const { count: totalClubs } = await supabase.from('clubs').select('*', { count: 'exact', head: true })
    const { count: pendingClubsCount } = await supabase.from('clubs').select('*', { count: 'exact', head: true }).eq('is_approved', false)
    const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })

    // Fetch pending clubs for verification queue
    const { data: pendingClubs } = await supabase
        .from('clubs')
        .select('*')
        .eq('is_approved', false)
        .order('created_at', { ascending: false })
        .limit(5)

    const stats = [
        { name: 'Total Clubs', value: totalClubs || 0, color: 'from-[#3B82F6] to-[#2563EB]', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
        { name: 'Pending Review', value: pendingClubsCount || 0, color: 'from-[#F59E0B] to-[#D97706]', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
        { name: 'Campus Members', value: totalUsers || 0, color: 'from-[#10B981] to-[#059669]', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    ]

    return (
        <div className="pb-12">
            <Header
                title="System Control"
                subtitle="Oversee all campus activities, verify organizations, and manage users."
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
                                <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-widest border border-gray-100">System</span>
                            </div>
                            <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">{stat.name}</p>
                            <h2 className="text-4xl font-black tracking-tighter text-[#1E1E2D]">{stat.value}</h2>
                        </div>
                    ))}
                </div>

                {/* Verification Queue */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black tracking-tight text-[#0b87bd] uppercase tracking-widest">Pending Verifications</h2>
                            <Link href="/dashboard/admin/verify-clubs" className="text-xs font-black text-[#0b87bd] uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Process Queue</Link>
                        </div>

                        <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Club Name</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Submitted</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingClubs?.length > 0 ? pendingClubs.map(club => (
                                        <tr key={club.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-[#f5f7f9] flex items-center justify-center text-[#1E1E2D] font-black text-xs">
                                                        {club.name[0]}
                                                    </div>
                                                    <span className="font-bold text-[#1E1E2D]">{club.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-xs font-bold text-gray-500">{new Date(club.created_at).toLocaleDateString()}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <Link href={`/dashboard/admin/clubs/${club.id}`} className="px-6 py-2 bg-[#1E1E2D] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">Review</Link>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="3" className="px-8 py-12 text-center text-gray-400 font-bold text-sm uppercase tracking-widest">Queue is clear</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-xl font-black tracking-tight text-[#0b87bd] uppercase tracking-widest">Infrastructure</h2>
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <div className="space-y-6">
                                {[
                                    { name: 'All Clubs', count: totalClubs, color: 'text-blue-500', path: '/dashboard/admin/all-clubs' },
                                    { name: 'Verified', count: totalClubs - pendingClubsCount, color: 'text-green-500', path: '/dashboard/admin/verified-clubs' },
                                    { name: 'Declined', count: 0, color: 'text-red-500', path: '/dashboard/admin/declined-clubs' },
                                ].map((item, i) => (
                                    <Link href={item.path} key={i} className="flex items-center justify-between group cursor-pointer border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-2 rounded-full ${item.color.replace('text', 'bg')}`}></div>
                                            <span className="font-black text-[#1E1E2D] text-sm group-hover:text-[#0b87bd] transition-colors">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-black text-gray-300 group-hover:text-[#1E1E2D] transition-colors">{item.count}</span>
                                    </Link>
                                ))}
                            </div>
                            <Link href="/dashboard/admin/members" className="w-full mt-8 py-4 bg-[#f5f7f9] text-[#1E1E2D] rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-200 block text-center transition-all">
                                Manage Campus Registry
                            </Link>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-900 to-black rounded-[2rem] p-8 text-white relative shadow-2xl overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 -mr-16 -mt-16 rounded-full blur-3xl group-hover:scale-110 transition-transform"></div>
                            <h4 className="text-lg font-black tracking-tight mb-2">Audit Logs</h4>
                            <p className="text-white/60 text-xs font-medium leading-relaxed mb-6">Review system-wide changes, authentication logs, and club transitions.</p>
                            <button className="px-6 py-3 bg-white text-indigo-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all">
                                View Reports
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
