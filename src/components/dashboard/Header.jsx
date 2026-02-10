'use client'

import NotificationDropdown from './NotificationDropdown'

export default function Header({ title, subtitle, user }) {
    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-10 bg-transparent">
            {/* Left Spacer for desktop to keep center alignment true centering if possible, 
                but simple centering for now */}
            <div className="hidden md:block w-72"></div>

            <div className="flex-grow text-center">
                <div className="flex items-center justify-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">
                    <span>Pages</span>
                    <span>/</span>
                    <span className="text-[#0b87bd]">{title}</span>
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-[#0b87bd]">{title}</h1>
                <p className="text-gray-400 font-bold text-xs mt-1 uppercase tracking-widest">{subtitle}</p>
            </div>

            <div className="flex items-center justify-center md:justify-end gap-4 w-72">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-white border-2 border-transparent focus:border-[#0b87bd]/20 focus:bg-white rounded-2xl pl-12 pr-6 py-3 text-sm font-semibold text-gray-900 outline-none transition-all w-64 shadow-sm"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <NotificationDropdown user={user} />
            </div>
        </header>
    )
}
