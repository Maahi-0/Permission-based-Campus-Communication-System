'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreateEvent() {
    const { clubId } = useParams()
    const router = useRouter()
    const [club, setClub] = useState(null)
    const [fetchingClub, setFetchingClub] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const supabase = createSupabaseClient()

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_date: '',
        location: '',
        status: 'draft'
    })

    useEffect(() => {
        const fetchClub = async () => {
            try {
                const { data, error } = await supabase
                    .from('clubs')
                    .select('is_approved')
                    .eq('id', clubId)
                    .single()

                if (error) throw error
                setClub(data)
            } catch (err) {
                console.error('Error fetching club:', err)
                setError('Failed to verify club status.')
            } finally {
                setFetchingClub(false)
            }
        }
        if (clubId) fetchClub()
    }, [clubId])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!club?.is_approved) {
            setError('Operational Denied: This club must be verified by administration before publishing events.')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase
                .from('events')
                .insert({
                    ...formData,
                    club_id: clubId,
                    is_admin_approved: false
                })
                .select()

            if (error) throw error

            router.push(`/dashboard/clubs/${clubId}`)
            router.refresh()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <div className="mb-10">
                <Link href={`/dashboard/clubs/${clubId}`} className="text-sm text-gray-500 hover:text-primary transition-colors mb-4 inline-block">
                    &larr; Back to Club
                </Link>
                <h1 className="text-4xl font-bold gradient-text">Create New Event</h1>
                <p className="text-gray-400 mt-2">Publish a new activity for your club members.</p>
            </div>

            <div className="glass p-8 rounded-2xl border border-white/10 shadow-2xl">
                {fetchingClub ? (
                    <div className="text-center py-12">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Verifying Club Authorization...</p>
                    </div>
                ) : !club?.is_approved ? (
                    <div className="text-center py-12 space-y-6">
                        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto border border-yellow-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="max-w-md mx-auto">
                            <h2 className="text-2xl font-bold text-white mb-3">Club Verification Required</h2>
                            <p className="text-gray-400 text-sm leading-relaxed mb-8">
                                Your club application is currently under review by the administration.
                                You will be able to publish events once your club has been verified and approved.
                            </p>
                            <Link href={`/dashboard/clubs/${clubId}`} className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10 uppercase tracking-widest text-xs">
                                Return to Club Hub
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Event Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-surface border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold"
                                    placeholder="e.g. Annual Tech Symposium"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                <textarea
                                    rows="4"
                                    required
                                    className="w-full bg-surface border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder="Details about the event, what to expect, and how to prepare..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Date & Time</label>
                                <input
                                    type="datetime-local"
                                    required
                                    className="w-full bg-surface border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    value={formData.event_date}
                                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-surface border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder="e.g. Seminar Hall B"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Initial Status</label>
                                <select
                                    className="w-full bg-surface border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="draft">Draft (Hidden from Students)</option>
                                    <option value="published">Published (Visible to All)</option>
                                </select>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                                <span className="font-bold block mb-1">Authorization Error:</span>
                                {error}
                            </div>
                        )}

                        <div className="pt-4 flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-grow bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 shadow-lg shadow-primary/25"
                            >
                                {loading ? 'Processing...' : 'Create Event'}
                            </button>
                            <Link
                                href={`/dashboard/clubs/${clubId}`}
                                className="px-8 py-4 glass-card hover:bg-white/5 rounded-xl font-bold transition-all"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                )}
            </div>

            <div className="mt-8 p-6 rounded-2xl bg-yellow-500/5 border border-yellow-500/20">
                <h3 className="text-yellow-500 font-bold mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M2.166 15.849L10 1.954l7.834 13.895A1 1 0 0117 17H3a1 1 0 01-.834-1.151zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Security Enforcement
                </h3>
                <p className="text-gray-400 text-sm">
                    If you are logged in as a student or attempting to create an event for a club you don't lead,
                    Supabase <strong>Row Level Security (RLS)</strong> will reject this operation at the database level.
                </p>
            </div>
        </div>
    )
}
