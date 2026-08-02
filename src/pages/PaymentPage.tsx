import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Ticket, Home as HomeIcon, AlertCircle, Plane } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';

export function PaymentPage() {
  const { route, navigate } = useRouter();
  const { notify } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'cancel'>('loading');
  const sessionId = route.query.get('session_id') || '';
  const mode = route.path.split('/').pop() || '';

  useEffect(() => {
    if (mode === 'cancel') {
      setStatus('cancel');
      notify('Payment was cancelled. You can try again anytime.', 'info');
      return;
    }

    if (!sessionId) {
      setStatus('cancel');
      return;
    }

    setStatus('success');
  }, [mode, sessionId, notify]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-brand-500" />
          <p className="mt-4 text-sm text-slate-500">Verifying your payment…</p>
        </div>
      </div>
    );
  }

  if (status === 'cancel') {
    return (
      <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8 py-16">
        <div className="card overflow-hidden animate-scale-in">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-8 text-center text-white">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h1 className="mt-4 text-2xl font-bold">Payment cancelled</h1>
            <p className="mt-1 text-amber-50">No charge was made. Your booking was not created.</p>
          </div>
          <div className="p-6 sm:p-8 text-center">
            <p className="text-sm text-slate-500">
              You can go back and try again, or browse other flights.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => navigate('/search')} className="btn-primary flex-1">
                <Plane className="h-4 w-4" /> Browse flights
              </button>
              <button onClick={() => navigate('/')} className="btn-secondary flex-1">
                <HomeIcon className="h-4 w-4" /> Back to home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8 py-16">
      <div className="card overflow-hidden animate-scale-in">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 text-center text-white">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30 animate-pulse">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">Payment successful!</h1>
          <p className="mt-1 text-emerald-50">Your flight is booked and confirmed.</p>
        </div>
        <div className="p-6 sm:p-8 text-center">
          <p className="text-sm text-slate-500">
            A confirmation email is on its way. You can view your booking details and manage your trip anytime from My Trips.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button onClick={() => navigate('/bookings')} className="btn-primary flex-1">
              <Ticket className="h-4 w-4" /> View my trips
            </button>
            <button onClick={() => navigate('/')} className="btn-secondary flex-1">
              <HomeIcon className="h-4 w-4" /> Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
