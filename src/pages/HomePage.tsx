import { useState, useEffect, type FormEvent } from 'react';
import { Search, Plane, ArrowLeftRight, Calendar, Users, MapPin, Sparkles, ShieldCheck, Tag, Globe2 } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import { todayISO } from '@/lib/utils';
import type { Airport } from '@/types';

export function HomePage() {
  const { navigate } = useRouter();
  const [airports, setAirports] = useState<Airport[]>([]);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [cabin, setCabin] = useState('economy');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('airports')
      .select('id, code, name, city, country')
      .order('city')
      .then(({ data }) => {
        if (data) setAirports(data as Airport[]);
        setLoading(false);
      });
  }, []);

  const airportLabel = (a: Airport) => `${a.city} (${a.code}) — ${a.country}`;

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (origin) params.set('from', origin);
    if (destination) params.set('to', destination);
    if (date) params.set('date', date);
    params.set('passengers', passengers);
    params.set('cabin', cabin);
    navigate(`/search?${params.toString()}`);
  };

  const swap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background flight photo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/1493756/pexels-photo-1493756.jpeg?auto=compress&cs=tinysrgb&w=1920')",
          }}
        />
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950/90 via-brand-900/80 to-brand-800/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/95 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{
          backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(34,211,238,0.6), transparent 40%), radial-gradient(circle at 80% 60%, rgba(249,115,22,0.5), transparent 45%)',
        }} />
        <div className="absolute top-8 right-4 sm:right-10 opacity-20 animate-float">
          <Plane className="h-20 w-20 sm:h-32 sm:w-32 text-white -rotate-45" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-28 sm:pt-20 sm:pb-36 lg:pt-28 lg:pb-44">
          <div className="max-w-2xl animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-cyan-100 ring-1 ring-white/20 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Compare 900+ flights across 30 airlines
            </div>
            <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Find the perfect flight at the right price
            </h1>
            <p className="mt-4 text-base text-cyan-50/90 sm:text-lg max-w-xl">
              Search hundreds of routes, compare fares across cabin classes, and book in minutes. Your next journey starts here.
            </p>
          </div>
        </div>

        {/* Search card overlapping hero */}
        <div className="relative mx-auto max-w-6xl px-3 sm:px-4 lg:px-8 -mt-16 sm:-mt-20 lg:-mt-24 pb-8">
          <form
            onSubmit={onSearch}
            className="card animate-fade-up p-4 sm:p-6"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
              <div className="sm:col-span-1 lg:col-span-4">
                <label className="label" htmlFor="origin">
                  <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> From</span>
                </label>
                <select
                  id="origin"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="input"
                  disabled={loading}
                >
                  <option value="">Any origin</option>
                  {airports.map((a) => (
                    <option key={a.id} value={a.code}>{airportLabel(a)}</option>
                  ))}
                </select>
              </div>

              <div className="hidden lg:flex lg:col-span-1 items-end justify-center pb-2">
                <button
                  type="button"
                  onClick={swap}
                  className="rounded-full border border-slate-200 p-2.5 text-slate-400 hover:border-brand-400 hover:text-brand-600 transition-colors"
                  aria-label="Swap origin and destination"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </button>
              </div>

              {/* Mobile swap button */}
              <div className="flex justify-center sm:hidden">
                <button
                  type="button"
                  onClick={swap}
                  className="rounded-full border border-slate-200 p-2 text-slate-400 hover:border-brand-400 hover:text-brand-600 transition-colors"
                  aria-label="Swap origin and destination"
                >
                  <ArrowLeftRight className="h-4 w-4 rotate-90" />
                </button>
              </div>

              <div className="sm:col-span-1 lg:col-span-4">
                <label className="label" htmlFor="destination">
                  <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> To</span>
                </label>
                <select
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="input"
                  disabled={loading}
                >
                  <option value="">Any destination</option>
                  {airports.map((a) => (
                    <option key={a.id} value={a.code}>{airportLabel(a)}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="label" htmlFor="date">
                  <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Date</span>
                </label>
                <input
                  id="date"
                  type="date"
                  min={todayISO()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="label" htmlFor="passengers">
                  <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Passengers</span>
                </label>
                <select
                  id="passengers"
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  className="input"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? 'passenger' : 'passengers'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="cabin">
                  <span className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> Cabin class</span>
                </label>
                <select
                  id="cabin"
                  value={cabin}
                  onChange={(e) => setCabin(e.target.value)}
                  className="input"
                >
                  <option value="economy">Economy</option>
                  <option value="business">Business</option>
                  <option value="first">First Class</option>
                </select>
              </div>

              <div className="flex items-end">
                <button type="submit" className="btn-primary w-full h-[46px]">
                  <Search className="h-5 w-5" /> Search flights
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { icon: Tag, title: 'Best price guarantee', desc: 'Compare economy, business, and first-class fares side by side so you always find the best deal for your budget.' },
            { icon: Globe2, title: '900+ flights worldwide', desc: 'From short domestic hops to long-haul international journeys, browse flights across 20 major airports.' },
            { icon: ShieldCheck, title: 'Secure booking', desc: 'Your bookings are tied to your account and protected with bank-grade security. Cancel anytime before departure.' },
          ].map((f) => (
            <div key={f.title} className="card group p-6 transition-all hover:shadow-cardhover hover:-translate-y-1">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white transition-transform group-hover:scale-110">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular routes */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-2xl font-bold text-slate-900">Popular routes</h2>
        <p className="mt-1 text-sm text-slate-500">Jump straight to a favorite destination</p>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[
            { from: 'JFK', to: 'LHR', label: 'New York → London' },
            { from: 'JFK', to: 'LAX', label: 'New York → Los Angeles' },
            { from: 'LHR', to: 'DXB', label: 'London → Dubai' },
            { from: 'SFO', to: 'HND', label: 'San Francisco → Tokyo' },
            { from: 'JFK', to: 'CDG', label: 'New York → Paris' },
            { from: 'LHR', to: 'SIN', label: 'London → Singapore' },
            { from: 'JFK', to: 'DXB', label: 'New York → Dubai' },
            { from: 'LAX', to: 'JFK', label: 'Los Angeles → New York' },
          ].map((r) => (
            <button
              key={r.label}
              onClick={() => navigate(`/search?from=${r.from}&to=${r.to}&passengers=1&cabin=economy`)}
              className="card group flex items-center gap-3 p-4 text-left transition-all hover:shadow-cardhover hover:ring-brand-300 hover:-translate-y-0.5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient text-white transition-transform group-hover:scale-110">
                <Plane className="h-4 w-4 -rotate-45" />
              </div>
              <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{r.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
