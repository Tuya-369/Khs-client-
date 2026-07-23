export default function EditableField({ label, value, onChange, isEditing }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 gap-1 sm:gap-4 border-b border-slate-50 last:border-none">
      <span className="text-xs font-medium text-slate-400 sm:w-1/3">
        {label}
      </span>
      {isEditing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full sm:w-2/3 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 transition"
        />
      ) : (
        <span className="text-xs font-semibold text-slate-800 sm:w-2/3 sm:text-right truncate">
          {value || "-"}
        </span>
      )}
    </div>
  );
}
