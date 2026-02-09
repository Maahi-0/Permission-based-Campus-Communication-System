import { createSupabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({ children }) {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Attempt to fetch profile from the public.profiles table
    let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // SELF-HEALING: If profile is missing in the profiles table, 
    // reconstruct it from user_metadata (which exists if they registered via our form)
    if (!profile && user.user_metadata) {
        profile = {
            id: user.id,
            full_name: user.user_metadata.full_name || user.email.split('@')[0],
            role: user.user_metadata.role || 'student',
            institute_name: user.user_metadata.institute_name || 'Campus Connect',
            avatar_url: user.user_metadata.avatar_url || null,
            email: user.email
        }

        // Optional: Attempt to repair the DB record silently
        // This might fail if the user doesn't have permissions, but we can still proceed with the virtual profile
        try {
            await supabase.from('profiles').upsert(profile)
        } catch (e) {
            console.error('Record repair failed:', e.message)
        }
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-6 text-center">
                <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 border border-gray-100 shadow-xl">
                    <div className="text-6xl mb-6">⚠️</div>
                    <h1 className="text-2xl font-black text-[#1E1E2D] mb-4">Identity Out of Sync</h1>
                    <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                        We found your account, but your campus profile hasn't been synchronized yet. This can happen if the registration was interrupted.
                    </p>
                    <div className="space-y-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-[#22C55E] text-white font-black py-4 rounded-2xl hover:bg-[#16A34A] transition-all"
                        >
                            Retry Sync
                        </button>
                        <form action="/api/auth/sign-out" method="post">
                            <button
                                type="submit"
                                className="w-full bg-[#1E1E2D] text-white font-black py-4 rounded-2xl hover:bg-black transition-all"
                            >
                                Sign Out & Restart
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-[#F8F9FA] font-sans selection:bg-[#22C55E]/30 selection:text-[#1E1E2D]">
            {/* Left Sidebar Fixed */}
            <Sidebar user={user} profile={profile} />

            {/* Main Content Scrollable */}
            <main className="flex-1 ml-72 min-h-screen relative">
                {/* Visual Backdrop Details */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#22C55E]/5 to-transparent blur-3xl rounded-full pointer-events-none -mr-48 -mt-48 z-0"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#22C55E]/5 to-transparent blur-3xl rounded-full pointer-events-none -ml-48 -mb-48 z-0"></div>

                <div className="relative z-10">
                    {children}
                </div>
            </main>

        </div>
    )
}
