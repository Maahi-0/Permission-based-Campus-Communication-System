import { createSupabaseServer } from '@/lib/supabase/server'
import Header from '@/components/dashboard/Header'
import Link from 'next/link'

export default async function StudentClubs() {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: clubs } = await supabase
        .from('clubs')
        .select(`*, club_members(count)`)
        .eq('is_approved', true)

    return (
        <div className="pb-12 text-[#1E1E2D]">
            <Header
                title="Campus Clubs"
                subtitle="Join organizations that align with your interests and passion."
                user={user}
            />

            <div className="px-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {clubs?.length > 0 ? clubs.map(club => (
                        <div key={club.id} className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all group flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-[#F8F7F3] rounded-[1.5rem] flex items-center justify-center text-[#1E1E2D] mb-6 border border-gray-100 group-hover:border-[#22C55E]/20 transition-all">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-black mb-2 leading-tight group-hover:text-[#22C55E] transition-colors">{club.name}</h3>
                            <p className="text-gray-500 text-sm font-medium line-clamp-2 mb-8">{club.description}</p>

                            <div className="flex items-center gap-6 mb-8 mt-auto">
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Members</p>
                                    <p className="text-lg font-black">{club.club_members[0]?.count || 0}</p>
                                </div>
                                <div className="w-[1px] h-8 bg-gray-100"></div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Status</p>
                                    <p className="text-lg font-black text-[#22C55E]">Active</p>
                                </div>
                            </div>

                            <Link href={`/dashboard/clubs/${club.id}`} className="w-full py-4 bg-[#F8F7F3] group-hover:bg-[#22C55E] group-hover:text-white text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                View Intelligence
                            </Link>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No clubs discovered yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
