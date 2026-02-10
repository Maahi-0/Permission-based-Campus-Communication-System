import { createSupabaseServer } from '@/lib/supabase/server'
import AboutSection from '@/components/dashboard/AboutSection'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AboutPage() {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    return <AboutSection user={user} />
}
