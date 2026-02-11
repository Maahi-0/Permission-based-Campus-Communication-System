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
        name,
        logo_url
      )
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(10);

  const heroWords = "Stay Connected. Broadcast Your Voice.".split(" ");

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-purple-500/30 page-glow-container">
      {/* Dynamic Circulating Beam */}
      <div className="circulating-beam"></div>

      {/* Hero Section */}
      <section className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden py-20 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto w-full relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-10 text-[10px] font-black uppercase tracking-[0.3em] text-purple-400 bg-purple-400/10 border border-purple-400/20 rounded-full w-fit backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-400"></span>
            </span>
            Campus Network Online
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-[0.9] flex flex-wrap justify-center gap-x-4 md:gap-x-6">
            {heroWords.map((word, i) => (
              <span
                key={i}
                className="animate-word"
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                {word}
              </span>
            ))}
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 font-medium mb-16 leading-relaxed animate-fade-in [animation-delay:0.8s]">
            The unified platform for university organizations to orchestrate events, manage talent, and maintain verified campus communications.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in [animation-delay:1s]">
            <Link href="/auth/register" className="w-full sm:w-auto bg-white text-black hover:bg-zinc-200 font-black px-10 py-5 rounded-full transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-[1.05] active:scale-[0.98] text-center text-sm uppercase tracking-widest">
              Join the Movement
            </Link>
            <Link href="/auth/login" className="w-full sm:w-auto bg-transparent border-2 border-zinc-800 hover:border-zinc-600 text-white font-bold px-10 py-5 rounded-full transition-all backdrop-blur-md text-center text-sm uppercase tracking-widest">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Events Feed Section */}
      <section id="events" className="py-24 relative bg-black">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex flex-col items-center mb-20 text-center">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-6">Explore Feed</h2>
            <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          </div>

          {!events || events.length === 0 ? (
            <div className="glass-card p-20 text-center rounded-[2.5rem] relative overflow-hidden">
              <div className="text-7xl mb-8">📡</div>
              <h3 className="text-2xl font-black text-white mb-3">Quiet Transmission</h3>
              <p className="text-zinc-500 max-w-sm mx-auto font-medium leading-relaxed">
                No published events found in the current transmission cycle.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {events.map((event) => (
                <div key={event.id} className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] overflow-hidden group hover:border-zinc-700 transition-all duration-500">
                  {/* Feed Header */}
                  <div className="p-6 flex items-center justify-between border-b border-zinc-800/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-black text-white text-xs">
                        {event.clubs?.logo_url ? (
                          <img src={event.clubs.logo_url} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          event.clubs?.name?.[0] || 'C'
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-white tracking-tight">{event.clubs?.name}</h4>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                          {new Date(event.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-zinc-800/50 rounded-full text-[10px] font-black text-purple-400 uppercase tracking-widest border border-purple-500/20">
                      Live
                    </div>
                  </div>

                  {/* Feed Content */}
                  <div className="p-8">
                    <h3 className="text-3xl font-black mb-6 text-white group-hover:text-purple-400 transition-colors tracking-tighter leading-tight">
                      {event.title}
                    </h3>
                    <p className="text-zinc-400 text-lg font-medium mb-8 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="flex flex-wrap gap-4 mb-8">
                      <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/30 rounded-xl border border-zinc-800 text-zinc-400 text-xs font-bold font-mono">
                        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {event.location}
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/30 rounded-xl border border-zinc-800 text-zinc-400 text-xs font-bold font-mono">
                        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(event.event_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/events/${event.id}`}
                      className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-widest text-white group/btn"
                    >
                      View Full Briefing
                      <span className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-black transition-all">
                        &rarr;
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 md:py-40 bg-black relative border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { val: '30+', label: 'Clubs' },
              { val: '1.2k', label: 'Nodes' },
              { val: '150+', label: 'Events' },
              { val: '100%', label: 'Uptime' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-7xl font-black text-white mb-4 tracking-tighter">{stat.val}</div>
                <div className="text-[10px] uppercase font-black tracking-[0.4em] text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

