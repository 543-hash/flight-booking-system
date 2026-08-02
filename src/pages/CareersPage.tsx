import { Briefcase, MapPin, Clock, ArrowUpRight, Plane, Heart } from 'lucide-react';

interface JobOpening {
  title: string;
  team: string;
  location: string;
  type: string;
}

const openings: JobOpening[] = [
  { title: 'Senior Full-Stack Engineer', team: 'Engineering', location: 'Remote', type: 'Full-time' },
  { title: 'Product Designer', team: 'Design', location: 'Remote', type: 'Full-time' },
  { title: 'Flight Partnerships Manager', team: 'Business', location: 'Remote', type: 'Full-time' },
  { title: 'Customer Support Specialist', team: 'Support', location: 'Remote', type: 'Full-time' },
  { title: 'Data Analyst', team: 'Data', location: 'Remote', type: 'Contract' },
  { title: 'Marketing Lead', team: 'Growth', location: 'Remote', type: 'Full-time' },
];

export function CareersPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center animate-fade-up">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-float">
          <Briefcase className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-3xl font-extrabold text-slate-900 sm:text-4xl">Join the Skyward team</h1>
        <p className="mt-3 text-lg text-slate-500 max-w-2xl mx-auto">
          Help us build the future of flight booking. We are a remote-first team passionate about making travel accessible.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          { icon: Heart, title: 'People-first', text: 'We invest in our team with competitive pay, flexible hours, and real growth opportunities.' },
          { icon: Plane, title: 'Remote-first', text: 'Work from anywhere. We trust our team to deliver, wherever they are in the world.' },
          { icon: Clock, title: 'Flexibility', text: 'Flexible schedules and generous time off. We measure results, not hours at a desk.' },
        ].map((b) => (
          <div key={b.title} className="card p-6 transition-all hover:shadow-cardhover">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white">
              <b.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-bold text-slate-900">{b.title}</h3>
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{b.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold text-slate-900">Open positions</h2>
        <p className="mt-1 text-sm text-slate-500">{openings.length} roles available</p>

        <div className="mt-6 space-y-3">
          {openings.map((job) => (
            <div key={job.title} className="card group flex flex-col gap-4 p-5 transition-all hover:shadow-cardhover hover:ring-brand-300 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600 group-hover:bg-brand-gradient group-hover:text-white transition-colors">
                  {job.team[0]}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{job.title}</p>
                  <p className="text-xs text-slate-400">{job.team} team</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin className="h-4 w-4 text-slate-400" /> {job.location}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Clock className="h-4 w-4 text-slate-400" /> {job.type}
                </span>
                <a
                  href={`mailto:contact@aishmirza123.app?subject=Application: ${encodeURIComponent(job.title)}`}
                  className="btn-primary !py-2"
                >
                  Apply <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 rounded-2xl bg-slate-900 p-8 text-center text-white">
        <h2 className="text-xl font-bold">Don't see your role?</h2>
        <p className="mt-2 text-sm text-slate-300">We are always looking for great people. Send us your resume and tell us how you would help.</p>
        <a href="mailto:contact@aishmirza123.app?subject=General Application" className="btn-primary mt-5">
          contact@aishmirza123.app
        </a>
      </div>
    </div>
  );
}
