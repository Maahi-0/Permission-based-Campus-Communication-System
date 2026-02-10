import { createSupabaseServer } from '@/lib/supabase/server'
import Header from '@/components/dashboard/Header'
import Link from 'next/link'
export const dynamic = 'force-dynamic'

export default async function VerifyClubs() {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: pendingClubs } = await supabase
        .from('clubs')
        .select('*')
        .eq('is_approved', false)
        .order('created_at', { ascending: false })

    return (
        <div className="pb-12 text-[#1E1E2D]">
            <Header
                title="Verification Queue"
                subtitle="Review and approve club registration requests."
                user={user}
            />

            <div className="px-10">
                <div className="space-y-4">
                    {pendingClubs?.length > 0 ? pendingClubs.map(club => (
                        <div key={club.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 hover:shadow-xl transition-all group">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-[#f5f7f9] rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-[#0b87bd] transition-colors">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black mb-1 group-hover:text-[#0b87bd] transition-colors">{club.name}</h3>
                                    <p className="text-gray-500 text-sm font-medium line-clamp-1">{club.description}</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Requested on {new Date(club.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link href={`/dashboard/admin/clubs/${club.id}`} className="px-8 py-3 bg-[#1E1E2D] hover:bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    Review Details
                                </Link>
                            </div>
                        </div>
                    )) : (
                        <div className="bg-white rounded-[2rem] p-20 text-center border shadow-sm border-gray-100">
                            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">All clubs have been processed</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
