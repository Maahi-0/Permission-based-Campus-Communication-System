'use client'

import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Navbar() {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const router = useRouter()
    const supabase = createSupabaseClient()

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                setProfile(data)
            }
        }
        fetchUser()

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            const user = session?.user || null
            setUser(user)
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                setProfile(data)
            } else {
                setProfile(null)
            }
        })

        return () => {
            authListener.subscription.unsubscribe()
        }
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/auth/login')
        router.refresh()
    }

    return (
        <nav className="glass sticky top-0 z-50 w-full border-b border-white/5 py-4 px-6 bg-black/50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href="/" className="text-2xl font-black gradient-text tracking-tighter">
                    Campus Connect
                </Link>

                <div className="flex items-center gap-8">
                    <Link href="/dashboard" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
                        Dashboard
                    </Link>
                    <Link href="/dashboard/clubs/members" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
                        Club Members
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-bold text-white leading-tight">{profile?.full_name || user.email}</span>
                                <span className="text-[10px] uppercase tracking-widest text-primary font-black opacity-80">{profile?.role}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 px-4 py-2 rounded-xl border border-white/5 transition-all text-xs font-bold uppercase tracking-widest"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-6">
                            <Link href="/auth/login" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
                                Login
                            </Link>
                            <Link
                                href="/auth/register"
                                className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl transition-all text-sm font-bold shadow-lg shadow-primary/20"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}

