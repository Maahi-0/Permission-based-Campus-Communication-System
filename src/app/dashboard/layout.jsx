import { createSupabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClientLayout from '@/components/dashboard/DashboardClientLayout'

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

        try {
            await supabase.from('profiles').upsert(profile)
        } catch (e) {
            console.error('Record repair failed:', e.message)
        }
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black p-6 text-center">
                <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
                    <div className="text-6xl mb-8 grayscale opacity-50">📡</div>
                    <h1 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">IDENTITY_DESYNC</h1>
                    <p className="text-zinc-500 font-medium mb-10 leading-relaxed text-sm">
                        Node identified but profile data packet is missing. This can occur if the synchronization handshake was interrupted during initialization.
                    </p>
                    <div className="space-y-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-zinc-200 transition-all text-xs uppercase tracking-widest"
                        >
                            Reconnect Node
                        </button>
                        <form action="/api/auth/sign-out" method="post">
                            <button
                                type="submit"
                                className="w-full bg-zinc-800 text-white font-black py-4 rounded-2xl hover:bg-zinc-700 transition-all text-xs uppercase tracking-widest border border-zinc-700"
                            >
                                Terminate Session
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <DashboardClientLayout user={user} profile={profile}>
            {children}
        </DashboardClientLayout>
    )
}
