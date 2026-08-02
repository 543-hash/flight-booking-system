import { ShieldCheck, Lock, Eye, Users, FileText, Mail } from 'lucide-react';

const sections = [
  {
    icon: Eye,
    title: 'Information we collect',
    body: 'We collect information you provide directly — your name, email, and phone number when you create an account or book a flight. We also collect booking details such as flight preferences, passenger counts, and payment confirmations. We do not store full card numbers; payment processing is handled securely by our payment provider.',
  },
  {
    icon: Users,
    title: 'How we use your information',
    body: 'Your information is used to process bookings, send confirmation emails, manage your trip history, provide customer support, and improve our search and booking experience. We never sell your personal data to third parties.',
  },
  {
    icon: Lock,
    title: 'Data security',
    body: 'All personal data is stored securely with row-level access controls — each user can only access their own bookings. Passwords are hashed by our authentication provider. Payment data is encrypted and PCI-compliant through our payment processor. We use HTTPS for all data in transit.',
  },
  {
    icon: FileText,
    title: 'Your rights',
    body: 'You can view, modify, or delete your account and booking data at any time from your My Trips page. You may request a full export or deletion of your personal data by contacting us. Cancelled bookings are retained for record-keeping but marked as refunded.',
  },
  {
    icon: ShieldCheck,
    title: 'Cookies & tracking',
    body: 'We use essential cookies to keep you signed in and remember your session. We do not use advertising trackers. You can clear cookies in your browser at any time, which will sign you out.',
  },
  {
    icon: Users,
    title: 'Children\u2019s privacy',
    body: 'Skyward is not directed at children under 16, and we do not knowingly collect personal information from anyone under 16. If you believe a minor has provided us data, please contact us and we will delete it.',
  },
];

export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center animate-fade-up">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-float">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-3xl font-extrabold text-slate-900 sm:text-4xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      <div className="mt-10 space-y-6">
        {sections.map((s) => (
          <div key={s.title} className="card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <s.icon className="h-4.5 w-4.5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">{s.title}</h2>
            </div>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-slate-900 p-8 text-center text-white">
        <Mail className="mx-auto h-7 w-7 text-brand-400" />
        <h2 className="mt-3 text-xl font-bold">Privacy questions?</h2>
        <p className="mt-2 text-sm text-slate-300">If you have any questions about how we handle your data, reach out anytime.</p>
        <a href="mailto:contact@aishmirza123.app" className="btn-primary mt-5">
          contact@aishmirza123.app
        </a>
      </div>
    </div>
  );
}
