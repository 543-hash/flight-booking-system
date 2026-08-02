import { useEffect, useState } from 'react';
import { Ticket, Plane, Clock, Calendar, Tag, Loader2, X, Trash2, Inbox, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from '@/lib/router';
import type { Booking } from '@/types';
import { CABIN_CLASS_LABELS } from '@/types';
import { formatCurrency, formatTime, formatDate, formatDuration, formatDateLong } from '@/lib/utils';

export function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { notify } = useToast();
  const { navigate } = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const loadBookings = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('bookings')
      .select('*, flight:flights(*, origin:airports!flights_origin_id_fkey(*), destination:airports!flights_destination_id_fkey(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      notify('Could not load your bookings.', 'error');
      setLoading(false);
      return;
    }
    setBookings((data ?? []) as Booking[]);
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    const { error } = await supabase.rpc('cancel_booking', {
      p_booking_id: cancelTarget.id,
    });
    setCancelling(false);
    if (error) {
      notify('Could not cancel booking. Please try again.', 'error');
      return;
    }
    setBookings((prev) =>
      prev.map((b) => (b.id === cancelTarget.id ? { ...b, status: 'cancelled', payment_status: 'refunded' } : b))
    );
    notify(`Booking ${cancelTarget.booking_reference} cancelled and refunded.`, 'success');
    setCancelTarget(null);
  };

  const upcoming = bookings.filter((b) => b.status === 'confirmed');
  const cancelled = bookings.filter((b) => b.status === 'cancelled');

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const flight = booking.flight;
    if (!flight) return null;
    const isCancelled = booking.status === 'cancelled';

    return (
      <div className={`card overflow-hidden transition-all ${isCancelled ? 'opacity-75' : 'hover:shadow-cardhover'}`}>
        <div className={`px-5 py-3 flex items-center justify-between ${isCancelled ? 'bg-slate-100' : 'bg-slate-900'}`}>
          <div className="flex items-center gap-2">
            <span className={`font-display text-sm font-bold tracking-wider ${isCancelled ? 'text-slate-500' : 'text-white'}`}>
              {booking.booking_reference}
            </span>
            <span className={`badge ${isCancelled ? 'bg-slate-200 text-slate-600' : 'bg-emerald-400/20 text-emerald-300'}`}>
              {isCancelled ? <><XCircle className="h-3 w-3" /> Cancelled</> : <><CheckCircle2 className="h-3 w-3" /> Confirmed</>}
            </span>
          </div>
          <span className={`text-xs ${isCancelled ? 'text-slate-400' : 'text-slate-300'}`}>
            Booked on {formatDate(booking.created_at)}
          </span>
        </div>

        <div className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600">
                {flight.airline_code}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{flight.airline}</p>
                <p className="text-xs text-slate-400">{flight.flight_number} · {flight.aircraft}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-lg font-bold text-slate-900">{formatTime(flight.departure_time)}</p>
                <p className="text-xs text-slate-400">{flight.origin?.code}</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-xs text-slate-400 flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDuration(flight.duration_minutes)}</p>
                <Plane className="my-1 h-3.5 w-3.5 text-slate-400 -rotate-45" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-900">{formatTime(flight.arrival_time)}</p>
                <p className="text-xs text-slate-400">{flight.destination?.code}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Date</p>
                <p className="font-medium text-slate-700">{formatDate(flight.departure_time)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Cabin</p>
                <p className="font-medium text-slate-700">{CABIN_CLASS_LABELS[booking.cabin_class]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Passengers</p>
                <p className="font-medium text-slate-700">{booking.passengers}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Total {isCancelled && '(refunded)'}</p>
              <p className={`text-lg font-extrabold ${isCancelled ? 'text-slate-400 line-through' : 'text-brand-700'}`}>
                {formatCurrency(booking.total_price)}
              </p>
            </div>
          </div>

          {!isCancelled && (
            <div className="mt-4 flex justify-end">
              <button onClick={() => setCancelTarget(booking)} className="btn-danger">
                <Trash2 className="h-4 w-4" /> Cancel booking
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Trips</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your upcoming and past flights</p>
        </div>
        <button onClick={() => navigate('/')} className="btn-secondary hidden sm:inline-flex">
          <Plane className="h-4 w-4" /> Book a flight
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="card mt-6 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Inbox className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900">No bookings yet</h3>
          <p className="mt-1 text-sm text-slate-500">Search for a flight and book your first trip.</p>
          <button onClick={() => navigate('/')} className="btn-primary mt-5">
            <Plane className="h-4 w-4" /> Find flights
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {upcoming.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Upcoming ({upcoming.length})</h2>
              <div className="space-y-4">
                {upcoming.map((b) => <BookingCard key={b.id} booking={b} />)}
              </div>
            </section>
          )}
          {cancelled.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Cancelled ({cancelled.length})</h2>
              <div className="space-y-4">
                {cancelled.map((b) => <BookingCard key={b.id} booking={b} />)}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Cancel confirmation modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in" onClick={() => !cancelling && setCancelTarget(null)} />
          <div className="relative z-10 w-full max-w-md animate-scale-in">
            <div className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <Trash2 className="h-5 w-5" />
                </div>
                <button onClick={() => setCancelTarget(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100" disabled={cancelling}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">Cancel this booking?</h3>
              <p className="mt-1 text-sm text-slate-500">
                You'll cancel booking <span className="font-semibold text-slate-700">{cancelTarget.booking_reference}</span> for{' '}
                {cancelTarget.flight?.airline} {cancelTarget.flight?.flight_number} on{' '}
                {cancelTarget.flight && formatDateLong(cancelTarget.flight.departure_time)}. A full refund of{' '}
                <span className="font-semibold text-slate-700">{formatCurrency(cancelTarget.total_price)}</span> will be issued.
              </p>
              <div className="mt-6 flex gap-3">
                <button onClick={() => setCancelTarget(null)} className="btn-secondary flex-1" disabled={cancelling}>
                  Keep booking
                </button>
                <button onClick={confirmCancel} className="btn-danger flex-1" disabled={cancelling}>
                  {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Trash2 className="h-4 w-4" /> Cancel & refund</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
