import { createSupabaseServer } from '@/lib/supabase/server'
import Header from '@/components/dashboard/Header'

export default async function PlaceholderPage({ title, subtitle }) {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="pb-12 text-[#1E1E2D]">
            <Header
                title={title}
                subtitle={subtitle || "This section is under active development."}
                user={user}
            />

            <div className="px-10">
                <div className="bg-white rounded-[2rem] p-20 text-center border shadow-sm border-gray-100 min-h-[400px] flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-[#f5f7f9] rounded-3xl flex items-center justify-center text-[#0b87bd] mb-8 animate-pulse text-4xl">
                        🚀
                    </div>
                    <h2 className="text-3xl font-black mb-4 tracking-tight">Accessing Intelligence...</h2>
                    <p className="text-gray-500 max-w-sm font-medium leading-relaxed">
                        We are currently synchronizing the <strong>{title}</strong> database. Access will be granted shortly as part of the system protocol.
                    </p>
                </div>
            </div>
        </div>
    )
}
