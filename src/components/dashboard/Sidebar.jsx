'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function Sidebar({ user, profile }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createSupabaseClient()
    const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/auth/login')
    }

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUpdatingAvatar(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}-${Math.random()}.${fileExt}`
            const filePath = `avatars/${fileName}`

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('profiles')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('profiles')
                .getPublicUrl(filePath)

            // Update Profile in DB
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id)

            if (updateError) throw updateError

            router.refresh()
        } catch (error) {
            console.error('Error updating avatar:', error.message)
        } finally {
            setIsUpdatingAvatar(false)
        }
    }

    const menuItems = {
        student: [
            { name: 'Dashboard', path: '/dashboard/student', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
            { name: 'Events', path: '/dashboard/student/events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { name: 'Clubs', path: '/dashboard/clubs/all', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
            { name: 'About', path: '/dashboard/student/about', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            { name: 'Contact', path: '/dashboard/student/contact', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
        ],
        club_lead: [
            { name: 'Dashboard', path: '/dashboard/lead', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
            { name: 'Create Club', path: '/dashboard/lead/create-club', icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z' },
            { name: 'Members', path: '/dashboard/lead/members', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
            { name: 'Create Event', path: '/dashboard/lead/create-event', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
            { name: 'Live Events', path: '/dashboard/lead/live-events', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
            { name: 'All Clubs', path: '/dashboard/clubs/all', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
        ],
        admin: [
            { name: 'Dashboard', path: '/dashboard/admin', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
            { name: 'All Clubs', path: '/dashboard/clubs/all', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
            { name: 'Verify Clubs', path: '/dashboard/admin/verify-clubs', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { name: 'Members', path: '/dashboard/admin/members', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
            { name: 'Settings', path: '/dashboard/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
        ],
    }

    const currentRole = profile?.role || 'student'
    const items = menuItems[currentRole] || menuItems.student

    return (
        <aside className="w-72 bg-[#22C55E] h-screen fixed left-0 top-0 text-white flex flex-col p-8 transition-all duration-300 z-50">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-black/5">
                    <div className="w-5 h-5 bg-[#22C55E] rounded-sm transform rotate-45"></div>
                </div>
                <span className="text-xl font-black tracking-tighter text-white">Campus Connect</span>
            </div>

            {/* Profile Section */}
            <div className="relative group mb-12 px-2">
                <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                        <div className="w-24 h-24 rounded-full border-4 border-white/20 overflow-hidden shadow-2xl relative">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-white/10 flex items-center justify-center text-3xl font-black text-white">
                                    {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                            {isUpdatingAvatar && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center border-4 border-[#22C55E] cursor-pointer hover:scale-110 transition-transform shadow-lg">
                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={isUpdatingAvatar} />
                            <svg className="w-4 h-4 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </label>
                    </div>
                    <div className="text-center text-white">
                        <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Welcome back,</p>
                        <h3 className="text-lg font-black tracking-tight line-clamp-1">{profile?.full_name || 'User'}</h3>
                        <div className="mt-2 px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-white/80 border border-white/5">
                            {currentRole.replace('_', ' ')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-grow space-y-1 overflow-y-auto custom-scrollbar pr-2">
                {items.map((item) => {
                    const isActive = pathname === item.path
                    return (
                        <Link
                            key={item.name}
                            href={item.path}
                            className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 group relative ${isActive
                                ? 'bg-white text-[#22C55E] shadow-xl'
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {isActive && <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full"></div>}
                            <svg
                                className={`w-5 h-5 transition-colors ${isActive ? 'text-[#22C55E]' : 'text-white/60 group-hover:text-white'}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                            </svg>
                            <span className="text-sm font-bold tracking-tight">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="pt-8 mt-auto border-t border-white/10">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-6 py-4 text-white/60 hover:text-white rounded-2xl transition-all group"
                >
                    <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm font-bold tracking-tight">Log Out</span>
                </button>
            </div>

        </aside>
    )
}
