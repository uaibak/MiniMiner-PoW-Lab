import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmationText,
  typedValue,
  onTypedValueChange,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  const disabled = confirmationText && typedValue !== confirmationText;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-rose-100 p-2 text-rose-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
            <p className="mt-2 text-sm text-slate-600">{message}</p>
          </div>
        </div>

        {confirmationText ? (
          <label className="mt-5 block">
            <span className="text-sm font-medium text-slate-700">
              Type {confirmationText} to continue
            </span>
            <input
              value={typedValue}
              onChange={(event) => onTypedValueChange(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-rose-700"
            />
          </label>
        ) : null}

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={disabled}
            className="rounded-md bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
