import Link from 'next/link';
import { createSupabaseServer } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createSupabaseServer();

  // Fetch only published events from approved clubs
  const { data: events, error } = await supabase
    .from('events')
    .select(`
      *,
      clubs (
        name
      )
    `)
    .eq('status', 'published')
    .order('event_date', { ascending: true })
    .limit(6);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] text-[#1E1E2D] selection:bg-[#22C55E]/30">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Visual Background Details */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#22C55E]/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#22C55E]/5 blur-[100px] rounded-full -ml-40 -mb-40 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-[11px] font-black uppercase tracking-[0.2em] text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-full animate-fade-in shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
            </span>
            Campus Ecosystem Active
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.95] animate-fade-in">
            Stay Connected. <br />
            <span className="gradient-text-dashboard">Broadcast Your Voice.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-gray-500 font-medium mb-12 animate-fade-in leading-relaxed">
            The unified platform for university organizations to orchestrate events, manage talent, and maintain verified campus communications.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in">
            <Link href="/auth/register" className="w-full sm:w-auto bg-[#22C55E] hover:bg-[#16A34A] text-white font-black px-10 py-5 rounded-2xl transition-all shadow-xl shadow-[#22C55E]/20 hover:scale-[1.02] active:scale-[0.98]">
              Join the Movement &rarr;
            </Link>
            <Link href="#events" className="w-full sm:w-auto glass-card-dashboard hover:bg-white text-[#1E1E2D] font-bold px-10 py-5 rounded-2xl transition-all border border-gray-200">
              Explore Events
            </Link>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-4xl font-black tracking-tight text-[#1E1E2D] mb-4">Live Updates</h2>
              <p className="text-gray-500 font-medium italic">Synchronized stream of approved campus activities.</p>
            </div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#22C55E] hover:gap-4 transition-all group">
              Dashboard Hub <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>

          {!events || events.length === 0 ? (
            <div className="bg-white p-20 text-center rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#22C55E]/10"></div>
              <div className="text-7xl mb-8 group-hover:scale-110 transition-transform duration-500">🏢</div>
              <h3 className="text-2xl font-black text-[#1E1E2D] mb-3">Silent Terminals</h3>
              <p className="text-gray-500 max-w-sm mx-auto font-medium leading-relaxed font-sans underline decoration-[#22C55E]/20 underline-offset-4">
                No published events found in the current transmission cycle.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <div key={event.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 group relative flex flex-col items-start h-full">
                  <div className="flex items-center justify-between w-full mb-8">
                    <div className="px-4 py-1.5 bg-[#F8F9FB] border border-gray-100 text-[#22C55E] text-[10px] font-black rounded-full uppercase tracking-widest">
                      {event.clubs?.name}
                    </div>
                    <div className="text-gray-300 text-[10px] font-black uppercase tracking-widest">
                      {new Date(event.event_date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                    </div>
                  </div>

                  <h3 className="text-2xl font-black mb-4 text-[#1E1E2D] group-hover:text-[#22C55E] transition-colors leading-tight">
                    {event.title}
                  </h3>

                  <p className="text-gray-500 text-sm font-medium mb-10 line-clamp-3 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="mt-auto w-full pt-6 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest gap-2">
                      <svg className="w-4 h-4 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {event.location}
                    </div>
                    <Link href={`/dashboard/events/${event.id}`} className="w-10 h-10 bg-[#F8F9FB] rounded-xl flex items-center justify-center text-[#1E1E2D] hover:bg-[#22C55E] hover:text-white transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 bg-[#1E1E2D] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[#22C55E]/5 opacity-50 z-0"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 py-12 rounded-[3.5rem] bg-white/[0.03] backdrop-blur-xl border border-white/5">
            {[
              { val: '30+', label: 'Verified Clubs' },
              { val: '1.2k', label: 'Active Students' },
              { val: '150+', label: 'Monthly Events' },
              { val: '100%', label: 'Trust Score' }
            ].map((stat, i) => (
              <div key={i} className="text-center p-6">
                <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">{stat.val}</div>
                <div className="text-[10px] uppercase font-black tracking-[0.2em] text-[#22C55E] opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

