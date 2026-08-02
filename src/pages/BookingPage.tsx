import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Plane, Clock, Check, Loader2, Lock, CreditCard, ShieldCheck, User as UserIcon, Mail, Phone, Calendar, Tag, Ticket } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { Flight, CabinClass } from '@/types';
import { priceForCabin, CABIN_CLASS_LABELS } from '@/types';
import { formatCurrency, formatTime, formatDate, formatDuration, formatDateLong } from '@/lib/utils';

type Step = 'details' | 'review';

export function BookingPage() {
  const { route, navigate } = useRouter();
  const { user } = useAuth();
  const { notify } = useToast();

  const flightId = route.query.get('flight') || '';
  const cabin = (route.query.get('cabin') || 'economy') as CabinClass;
  const passengers = parseInt(route.query.get('passengers') || '1', 10);

  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('details');
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (!user) {
      notify('Please sign in to book a flight.', 'info');
      navigate('/login');
      return;
    }
    if (!flightId) {
      navigate('/');
      return;
    }
    supabase
      .from('flights')
      .select('*, origin:airports!flights_origin_id_fkey(*), destination:airports!flights_destination_id_fkey(*)')
      .eq('id', flightId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setFlight(data as Flight);
          setName((user.user_metadata?.full_name as string) || '');
          setEmail(user.email || '');
        } else {
          notify('That flight is no longer available.', 'error');
          navigate('/');
        }
        setLoading(false);
      });
  }, [flightId, user, navigate, notify]);

  const unitPrice = useMemo(() => (flight ? priceForCabin(flight, cabin) : 0), [flight, cabin]);
  const subtotal = unitPrice * passengers;
  const taxes = Math.round(subtotal * 0.12);
  const total = subtotal + taxes;

  const onContinue = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      notify('Please fill in all passenger details.', 'error');
      return;
    }
    setStep('review');
  };

  const onConfirmPayment = async () => {
    if (!flight || !user) return;
    setSubmitting(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/checkout`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flight_id: flight.id,
          cabin_class: cabin,
          passengers,
          passenger_name: name.trim(),
          passenger_email: email.trim(),
          passenger_phone: phone.trim(),
        }),
      });

      setSubmitting(false);

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        notify(errBody.error || 'Payment setup failed. Please try again.', 'error');
        return;
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        notify('Could not start checkout. Please try again.', 'error');
      }
    } catch {
      setSubmitting(false);
      notify('Something went wrong. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!flight) return null;

  const Stepper = () => (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {[
        { key: 'details' as Step, label: 'Passenger details', n: 1 },
        { key: 'review' as Step, label: 'Review & pay', n: 2 },
      ].map((s, i) => (
        <div key={s.key} className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
              step === s.key
                ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {s.n}
            </div>
            <span className={`text-sm font-medium hidden sm:inline ${
              step === s.key ? 'text-slate-900' : 'text-slate-400'
            }`}>{s.label}</span>
          </div>
          {i === 0 && <div className="h-px w-8 bg-slate-200 sm:w-12" />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => (step === 'review' ? setStep('details') : navigate(`/search?from=${flight.origin?.code}&to=${flight.destination?.code}&passengers=${passengers}&cabin=${cabin}`))} className="btn-ghost mb-6 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <Stepper />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {step === 'details' && (
            <form onSubmit={onContinue} className="card p-6 animate-fade-up">
              <h2 className="text-lg font-bold text-slate-900">Passenger details</h2>
              <p className="mt-0.5 text-sm text-slate-500">Enter the contact info for this booking</p>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="label" htmlFor="name"><span className="flex items-center gap-1.5"><UserIcon className="h-3.5 w-3.5" /> Full name</span></label>
                  <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Jane Traveler" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="email"><span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email</span></label>
                    <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="label" htmlFor="phone"><span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone</span></label>
                    <input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="+1 555 000 1234" />
                  </div>
                </div>
              </div>

              <label className="mt-5 flex items-start gap-2.5 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                I confirm the passenger details are correct and agree to the fare rules and terms of travel.
              </label>

              <button type="submit" disabled={!agreed} className="btn-primary mt-6 w-full">
                Continue to payment <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {step === 'review' && (
            <div className="card p-6 animate-fade-up">
              <h2 className="text-lg font-bold text-slate-900">Review and pay</h2>
              <p className="mt-0.5 text-sm text-slate-500">Confirm your booking details before payment</p>

              {/* Passenger summary */}
              <div className="mt-5 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <h3 className="text-sm font-semibold text-slate-700">Passenger</h3>
                <div className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <p className="text-slate-600"><span className="text-slate-400">Name:</span> {name}</p>
                  <p className="text-slate-600"><span className="text-slate-400">Email:</span> {email}</p>
                  <p className="text-slate-600"><span className="text-slate-400">Phone:</span> {phone}</p>
                  <p className="text-slate-600"><span className="text-slate-400">Passengers:</span> {passengers}</p>
                </div>
              </div>

              {/* Payment method card */}
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-slate-700">Payment method</h3>
                <div className="mt-2 rounded-xl border-2 border-brand-500 bg-brand-50/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-white ring-1 ring-slate-200">
                      <CreditCard className="h-5 w-5 text-brand-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">Credit / Debit Card</p>
                      <p className="text-xs text-slate-500">Secure payment via Stripe</p>
                    </div>
                    <Check className="h-5 w-5 text-brand-600" />
                  </div>
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                  <Lock className="h-3.5 w-3.5" /> Your payment is encrypted and secure
                </p>
              </div>

              <button onClick={onConfirmPayment} disabled={submitting} className="btn-primary mt-6 w-full">
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing payment…</> : <>Pay {formatCurrency(total)} & confirm booking</>}
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5" /> By confirming, you agree to our booking terms. Free cancellation up to 24h before departure.
              </p>
            </div>
          )}
        </div>

        {/* Flight summary sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-20 overflow-hidden">
            <div className="bg-slate-900 px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Flight summary</p>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">{flight.airline_code}</div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{flight.airline}</p>
                  <p className="text-xs text-slate-400">{flight.flight_number}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-slate-900">{formatTime(flight.departure_time)}</p>
                  <p className="text-xs text-slate-400">{flight.origin?.city} ({flight.origin?.code})</p>
                </div>
                <Plane className="h-4 w-4 text-slate-400 -rotate-45" />
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900">{formatTime(flight.arrival_time)}</p>
                  <p className="text-xs text-slate-400">{flight.destination?.city} ({flight.destination?.code})</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDuration(flight.duration_minutes)}</span>
                <span>{formatDate(flight.departure_time)}</span>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">{CABIN_CLASS_LABELS[cabin]} × {passengers}</span>
                  <span className="text-slate-700">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Taxes & fees (12%)</span>
                  <span className="text-slate-700">{formatCurrency(taxes)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="text-lg font-extrabold text-brand-700">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
