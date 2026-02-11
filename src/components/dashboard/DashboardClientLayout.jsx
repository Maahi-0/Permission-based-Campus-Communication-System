'use client'
import Sidebar from './Sidebar'

export default function DashboardClientLayout({ user, profile, children }) {
    return (
        <div className="min-h-screen bg-black font-sans selection:bg-purple-500/30 selection:text-white relative">
            {/* Navigation (Sidebar Desktop / Bottom Nav Mobile) */}
            <Sidebar
                user={user}
                profile={profile}
            />

            {/* Main Content */}
            <main className="min-h-screen w-full lg:pl-72 pb-24 lg:pb-0 transition-all duration-300 bg-black">
                {/* Visual Backdrop Details */}
                <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent blur-3xl rounded-full pointer-events-none -mr-48 -mt-48 z-0"></div>
                <div className="fixed bottom-0 left-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent blur-3xl rounded-full pointer-events-none -ml-48 -mb-48 z-0"></div>

                {/* Content Area */}
                <div className="relative z-10 flex flex-col min-h-screen">
                    <div className="flex-grow w-full max-w-6xl mx-auto px-6 py-12 md:py-20">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}
