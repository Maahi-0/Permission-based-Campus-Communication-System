'use client'

import Header from './Header'

export default function PlaceholderPage({ title, subtitle, icon = "🛠️" }) {
    return (
        <div className="pb-12 text-[#1E1E2D]">
            <Header
                title={title}
                subtitle={subtitle}
            />

            <div className="px-10 max-w-4xl">
                <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#0b87bd]/10 group-hover:bg-[#0b87bd]/30 transition-all"></div>

                    <div className="text-8xl mb-10 group-hover:scale-110 transition-transform duration-500 flex justify-center">
                        <div className="w-24 h-24 bg-[#f5f7f9] rounded-[2rem] flex items-center justify-center">
                            {icon}
                        </div>
                    </div>

                    <h3 className="text-3xl font-black text-[#1E1E2D] mb-4 tracking-tight">{title}</h3>
                    <p className="text-gray-400 max-w-md mx-auto font-medium leading-relaxed text-lg">
                        This specialized protocol segment is currently under maintenance or awaiting synchronization with the central database.
                    </p>

                    <div className="mt-12 flex justify-center gap-4">
                        <div className="px-6 py-3 bg-[#0b87bd]/5 text-[#0b87bd] text-[10px] font-black uppercase tracking-widest rounded-full border border-[#0b87bd]/10">
                            Protocol: Beta
                        </div>
                        <div className="px-6 py-3 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-100">
                            Status: Secure
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
