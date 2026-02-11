'use client'

import Header from "@/components/dashboard/Header"

export default function ContactSection({ user }) {
    return (
        <div className="pb-12 text-white">
            <Header
                title="Contact Support"
                subtitle="ESTABLISH DIRECT LINK"
                user={user}
            />

            <div className="max-w-4xl mx-auto">
                <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] overflow-hidden relative p-12 md:p-20 text-center">
                    {/* Background accents */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[80px] rounded-full pointer-events-none"></div>

                    <div className="relative z-10 w-full">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-8">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Encrypted Channel Active
                        </div>

                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 uppercase">Get in touch</h2>
                        <p className="text-zinc-500 text-lg mb-16 font-medium leading-relaxed max-w-2xl mx-auto italic">
                            Have a question or feedback? We're here to help. Reach out to the verified Campus Connect administration securely.
                        </p>

                        <div className="max-w-md mx-auto">
                            {/* Email Card */}
                            <div className="flex flex-col items-center gap-6 bg-zinc-800/30 p-10 rounded-[2.5rem] border border-zinc-800 hover:border-white/20 transition-all group relative overflow-hidden">
                                <div className="w-20 h-20 rounded-2xl bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-black tracking-[0.3em] text-zinc-500 mb-2">Primary Uplink</p>
                                    <p className="text-2xl font-black tracking-tight text-white">campusconnect@gmail.com</p>
                                </div>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-2xl rounded-full -mr-12 -mt-12"></div>
                            </div>
                        </div>

                        <div className="mt-20 opacity-30">
                            <p className="text-white text-[9px] font-black uppercase tracking-[0.4em]">
                                PROTOCOL_VERSION_4.0 // SECURE_HANDSHAKE_REQUIRED
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
