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
        .eq('is_admin_approved', true)
        .order('event_date', { ascending: true })

    return (
        <div className="pb-12 text-white">
            <Header
                title="Events Calendar"
                subtitle="ALL UPCOMING BROADCASTS"
                user={user}
            />

            <div className="">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events?.length > 0 ? events.map(event => (
                        <div key={event.id} className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] overflow-hidden hover:bg-zinc-900 hover:border-zinc-700 transition-all group flex flex-col h-full">
                            <div className="h-48 bg-zinc-800 relative overflow-hidden shrink-0">
                                <div className="absolute top-6 left-6 bg-white shrink-0 px-4 py-2 rounded-2xl shadow-[0_10px_30px_rgba(255,255,255,0.2)] z-10 flex flex-col items-center">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">{new Date(event.event_date).toLocaleString('default', { month: 'short' })}</span>
                                    <span className="text-xl font-black text-black leading-none">{new Date(event.event_date).getDate()}</span>
                                </div>
                                <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-900 to-zinc-900 flex items-center justify-center text-zinc-800">
                                    <svg className="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="p-8 flex flex-col flex-grow">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-[9px] font-black uppercase tracking-[0.2em]">{event.clubs?.name}</span>
                                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">{event.location || 'CAMPUS_NODE'}</span>
                                </div>
                                <h3 className="text-2xl font-black mb-4 leading-tight group-hover:text-purple-400 transition-colors tracking-tighter uppercase">{event.title}</h3>
                                <p className="text-zinc-500 text-sm font-medium line-clamp-2 mb-8 italic leading-relaxed">{event.description || 'No briefing available for this transmission.'}</p>
                                <div className="mt-auto">
                                    <Link href={`/dashboard/events/${event.id}`} className="block w-full text-center py-5 bg-white text-black hover:bg-zinc-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all font-mono">
                                        INITIALIZE_REGISTRATION
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-32 text-center bg-zinc-900/50 border border-zinc-800 border-dashed rounded-[3.5rem]">
                            <p className="text-zinc-600 font-black uppercase tracking-[0.4em] text-xs">Void cycle detected - no broadcasts queued</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
