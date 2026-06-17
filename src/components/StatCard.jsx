export default function StatCard({ icon: Icon, label, value, tone = 'slate', helper }) {
  const tones = {
    slate: 'bg-white border-slate-200 text-slate-900',
    green: 'bg-emerald-50 border-emerald-200 text-emerald-950',
    red: 'bg-rose-50 border-rose-200 text-rose-950',
    amber: 'bg-amber-50 border-amber-200 text-amber-950',
    blue: 'bg-sky-50 border-sky-200 text-sky-950',
  };

  return (
    <div className={`rounded-lg border p-4 shadow-soft ${tones[tone] || tones.slate}`}>
      <div className="flex items-center gap-3">
        {Icon ? <Icon className="h-5 w-5 shrink-0" /> : null}
        <p className="text-sm font-medium text-slate-600">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-normal mono-hash">{value}</p>
      {helper ? <p className="mt-2 text-sm text-slate-500">{helper}</p> : null}
    </div>
  );
}
