import { createSupabaseServer } from '@/lib/supabase/server'
import ContactSection from '@/components/dashboard/ContactSection'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ContactPage() {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    return <ContactSection user={user} />
}
