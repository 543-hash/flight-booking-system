import { Plane, Clock, ArrowRight, Users } from 'lucide-react';
import type { Flight, CabinClass } from '@/types';
import { formatTime, formatDate, formatDuration, formatCurrency } from '@/lib/utils';
import { priceForCabin, CABIN_CLASS_LABELS } from '@/types';

interface FlightCardProps {
  flight: Flight;
  cabin: CabinClass;
  passengers: number;
  onBook: (flight: Flight) => void;
}

export function FlightCard({ flight, cabin, passengers, onBook }: FlightCardProps) {
  const unitPrice = priceForCabin(flight, cabin);
  const total = unitPrice * passengers;
  const seatsLeft = flight.available_seats;

  return (
    <div className="card overflow-hidden transition-all hover:shadow-cardhover hover:ring-brand-200 animate-fade-up">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        {/* Airline + route */}
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
            {flight.airline_code}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{flight.airline}</p>
            <p className="text-xs text-slate-400">{flight.flight_number} · {flight.aircraft}</p>
          </div>
        </div>

        {/* Times */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="text-center">
            <p className="text-lg font-bold text-slate-900">{formatTime(flight.departure_time)}</p>
            <p className="text-xs font-medium text-slate-400">{flight.origin?.code}</p>
          </div>

          <div className="flex flex-1 flex-col items-center px-2 min-w-[80px]">
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="h-3 w-3" /> {formatDuration(flight.duration_minutes)}
            </p>
            <div className="relative my-1 h-px w-full bg-slate-200">
              <Plane className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 text-slate-400 -rotate-45" />
            </div>
            <p className="text-[11px] text-slate-400">Direct</p>
          </div>

          <div className="text-center">
            <p className="text-lg font-bold text-slate-900">{formatTime(flight.arrival_time)}</p>
            <p className="text-xs font-medium text-slate-400">{flight.destination?.code}</p>
          </div>
        </div>

        {/* Price + book */}
        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4 sm:border-0 sm:pt-0 sm:flex-col sm:items-end">
          <div className="sm:text-right">
            <p className="text-xs text-slate-400">{CABIN_CLASS_LABELS[cabin]} · {passengers} {passengers === 1 ? 'passenger' : 'passengers'}</p>
            <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(total)}</p>
            <p className="text-xs text-slate-400">{formatCurrency(unitPrice)} per person</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {seatsLeft <= 20 && seatsLeft > 0 && (
              <span className="badge bg-accent-50 text-accent-700">{seatsLeft} seats left</span>
            )}
            {seatsLeft === 0 && (
              <span className="badge bg-red-50 text-red-700">Sold out</span>
            )}
            <button
              onClick={() => onBook(flight)}
              disabled={seatsLeft === 0 || seatsLeft < passengers}
              className="btn-primary"
            >
              {seatsLeft === 0 ? 'Unavailable' : 'Select'} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-slate-50/60 px-5 py-2.5 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" /> {flight.available_seats} of {flight.total_seats} seats available
        </span>
        <span>{formatDate(flight.departure_time)}</span>
        <span className="hidden sm:inline">{flight.origin?.city} → {flight.destination?.city}</span>
      </div>
    </div>
  );
}
