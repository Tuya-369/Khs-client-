"use client";

export default function DashboardProfileCard({
  badge,
  name,
  subtitle,
  sapId,
  totalLabel,
  totalValue,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 bg-white border border-slate-200 rounded-xl shadow-xs gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-linear-to-tr from-slate-700 to-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-base tracking-wider shadow-sm shrink-0 select-none">
          {badge}
        </div>
        <div>
          <h2 className="font-bold text-lg sm:text-xl tracking-tight text-slate-900">
            {name}
          </h2>
          <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500 mt-0.5">
            <span className="font-medium text-slate-700">{subtitle}</span>
            <span className="text-slate-300">•</span>
            <span>SAP ID: {sapId}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center pt-2 sm:pt-0 border-t border-slate-100 sm:border-none">
        <span className="text-xs font-semibold px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg w-full text-center sm:w-auto">
          {totalLabel}:{" "}
          <span className="text-slate-900 font-bold">{totalValue}</span>
        </span>
      </div>
    </div>
  );
}
