'use client'

import NotificationDropdown from './NotificationDropdown'
import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function Header({ title, subtitle, user }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [results, setResults] = useState({ clubs: [], events: [] })
    const [isSearching, setIsSearching] = useState(false)
    const supabase = createSupabaseClient()

    useEffect(() => {
        const search = async () => {
            if (searchQuery.trim().length < 2) {
                setResults({ clubs: [], events: [] })
                return
            }
            setIsSearching(true)
            try {
                const [clubRes, eventRes] = await Promise.all([
                    supabase.from('clubs').select('id, name').ilike('name', `%${searchQuery}%`).eq('is_approved', true).limit(5),
                    supabase.from('events').select('id, title').ilike('title', `%${searchQuery}%`).eq('is_admin_approved', true).eq('status', 'published').limit(5)
                ])
                setResults({
                    clubs: clubRes.data || [],
                    events: eventRes.data || []
                })
            } catch (error) {
                console.error('Search error:', error)
            } finally {
                setIsSearching(false)
            }
        }
        const timer = setTimeout(search, 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0 py-10 bg-transparent">
            <div className="flex-grow text-center md:text-left max-w-xl">
                <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                    <span className="opacity-50">Terminal</span>
                    <span className="opacity-30">/</span>
                    <span className="text-white border-b-2 border-white/20 pb-0.5">{title}</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-4">
                    {title}
                </h1>

                <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.4em]">
                    {subtitle}
                </p>
            </div>

            <div className="flex items-center justify-center md:justify-end gap-4 w-full md:w-auto relative">
                <div className="relative group flex-grow md:flex-grow-0">
                    <input
                        type="text"
                        placeholder="SEARCH COMMS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 focus:border-white focus:bg-zinc-900 rounded-2xl pl-12 pr-6 py-3.5 text-xs font-black text-white outline-none transition-all w-full md:w-72 shadow-2xl tracking-widest uppercase"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        {isSearching ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        )}
                    </div>

                    {/* Search Results Dropdown */}
                    {searchQuery.trim().length >= 2 && (
                        <div className="absolute top-full mt-4 left-0 right-0 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,1)] overflow-hidden z-[100] p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            {results.clubs.length === 0 && results.events.length === 0 && !isSearching ? (
                                <div className="p-4 text-center text-xs font-bold text-zinc-500 uppercase tracking-widest">No matching frequencies</div>
                            ) : (
                                <>
                                    {results.clubs.length > 0 && (
                                        <div className="mb-4">
                                            <div className="px-3 py-1 text-[10px] font-black text-zinc-500 uppercase tracking-widest opacity-50 mb-1">Clubs</div>
                                            {results.clubs.map(club => (
                                                <Link key={club.id} href={`/dashboard/clubs/${club.id}`} className="flex items-center px-4 py-3 hover:bg-zinc-800 rounded-xl transition-colors group">
                                                    <span className="text-sm font-bold text-white tracking-tight">{club.name}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                    {results.events.length > 0 && (
                                        <div>
                                            <div className="px-3 py-1 text-[10px] font-black text-zinc-500 uppercase tracking-widest opacity-50 mb-1">Events</div>
                                            {results.events.map(event => (
                                                <Link key={event.id} href={`/dashboard/events/${event.id}`} className="flex items-center px-4 py-3 hover:bg-zinc-800 rounded-xl transition-colors group">
                                                    <span className="text-sm font-bold text-white tracking-tight">{event.title}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                <NotificationDropdown user={user} />
            </div>
        </header>
    )
}
