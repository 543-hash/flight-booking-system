import { Plane, Heart, Globe2, ShieldCheck, Sparkles, Rocket, Users, MapPin } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center animate-fade-up">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-float">
          <Plane className="h-7 w-7 -rotate-45" />
        </div>
        <h1 className="mt-5 text-3xl font-extrabold text-slate-900 sm:text-4xl">About Skyward</h1>
        <p className="mt-3 text-lg text-slate-500 max-w-2xl mx-auto">
          We're on a mission to make flight booking simple, transparent, and affordable for everyone.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {[
          { icon: Rocket, title: 'Our story', text: 'Skyward was founded by Aish Mirza with a simple goal: take the stress out of booking flights. No hidden fees, no confusing jargon — just clear prices and easy booking.' },
          { icon: Heart, title: 'What we believe', text: 'Travel should be accessible to everyone. That is why we compare hundreds of fares so you can find the right flight for your budget, whether economy or first class.' },
          { icon: Globe2, title: 'Global reach', text: 'With 900+ flights across 20 major airports worldwide, we connect you to the destinations that matter — from quick domestic hops to long-haul international journeys.' },
          { icon: ShieldCheck, title: 'Trust & safety', text: 'Your bookings are tied to your account and secured with bank-grade encryption. Every transaction is protected, and you can cancel with a full refund before departure.' },
        ].map((f) => (
          <div key={f.title} className="card p-6 transition-all hover:shadow-cardhover hover:-translate-y-0.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">{f.title}</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">{f.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 card overflow-hidden">
        <div className="bg-brand-gradient p-6 text-white sm:p-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <h2 className="text-xl font-bold">The numbers</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-4 sm:divide-y-0">
          {[
            { icon: Globe2, label: 'Airports', value: '20+' },
            { icon: Plane, label: 'Flights', value: '900+' },
            { icon: Users, label: 'Airlines', value: '30+' },
            { icon: MapPin, label: 'Countries', value: '15+' },
          ].map((s) => (
            <div key={s.label} className="p-6 text-center">
              <s.icon className="mx-auto h-6 w-6 text-brand-500" />
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 rounded-2xl bg-slate-900 p-8 text-center text-white">
        <h2 className="text-xl font-bold">Get in touch</h2>
        <p className="mt-2 text-sm text-slate-300">Questions, feedback, or partnership ideas? We would love to hear from you.</p>
        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="mailto:contact@aishmirza123.app" className="btn-primary">
            contact@aishmirza123.app
          </a>
          <a href="https://aishmirza123.app" target="_blank" rel="noopener noreferrer" className="btn-secondary bg-white/10 text-white ring-white/20 hover:bg-white/20 hover:ring-white/30">
            Visit aishmirza123.app
          </a>
        </div>
      </div>
    </div>
  );
}
