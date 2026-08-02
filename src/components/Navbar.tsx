import { useEffect, useState } from 'react';
import {
  Plane,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Ticket,
  Home as HomeIcon,
  Search,
  Info,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/lib/router';
import { initials } from '@/lib/utils';

interface NavItem {
  path: string;
  label: string;
  icon: typeof HomeIcon;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Home', icon: HomeIcon },
  { path: '/search', label: 'Flights', icon: Search },
  { path: '/about', label: 'About', icon: Info },
  { path: '/bookings', label: 'Payment', icon: CreditCard },
];

export function Navbar() {
  const { user, signOut } = useAuth();
  const { route, navigate } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [route.path]);

  const fullName = (user?.user_metadata?.full_name as string) || user?.email || 'Traveler';
  const go = (path: string) => navigate(path);

  const isActive = (path: string) => {
    if (path === '/') return route.path === '/';
    return route.path === path || route.path.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900 shadow-lg shadow-slate-900/20">
      {/* Top accent line */}
      <div className="h-1 bg-brand-gradient" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button onClick={() => go('/')} className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-float transition-transform group-hover:rotate-12">
              <Plane className="h-5 w-5 -rotate-45" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-white">
              Skyward
            </span>
          </button>

          {/* Desktop nav links with icons */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => go(item.path)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-brand-500/15 text-brand-300 ring-1 ring-inset ring-brand-500/30'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className={`h-4 w-4 transition-colors ${active ? 'text-brand-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right side: auth */}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 ring-1 ring-white/15 hover:ring-white/25 transition"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white">
                    {initials(fullName)}
                  </span>
                  <span className="max-w-[120px] truncate text-sm font-medium text-slate-200">
                    {fullName.split(' ')[0]}
                  </span>
                </button>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 z-20 animate-slide-down rounded-xl bg-white p-1.5 shadow-cardhover ring-1 ring-slate-200">
                      <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                        <p className="text-xs font-medium text-slate-400">Signed in as</p>
                        <p className="text-sm font-semibold text-slate-800 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => go('/bookings')}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        <Ticket className="h-4 w-4 text-slate-400" /> My Trips
                      </button>
                      <button
                        onClick={() => signOut()}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <button onClick={() => go('/login')} className="text-sm font-medium text-slate-300 transition-colors hover:text-white">
                  Sign in
                </button>
                <button onClick={() => go('/signup')} className="btn-primary">
                  Create account
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-900 animate-slide-down">
          <div className="space-y-1 px-4 py-3">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => go(item.path)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active ? 'bg-brand-500/15 text-brand-300' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className={`h-4 w-4 ${active ? 'text-brand-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
            <div className="pt-2 border-t border-white/10 mt-2">
              {user ? (
                <>
                  <div className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-400">
                    <UserIcon className="h-4 w-4" /> {user.email}
                  </div>
                  <button onClick={() => signOut()} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10">
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <button onClick={() => go('/login')} className="btn-secondary w-full">Sign in</button>
                  <button onClick={() => go('/signup')} className="btn-primary w-full">Create account</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
