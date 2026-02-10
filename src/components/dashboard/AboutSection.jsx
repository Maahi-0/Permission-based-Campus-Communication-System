import Header from "@/components/dashboard/Header"

export default function AboutSection({ user }) {
    return (
        <div className="pb-12 text-[#1E1E2D]">
            <Header
                title="About Platform"
                subtitle="Discover the vision behind Campus Connect."
                user={user}
            />

            <div className="px-6 md:px-10 max-w-7xl mx-auto space-y-12">

                {/* Hero Section */}
                <div className="relative w-full h-[400px] rounded-[2.5rem] overflow-hidden shadow-2xl group">
                    <img
                        src="/images/campus-connect-hero.png"
                        alt="Campus Connect Vision"
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b87bd]/90 via-[#0b87bd]/40 to-transparent flex flex-col justify-end p-10 md:p-16">
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 drop-shadow-lg">
                            Connecting Campus.<br />Empowering Students.
                        </h2>
                        <p className="text-white/90 font-medium text-lg max-w-2xl drop-shadow-md">
                            The central hub for all student activities, club management, and event discovery.
                        </p>
                    </div>
                </div>

                {/* Overview & Bridge Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* The Overview Card */}
                    <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                        <div className="w-14 h-14 bg-[#0b87bd]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#0b87bd] transition-colors duration-300">
                            <svg className="w-7 h-7 text-[#0b87bd] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-black text-[#1E1E2D] mb-4 tracking-tight">System Overview</h3>
                        <div className="space-y-4 text-gray-600 leading-relaxed">
                            <p>
                                <span className="font-bold text-[#0b87bd]">Campus Connect</span> is designed to be the digital heartbeat of university life. It provides a centralized platform where students can discover verified clubs, track upcoming events, and engage with the campus community in real-time.
                            </p>
                            <p>
                                Administrators have powerful tools to oversee campus activities, ensuring a safe and organized environment, while Club Leads are given the autonomy to manage their organizations efficiently—from member recruitment to event promotion.
                            </p>
                        </div>
                    </div>

                    {/* The "Bridging the Gap" Card */}
                    <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0b87bd]/5 rounded-bl-full -mr-10 -mt-10"></div>

                        <div className="w-14 h-14 bg-[#0b87bd]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#0b87bd] transition-colors duration-300 relative z-10">
                            <svg className="w-7 h-7 text-[#0b87bd] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>

                        <h3 className="text-2xl font-black text-[#1E1E2D] mb-4 tracking-tight relative z-10">Bridging the Gap</h3>
                        <div className="space-y-4 text-gray-600 leading-relaxed relative z-10">
                            <p>
                                Traditionally, finding club information meant scouring physical notice boards or navigating fragmented social media groups. <span className="font-bold text-[#0b87bd]">Campus Connect</span> bridges this gap by bringing transparency and accessibility to the forefront.
                            </p>
                            <ul className="space-y-3 mt-4">
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#0b87bd] mt-2 flex-shrink-0"></div>
                                    <span><strong className="text-gray-900">For Students:</strong> No more missed opportunities. All events are verified and centralized.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#0b87bd] mt-2 flex-shrink-0"></div>
                                    <span><strong className="text-gray-900">For Clubs:</strong> Direct access to the student body without relying on word-of-mouth.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#0b87bd] mt-2 flex-shrink-0"></div>
                                    <span><strong className="text-gray-900">For Admin:</strong> A clear oversight of campus engagement and resource utilization.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom CTA / Stats (Optional Flair) */}
                <div className="bg-[#1E1E2D] rounded-[2rem] p-10 md:p-16 text-center text-white relative overflow-hidden">
                    <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[200%] bg-[#0b87bd]/20 rotate-12 blur-3xl"></div>
                    <div className="absolute bottom-[-50%] right-[-10%] w-[50%] h-[200%] bg-[#0b87bd]/20 -rotate-12 blur-3xl"></div>

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h3 className="text-3xl font-black tracking-tight mb-6">Ready to get involved?</h3>
                        <p className="text-white/70 text-lg mb-8">
                            Whether you're looking to lead, participate, or just explore – there's a place for you here.
                        </p>
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#0b87bd] rounded-xl font-bold text-white hover:bg-[#096a96] transition-colors cursor-default">
                            Campus Connect v1.0
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
