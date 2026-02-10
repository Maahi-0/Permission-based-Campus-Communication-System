'use client'

import Header from "@/components/dashboard/Header"

export default function ContactSection({ user }) {
    return (
        <div className="pb-12 text-[#1E1E2D]">
            <Header
                title="Contact Support"
                subtitle="We'd love to hear from you."
                user={user}
            />

            <div className="px-6 md:px-10 max-w-7xl mx-auto">
                <div className="bg-[#1E1E2D] rounded-[2.5rem] overflow-hidden shadow-2xl min-h-[500px] relative flex items-center justify-center p-10 md:p-16">
                    {/* Background acccents */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0b87bd]/10 blur-[100px] rounded-full pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#0b87bd]/10 blur-[80px] rounded-full pointer-events-none"></div>

                    {/* Centered Info */}
                    <div className="w-full max-w-3xl text-white flex flex-col items-center text-center relative z-10">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Get in touch</h2>
                        <p className="text-white/60 text-lg md:text-xl mb-12 font-medium leading-relaxed">
                            Have a question or feedback? We're here to help. Reach out to the verified Campus Connect administration securely.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                            {/* Email Card */}
                            <div className="flex flex-col items-center gap-4 bg-white/5 p-8 rounded-[2rem] border border-white/5 hover:border-[#0b87bd]/30 transition-all hover:bg-white/10 group">
                                <div className="w-16 h-16 rounded-2xl bg-[#0b87bd]/20 flex items-center justify-center text-[#0b87bd] group-hover:bg-[#0b87bd] group-hover:text-white transition-all mb-2">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs uppercase font-black tracking-widest text-[#0b87bd] mb-1">Email Support</p>
                                    <p className="text-xl font-bold">capusconnect@gmail.com</p>
                                </div>
                            </div>


                        </div>

                        <div className="mt-16 opacity-50">
                            <p className="text-white text-xs font-medium uppercase tracking-wider">
                                By accessing our services, you agree to our Protocol Terms.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
