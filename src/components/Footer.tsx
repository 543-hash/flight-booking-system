import { Plane, Mail, Globe, MapPin, ArrowUpRight } from 'lucide-react';
import { useRouter } from '@/lib/router';

export function Footer() {
  const { navigate } = useRouter();

  const go = (path: string) => navigate(path);

  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white">
                <Plane className="h-5 w-5 -rotate-45" />
              </div>
              <span className="font-display text-lg font-bold text-slate-900">Skyward</span>
            </div>
            <p className="mt-3 text-sm text-slate-500 max-w-xs">
              Book flights to anywhere in the world. Compare prices, choose your cabin, and fly with confidence.
            </p>
            <p className="mt-3 text-xs text-slate-400">
              Founded by <span className="font-medium text-slate-600">Aish Mirza</span>
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Explore</h4>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-500">
              <li>
                <button onClick={() => go('/')} className="transition-colors hover:text-brand-600">
                  Find flights
                </button>
              </li>
              <li>
                <button onClick={() => go('/search')} className="transition-colors hover:text-brand-600">
                  Popular routes
                </button>
              </li>
              <li>
                <button onClick={() => go('/bookings')} className="transition-colors hover:text-brand-600">
                  My trips
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Contact</h4>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-500">
              <li>
                <a href="mailto:contact@aishmirza123.app" className="flex items-center gap-2 transition-colors hover:text-brand-600">
                  <Mail className="h-4 w-4 text-slate-400" /> contact@aishmirza123.app
                </a>
              </li>
              <li>
                <a href="https://aishmirza123.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors hover:text-brand-600">
                  <Globe className="h-4 w-4 text-slate-400" /> aishmirza123.app <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
              <li>
                <button onClick={() => go('/about')} className="flex items-center gap-2 transition-colors hover:text-brand-600">
                  <MapPin className="h-4 w-4 text-slate-400" /> 24/7 assistance
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Company</h4>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-500">
              <li>
                <button onClick={() => go('/about')} className="transition-colors hover:text-brand-600">About us</button>
              </li>
              <li>
                <button onClick={() => go('/careers')} className="transition-colors hover:text-brand-600">Careers</button>
              </li>
              <li>
                <button onClick={() => go('/privacy')} className="transition-colors hover:text-brand-600">Privacy policy</button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 sm:flex-row">
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Skyward by Aish Mirza. All rights reserved.</p>
          <p className="text-xs text-slate-400">Prices shown in USD. Taxes & fees included at checkout.</p>
        </div>
      </div>
    </footer>
  );
}
