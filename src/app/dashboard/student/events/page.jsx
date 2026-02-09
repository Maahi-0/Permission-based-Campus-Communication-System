import { createSupabaseServer } from '@/lib/supabase/server'
import Header from '@/components/dashboard/Header'
import Link from 'next/link'

export default async function StudentEvents() {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: events } = await supabase
        .from('events')
        .select('*, clubs(name)')
        .eq('status', 'published')
        .order('event_date', { ascending: true })

    return (
        <div className="pb-12 text-[#1E1E2D]">
            <Header
                title="Events Calendar"
                subtitle="All upcoming verified campus events and activities."
                user={user}
            />

            <div className="px-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events?.length > 0 ? events.map(event => (
                        <div key={event.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
                            <div className="h-48 bg-[#f5f7f9] relative overflow-hidden">
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-200 shadow-sm z-10 flex flex-col items-center">
                                    <span className="text-[10px] font-black text-[#0b87bd] uppercase tracking-widest">{new Date(event.event_date).toLocaleString('default', { month: 'short' })}</span>
                                    <span className="text-xl font-black text-[#1E1E2D]">{new Date(event.event_date).getDate()}</span>
                                </div>
                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-300">
                                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="px-3 py-1 bg-[#0b87bd]/10 text-[#0b87bd] rounded-full text-[9px] font-black uppercase tracking-widest">{event.clubs?.name}</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{event.location || 'Campus'}</span>
                                </div>
                                <h3 className="text-xl font-black mb-3 leading-tight group-hover:text-[#0b87bd] transition-colors">{event.title}</h3>
                                <p className="text-gray-500 text-sm font-medium line-clamp-2 mb-8">{event.description}</p>
                                <Link href={`/dashboard/events/${event.id}`} className="block w-full text-center py-4 bg-gray-900 hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-gray-200">
                                    Register for Event
                                </Link>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No events found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
