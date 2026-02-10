import { createSupabaseServer } from '@/lib/supabase/server'
import Header from '@/components/dashboard/Header'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function VerifyEvents() {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch unapproved events with club details
    const { data: pendingEvents } = await supabase
        .from('events')
        .select(`
            *,
            clubs (
                name,
                logo_url
            )
        `)
        .eq('is_admin_approved', false)
        .order('created_at', { ascending: false })

    return (
        <div className="pb-12 text-[#1E1E2D]">
            <Header
                title="Event Transmission Control"
                subtitle="Review and authorize campus-wide event broadcasts."
                user={user}
            />

            <div className="px-10 max-w-2xl mx-auto space-y-12">
                {pendingEvents?.length > 0 ? pendingEvents.map(event => (
                    <div key={event.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500">
                        {/* Feed Header */}
                        <div className="p-6 flex items-center justify-between border-b border-gray-50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#f5f7f9] rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100">
                                    {event.clubs?.logo_url ? (
                                        <img src={event.clubs.logo_url} alt="Club" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="font-black text-[#0b87bd] text-lg">{event.clubs?.name[0]}</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-black text-[#1E1E2D] tracking-tight group-hover:text-[#0b87bd] transition-colors">{event.clubs?.name}</h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Transmission Request</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                {new Date(event.created_at).toLocaleDateString()}
                            </span>
                        </div>

                        {/* Event Content Overlay (Instagram style card) */}
                        <div className="p-8 space-y-6">
                            <div className="inline-block px-4 py-1.5 bg-[#0b87bd]/10 text-[#0b87bd] rounded-full text-[9px] font-black uppercase tracking-widest border border-[#0b87bd]/20">
                                📅 {new Date(event.event_date).toLocaleString()}
                            </div>

                            <h2 className="text-3xl font-black tracking-tighter text-[#1E1E2D] leading-[1.1]">
                                {event.title}
                            </h2>

                            <div className="flex items-center gap-2 text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-sm font-bold">{event.location}</span>
                            </div>

                            <div className="bg-[#f5f7f9] p-6 rounded-2xl border border-gray-100 italic">
                                <p className="text-gray-600 font-medium leading-relaxed">
                                    "{event.description}"
                                </p>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="p-6 bg-gray-50 flex items-center gap-4 border-t border-gray-100">
                            <form action={async () => {
                                'use server'
                                const s = await createSupabaseServer()

                                // Approved and Publish
                                const { error: approvalError } = await s
                                    .from('events')
                                    .update({
                                        is_admin_approved: true,
                                        status: 'published'
                                    })
                                    .eq('id', event.id)

                                if (approvalError) throw approvalError

                                // Notification (non-blocking)
                                try {
                                    const { data: lead } = await s
                                        .from('club_members')
                                        .select('user_id')
                                        .eq('club_id', event.club_id)
                                        .eq('role', 'lead')
                                        .single()

                                    if (lead?.user_id) {
                                        await s.from('notifications').insert({
                                            user_id: lead.user_id,
                                            title: 'Event Authorized',
                                            message: `Your event "${event.title}" has been authorized for campus-wide broadcast.`,
                                            type: 'success',
                                            link: '/dashboard/student/events'
                                        })
                                    }
                                } catch (e) { console.error(e) }

                                revalidatePath('/dashboard/admin/verify-events')
                                revalidatePath('/dashboard/student/events')
                                revalidatePath('/dashboard/student')
                                redirect('/dashboard/admin/verify-events')
                            }} className="flex-grow">
                                <button className="w-full py-4 bg-[#0b87bd] hover:bg-[#096a96] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-[#0b87bd]/20 flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Authorize Broadcast
                                </button>
                            </form>

                            <form action={async () => {
                                'use server'
                                const s = await createSupabaseServer()
                                await s.from('events').delete().eq('id', event.id)
                                revalidatePath('/dashboard/admin/verify-events')
                                redirect('/dashboard/admin/verify-events')
                            }}>
                                <button className="px-8 py-4 bg-white text-red-500 hover:bg-red-100 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border border-gray-200">
                                    Decline
                                </button>
                            </form>
                        </div>
                    </div>
                )) : (
                    <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-gray-200 shadow-sm">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-black text-[#1E1E2D] mb-2 tracking-tight">Broadcast Queue Empty</h3>
                        <p className="text-gray-400 font-medium text-sm px-10">All transmission requests have been processed. Systems are nominal.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
