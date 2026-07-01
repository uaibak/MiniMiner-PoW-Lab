export default function EmptyState({ title, message, actionLabel, onAction, icon: Icon }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-center shadow-sm">
      {Icon ? (
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <h3 className="mt-3 font-semibold text-slate-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">{message}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
