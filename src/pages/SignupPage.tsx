import { useState, type FormEvent } from 'react';
import { Plane, Mail, Lock, User as UserIcon, ArrowRight, Loader2, Check, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from '@/lib/router';

export function SignupPage() {
  const { signUp } = useAuth();
  const { notify } = useToast();
  const { navigate } = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      notify('Password must be at least 6 characters.', 'error');
      return;
    }
    setLoading(true);
    const { error, needsLogin } = await signUp(email.trim(), password, fullName.trim());
    setLoading(false);
    if (error) {
      notify(error, 'error');
      return;
    }
    if (needsLogin) {
      notify('Account created! Please sign in with your credentials.', 'success');
      navigate('/login');
      return;
    }
    notify("Account created! You're signed in.", 'success');
    navigate('/');
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-50 via-white to-accent-50" />
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl -z-10" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent-200/30 blur-3xl -z-10" />

      <div className="w-full max-w-md animate-fade-up">
        <div className="card p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-float">
              <Plane className="h-6 w-6 -rotate-45" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="mt-1 text-sm text-slate-500">Join Skyward to search and book flights worldwide</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input pl-10"
                  placeholder="Jane Traveler"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="email">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10 pr-10"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create account <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <ul className="mt-5 space-y-1.5 text-xs text-slate-500">
            <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500" /> Free to join — no credit card required</li>
            <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500" /> Manage all your trips in one place</li>
            <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500" /> Compare prices across airlines</li>
          </ul>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="font-semibold text-brand-600 hover:text-brand-700">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
