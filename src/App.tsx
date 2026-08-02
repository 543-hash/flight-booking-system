import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useRouter } from '@/lib/router';
import { HomePage } from '@/pages/HomePage';
import { SearchPage } from '@/pages/SearchPage';
import { BookingPage } from '@/pages/BookingPage';
import { MyBookingsPage } from '@/pages/MyBookingsPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { AboutPage } from '@/pages/AboutPage';
import { CareersPage } from '@/pages/CareersPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { PaymentPage } from '@/pages/PaymentPage';
import { Plane } from 'lucide-react';

function Routes() {
  const { route, navigate } = useRouter();
  const path = route.path.replace(/\/$/, '') || '/';

  if (path === '/') return <HomePage />;
  if (path === '/search') return <SearchPage />;
  if (path === '/book') return <BookingPage />;
  if (path === '/bookings') return <MyBookingsPage />;
  if (path === '/login') return <LoginPage />;
  if (path === '/signup') return <SignupPage />;
  if (path === '/about') return <AboutPage />;
  if (path === '/careers') return <CareersPage />;
  if (path === '/privacy') return <PrivacyPage />;
  if (path.startsWith('/payment')) return <PaymentPage />;

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Plane className="h-7 w-7 -rotate-45" />
      </div>
      <h1 className="mt-5 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-1 text-sm text-slate-500">The page you're looking for doesn't exist.</p>
      <button onClick={() => navigate('/')} className="btn-primary mt-6">
        Back to home
      </button>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes />
          </main>
          <Footer />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
