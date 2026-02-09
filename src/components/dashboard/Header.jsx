export default function Header({ title, subtitle, user }) {
    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-10 bg-transparent">
            <div>
                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">
                    <span>Pages</span>
                    <span>/</span>
                    <span className="text-gray-900">{title}</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-[#1E1E2D]">{title}</h1>
                <p className="text-gray-500 font-medium text-sm mt-1">{subtitle}</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-white border-2 border-transparent focus:border-[#22C55E]/20 focus:bg-white rounded-2xl pl-12 pr-6 py-3 text-sm font-semibold text-gray-900 outline-none transition-all w-64 shadow-sm"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-[#22C55E] hover:bg-[#22C55E]/5 transition-all shadow-sm border border-white/5">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </button>
            </div>
        </header>
    )
}
