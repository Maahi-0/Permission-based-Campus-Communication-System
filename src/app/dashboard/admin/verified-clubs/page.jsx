import { createSupabaseServer } from '@/lib/supabase/server'
import Header from '@/components/dashboard/Header'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function VerifiedClubs() {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: clubs } = await supabase
        .from('clubs')
        .select(`
            *,
            club_members(count)
        `)
        .eq('is_approved', true)
        .order('name', { ascending: true })

    return (
        <div className="pb-12 text-[#1E1E2D]">
            <Header
                title="Verified Directory"
                subtitle="All organizations with active verification status."
                user={user}
            />

            <div className="px-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clubs?.length > 0 ? clubs.map(club => (
                        <div key={club.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full">
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-16 h-16 bg-[#f5f7f9] rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                    🏢
                                </div>
                                <div className="px-4 py-1.5 bg-[#0b87bd]/10 text-[#0b87bd] rounded-full text-[9px] font-black uppercase tracking-widest border border-[#0b87bd]/20">
                                    Active
                                </div>
                            </div>

                            <h3 className="text-xl font-black mb-2 group-hover:text-[#0b87bd] transition-colors">{club.name}</h3>
                            <p className="text-gray-500 text-sm font-medium line-clamp-2 mb-6 flex-grow">{club.description}</p>

                            <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    Verified {new Date(club.created_at).toLocaleDateString()}
                                </span>
                                <Link href={`/dashboard/admin/clubs/${club.id}`} className="text-[#0b87bd] font-black text-[10px] uppercase tracking-widest hover:underline">
                                    Manage
                                </Link>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full bg-white rounded-[2rem] p-20 text-center border shadow-sm border-gray-100">
                            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No verified clubs found in registry</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
