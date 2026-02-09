'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import Header from '@/components/dashboard/Header'
import Link from 'next/link'

export default function LiveEvents() {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // all, published, draft

    const supabase = createSupabaseClient()

    useEffect(() => {
        fetchEvents()
    }, [filter])

    const fetchEvents = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Get clubs where user is lead
            const { data: myClubs } = await supabase
                .from('club_members')
                .select('club_id')
                .eq('user_id', user.id)
                .eq('role', 'lead')

            const clubIds = myClubs?.map(mc => mc.club_id) || []

            if (clubIds.length === 0) {
                setEvents([])
                setLoading(false)
                return
            }

            // Fetch events for those clubs
            let query = supabase
                .from('events')
                .select(`
                    *,
                    clubs (name)
                `)
                .in('club_id', clubIds)
                .order('event_date', { ascending: true })

            if (filter !== 'all') {
                query = query.eq('status', filter)
            }

            const { data, error } = await query

            if (error) throw error
            setEvents(data || [])
        } catch (err) {
            console.error('Error fetching events:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (eventId, newStatus) => {
        try {
            const { error } = await supabase
                .from('events')
                .update({ status: newStatus })
                .eq('id', eventId)

            if (error) throw error
            await fetchEvents()
        } catch (err) {
            console.error('Error updating status:', err)
            alert('Failed to update event status')
        }
    }

    const handleDeleteEvent = async (eventId) => {
        if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return

        try {
            const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', eventId)

            if (error) throw error
            await fetchEvents()
        } catch (err) {
            console.error('Error deleting event:', err)
            alert('Failed to delete event')
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'published': return 'bg-[#0b87bd]/10 text-[#0b87bd] border-[#0b87bd]/20'
            case 'draft': return 'bg-gray-100 text-gray-600 border-gray-200'
            case 'cancelled': return 'bg-red-50 text-red-600 border-red-100'
            default: return 'bg-gray-100 text-gray-600 border-gray-200'
        }
    }

    return (
        <div className="pb-12 h-full">
            <Header
                title="Live Events"
                subtitle="Monitor and manage all your club events"
            />

            <div className="px-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        {['all', 'published', 'draft', 'cancelled'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === status
                                        ? 'bg-[#0b87bd] text-white shadow-lg shadow-[#0b87bd]/20'
                                        : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <Link
                        href="/dashboard/lead/create-event"
                        className="px-6 py-3 bg-[#1E1E2D] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        New Event
                    </Link>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center py-20">
                        <div className="w-10 h-10 border-4 border-[#0b87bd]/20 border-t-[#0b87bd] rounded-full animate-spin mb-4"></div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Events...</p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-16 text-center border-2 border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-black text-[#1E1E2D] mb-2">No Events Found</h3>
                        <p className="text-gray-500 text-sm mb-6">
                            {filter === 'all'
                                ? "You haven't created any events yet."
                                : `No ${filter} events found.`}
                        </p>
                        <Link
                            href="/dashboard/lead/create-event"
                            className="inline-block px-6 py-3 bg-[#0b87bd] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-[#096a96] shadow-lg shadow-[#0b87bd]/20"
                        >
                            Create Your First Event
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => (
                            <div key={event.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
                                <div className="flex items-start justify-between mb-4">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(event.status)}`}>
                                        {event.status}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleStatusChange(event.id, event.status === 'published' ? 'draft' : 'published')}
                                            className="w-8 h-8 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#0b87bd] transition-colors"
                                            title={event.status === 'published' ? 'Unpublish' : 'Publish'}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteEvent(event.id)}
                                            className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                                            title="Delete"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-black text-[#1E1E2D] mb-2 line-clamp-2 group-hover:text-[#0b87bd] transition-colors">
                                    {event.title}
                                </h3>

                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                                    {event.clubs?.name}
                                </p>

                                <p className="text-sm text-gray-600 font-medium line-clamp-2 mb-4">
                                    {event.description}
                                </p>

                                <div className="space-y-2 pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="font-medium">{formatDate(event.event_date)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="font-medium">{event.location}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
