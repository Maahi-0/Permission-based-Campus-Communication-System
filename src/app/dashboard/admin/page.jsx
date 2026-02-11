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
        <div className="pb-12 text-white">
            <Header
                title="System Control"
                subtitle="INFRASTRUCTURE MONITORING"
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
                                    <div className={`w-2 h-2 rounded-full bg-blue-500 animate-pulse`}></div>
                                </div>
                            </div>
                            <svg className={`absolute -right-4 -bottom-4 w-24 h-24 text-zinc-500 opacity-5 group-hover:opacity-10 transition-opacity`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d={stat.icon} />
                            </svg>
                        </div>
                    ))}
                </div>

                {/* Verification Queue */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Verification Queue</h2>
                            <Link href="/dashboard/admin/verify-clubs" className="text-[10px] font-black text-white uppercase tracking-widest hover:text-purple-400 transition-colors">Process All Nodes &rarr;</Link>
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                            {/* Desktop Table View */}
                            <div className="hidden md:block">
                                <table className="w-full text-left">
                                    <thead className="bg-zinc-900/50 border-b border-zinc-800">
                                        <tr>
                                            <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Node Identity</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Broadcast Time</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Protocol</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800/50">
                                        {pendingClubs?.length > 0 ? pendingClubs.map(club => (
                                            <tr key={club.id} className="hover:bg-zinc-800/30 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-black text-xs">
                                                            {club.name[0]}
                                                        </div>
                                                        <span className="font-bold text-white tracking-tight">{club.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-xs font-bold text-zinc-500">{new Date(club.created_at).toLocaleDateString()}</span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <Link href={`/dashboard/admin/clubs/${club.id}`} className="px-6 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Review</Link>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="3" className="px-8 py-12 text-center text-zinc-700 font-bold text-xs uppercase tracking-widest">Signal clear - No pending nodes</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-zinc-800">
                                {pendingClubs?.length > 0 ? pendingClubs.map(club => (
                                    <div key={club.id} className="p-6">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-black text-xs">
                                                {club.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-white">{club.name}</p>
                                                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">REQ_{new Date(club.created_at).getTime()}</p>
                                            </div>
                                        </div>
                                        <Link href={`/dashboard/admin/clubs/${club.id}`} className="block w-full text-center px-6 py-3 bg-zinc-800 border border-zinc-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                                            Review Interface
                                        </Link>
                                    </div>
                                )) : (
                                    <div className="p-12 text-center text-zinc-700 font-bold text-xs uppercase tracking-widest">No pending frequencies</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Core Registry</h2>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
                            <div className="space-y-6">
                                {[
                                    { name: 'Total Nodes', count: totalClubs, color: 'bg-blue-500', path: '/dashboard/admin/all-clubs' },
                                    { name: 'Synced Nodes', count: totalClubs - pendingClubsCount, color: 'bg-emerald-500', path: '/dashboard/admin/verified-clubs' },
                                    { name: 'Offline Nodes', count: 0, color: 'bg-red-500', path: '/dashboard/admin/declined-clubs' },
                                ].map((item, i) => (
                                    <Link href={item.path} key={i} className="flex items-center justify-between group cursor-pointer border-b border-zinc-800/50 pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                                            <span className="font-black text-zinc-400 text-xs group-hover:text-white transition-colors uppercase tracking-widest">{item.name}</span>
                                        </div>
                                        <span className="text-xs font-black text-zinc-700 group-hover:text-white transition-colors">{item.count}</span>
                                    </Link>
                                ))}
                            </div>
                            <Link href="/dashboard/admin/members" className="w-full mt-10 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 block text-center transition-all font-mono">
                                MANAGE SYSTEM USERS
                            </Link>
                        </div>

                        <div className="bg-gradient-to-br from-blue-900/40 to-black border border-blue-500/20 rounded-3xl p-8 relative overflow-hidden group">
                            <div className="relative z-10">
                                <h4 className="text-lg font-black mb-2 tracking-tighter uppercase font-mono">Kernel Audit</h4>
                                <p className="text-zinc-500 text-xs font-medium leading-relaxed mb-6 italic">Review system-wide changes, authentication logs, and club transitions.</p>
                                <button className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    Access Logs
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
