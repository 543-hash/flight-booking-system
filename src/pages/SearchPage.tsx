import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Plane, ArrowLeftRight, Loader2, X, Inbox } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import type { Airport, Flight, CabinClass } from '@/types';
import { FlightCard } from '@/components/FlightCard';
import { formatCurrency, isSameDay } from '@/lib/utils';
import { priceForCabin, CABIN_CLASS_LABELS } from '@/types';

type SortKey = 'price' | 'duration' | 'departure';

export function SearchPage() {
  const { route, navigate } = useRouter();
  const fromCode = route.query.get('from') || '';
  const toCode = route.query.get('to') || '';
  const dateStr = route.query.get('date') || '';
  const passengers = parseInt(route.query.get('passengers') || '1', 10);
  const cabin = (route.query.get('cabin') || 'economy') as CabinClass;

  const [airports, setAirports] = useState<Airport[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [origin, setOrigin] = useState(fromCode);
  const [destination, setDestination] = useState(toCode);
  const [date, setDate] = useState(dateStr);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('price');
  const [airlineFilter, setAirlineFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    supabase.from('airports').select('id, code, name, city, country').order('city').then(({ data }) => {
      if (data) setAirports(data as Airport[]);
    });
  }, []);

  useEffect(() => {
    setOrigin(fromCode);
    setDestination(toCode);
    setDate(dateStr);
  }, [fromCode, toCode, dateStr]);

  useEffect(() => {
    let query = supabase
      .from('flights')
      .select('*, origin:airports!flights_origin_id_fkey(*), destination:airports!flights_destination_id_fkey(*)')
      .gt('departure_time', new Date().toISOString())
      .order('departure_time', { ascending: true });

    if (fromCode) {
      const originAirport = airports.find((a) => a.code === fromCode);
      if (originAirport) query = query.eq('origin_id', originAirport.id);
    }
    if (toCode) {
      const destAirport = airports.find((a) => a.code === toCode);
      if (destAirport) query = query.eq('destination_id', destAirport.id);
    }

    setLoading(true);
    setError(null);
    query.then(({ data, error: err }) => {
      setLoading(false);
      if (err) {
        setError('Could not load flights. Please try again.');
        return;
      }
      setFlights((data ?? []) as Flight[]);
    });
  }, [fromCode, toCode, airports]);

  const filtered = useMemo(() => {
    let result = [...flights];

    if (dateStr) {
      const target = new Date(dateStr + 'T00:00:00');
      result = result.filter((f) => isSameDay(f.departure_time, target));
    }
    if (airlineFilter) {
      result = result.filter((f) => f.airline === airlineFilter);
    }
    if (maxPrice !== null) {
      result = result.filter((f) => priceForCabin(f, cabin) <= maxPrice);
    }
    result = result.filter((f) => f.available_seats >= passengers);

    result.sort((a, b) => {
      if (sortKey === 'price') return priceForCabin(a, cabin) - priceForCabin(b, cabin);
      if (sortKey === 'duration') return a.duration_minutes - b.duration_minutes;
      return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime();
    });

    return result;
  }, [flights, dateStr, airlineFilter, maxPrice, sortKey, cabin, passengers]);

  const airlines = useMemo(() => {
    const set = new Map<string, string>();
    flights.forEach((f) => set.set(f.airline, f.airline_code));
    return Array.from(set.entries()).map(([name, code]) => ({ name, code }));
  }, [flights]);

  const priceRange = useMemo(() => {
    if (flights.length === 0) return { min: 0, max: 0 };
    const prices = flights.map((f) => priceForCabin(f, cabin));
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [flights, cabin]);

  const airportLabel = (code: string) => {
    const a = airports.find((x) => x.code === code);
    return a ? `${a.city} (${a.code})` : code;
  };

  const updateSearch = (newFrom: string, newTo: string, newDate: string) => {
    const params = new URLSearchParams();
    if (newFrom) params.set('from', newFrom);
    if (newTo) params.set('to', newTo);
    if (newDate) params.set('date', newDate);
    params.set('passengers', String(passengers));
    params.set('cabin', cabin);
    navigate(`/search?${params.toString()}`);
  };

  const swap = () => {
    setOrigin(destination);
    setDestination(origin);
    updateSearch(destination, origin, date);
  };

  const onBook = (flight: Flight) => {
    const params = new URLSearchParams();
    params.set('flight', flight.id);
    params.set('cabin', cabin);
    params.set('passengers', String(passengers));
    navigate(`/book?${params.toString()}`);
  };

  const resetFilters = () => {
    setMaxPrice(null);
    setAirlineFilter('');
    setSortKey('price');
  };

  const hasFilters = maxPrice !== null || airlineFilter !== '';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Search summary bar */}
      <div className="card p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end">
          <div className="sm:col-span-4">
            <label className="label">From</label>
            <select value={origin} onChange={(e) => setOrigin(e.target.value)} className="input">
              <option value="">Any origin</option>
              {airports.map((a) => <option key={a.id} value={a.code}>{a.city} ({a.code})</option>)}
            </select>
          </div>
          <div className="hidden sm:flex sm:col-span-1 justify-center pb-2.5">
            <button type="button" onClick={swap} className="rounded-full border border-slate-200 p-2 text-slate-400 hover:border-brand-300 hover:text-brand-600">
              <ArrowLeftRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="sm:col-span-3">
            <label className="label">To</label>
            <select value={destination} onChange={(e) => setDestination(e.target.value)} className="input">
              <option value="">Any destination</option>
              {airports.map((a) => <option key={a.id} value={a.code}>{a.city} ({a.code})</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
          </div>
          <div className="sm:col-span-2">
            <button
              onClick={() => updateSearch(origin, destination, date)}
              className="btn-primary w-full"
            >
              <Search className="h-4 w-4" /> Search
            </button>
          </div>
        </div>
      </div>

      {/* Results header */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {fromCode && toCode ? `${airportLabel(fromCode)} → ${airportLabel(toCode)}` : 'All available flights'}
          </h1>
          <p className="text-sm text-slate-500">
            {loading ? 'Searching…' : `${filtered.length} flight${filtered.length === 1 ? '' : 's'} found`}
            {dateStr && !loading && ` · ${new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`}
            {' · '}{CABIN_CLASS_LABELS[cabin]} · {passengers} {passengers === 1 ? 'passenger' : 'passengers'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="btn-secondary lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400 hidden sm:inline">Sort by</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="input !py-2 !text-sm w-auto"
            >
              <option value="price">Lowest price</option>
              <option value="duration">Shortest duration</option>
              <option value="departure">Earliest departure</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Filters sidebar */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block lg:col-span-1`}>
          <div className="card sticky top-20 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Filters</h3>
              {hasFilters && (
                <button onClick={resetFilters} className="text-xs font-medium text-brand-600 hover:text-brand-700">
                  Reset
                </button>
              )}
            </div>

            <div className="mt-5">
              <h4 className="label">Airline</h4>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="radio" name="airline" checked={airlineFilter === ''} onChange={() => setAirlineFilter('')} className="text-brand-600 focus:ring-brand-500" />
                  All airlines
                </label>
                {airlines.map((a) => (
                  <label key={a.name} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                    <input type="radio" name="airline" checked={airlineFilter === a.name} onChange={() => setAirlineFilter(a.name)} className="text-brand-600 focus:ring-brand-500" />
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-[10px] font-bold text-slate-500">{a.code}</span>
                    {a.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <h4 className="label">Max price</h4>
              {priceRange.max > 0 ? (
                <>
                  <input
                    type="range"
                    min={priceRange.min}
                    max={priceRange.max}
                    value={maxPrice ?? priceRange.max}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-brand-600"
                  />
                  <div className="mt-1 flex justify-between text-xs text-slate-400">
                    <span>{formatCurrency(priceRange.min)}</span>
                    <span className="font-semibold text-brand-600">{maxPrice !== null ? formatCurrency(maxPrice) : 'Any'}</span>
                    <span>{formatCurrency(priceRange.max)}</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-400">No flights to filter</p>
              )}
            </div>

            <button onClick={() => setShowFilters(false)} className="btn-secondary mt-5 w-full lg:hidden">
              <X className="h-4 w-4" /> Close filters
            </button>
          </div>
        </aside>

        {/* Results list */}
        <div className="lg:col-span-3 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
              <p className="mt-3 text-sm text-slate-500">Finding the best flights for you…</p>
            </div>
          ) : error ? (
            <div className="card p-8 text-center">
              <p className="text-slate-600">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Inbox className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">No flights match your search</h3>
              <p className="mt-1 text-sm text-slate-500">Try a different date, route, or remove some filters.</p>
              {hasFilters && (
                <button onClick={resetFilters} className="btn-secondary mt-4">Clear filters</button>
              )}
            </div>
          ) : (
            filtered.map((f) => (
              <FlightCard key={f.id} flight={f} cabin={cabin} passengers={passengers} onBook={onBook} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
