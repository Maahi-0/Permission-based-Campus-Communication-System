'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterClub() {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const router = useRouter()
    const supabase = createSupabaseClient()

    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // 1. Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // 2. Insert club (is_approved defaults to false)
            const { data: club, error: clubError } = await supabase
                .from('clubs')
                .insert({ name, description })
                .select()
                .single()

            if (clubError) throw clubError

            // 3. Make the creator the initial lead
            const { error: memberError } = await supabase
                .from('club_members')
                .insert({
                    club_id: club.id,
                    user_id: user.id,
                    role: 'lead'
                })

            if (memberError) throw memberError

            router.push('/dashboard')
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
                <Link href="/dashboard" className="text-sm text-gray-500 hover:text-primary transition-colors mb-4 inline-block">
                    &larr; Back to Dashboard
                </Link>
                <h1 className="text-4xl font-bold gradient-text">Register New Club</h1>
                <p className="text-gray-400 mt-2">Submit your club details for verification.</p>
            </div>

            <div className="glass p-8 rounded-3xl border border-white/10 shadow-2xl animate-fade-in">
                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Club Name</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-surface border border-border rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold text-lg"
                            placeholder="e.g. Google Developer Student Clubs"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                        <textarea
                            rows="5"
                            required
                            className="w-full bg-surface border border-border rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            placeholder="Tell us about the club's mission, goals, and planned activities..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-5 py-3 rounded-xl text-sm">
                            <span className="font-bold block mb-1">Registration Failed:</span>
                            {error}
                        </div>
                    )}

                    <div className="pt-4 flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-grow bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 shadow-lg shadow-primary/25"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                'Submit for Verification'
                            )}
                        </button>
                        <Link
                            href="/dashboard"
                            className="px-8 py-4 glass-card hover:bg-white/5 rounded-xl font-bold transition-all flex items-center"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>

            <div className="mt-12 p-8 rounded-3xl bg-primary/5 border border-primary/10">
                <h3 className="text-primary font-bold mb-3 flex items-center gap-2 text-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verification Process
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                    Once submitted, your application will be reviewed by the college administration.
                    If approved, you will be assigned as the <strong>Club Lead</strong> and can begin publishing events.
                    Verification typically takes 24-48 hours.
                </p>
            </div>
        </div>
    )
}
