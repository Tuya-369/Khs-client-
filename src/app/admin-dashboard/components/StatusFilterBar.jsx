"use client";

const FILTERS = [
  {
    key: "all",
    label: "Бүгд",
    activeClass: "bg-slate-900 border-slate-900 text-white",
    countActiveClass: "bg-slate-700 text-slate-200",
    countIdleClass: "bg-slate-100 text-slate-500",
  },
  {
    key: "pending",
    label: "Шинэ",
    activeClass: "bg-blue-600 border-blue-600 text-white",
    countActiveClass: "bg-blue-700 text-blue-100",
    countIdleClass: "bg-blue-50 text-blue-600",
  },
  {
    key: "approved",
    label: "Баталсан",
    activeClass: "bg-emerald-600 border-emerald-600 text-white",
    countActiveClass: "bg-emerald-700 text-emerald-100",
    countIdleClass: "bg-emerald-50 text-emerald-600",
  },
  {
    key: "rejected",
    label: "Батлаагүй",
    activeClass: "bg-rose-600 border-rose-600 text-white",
    countActiveClass: "bg-rose-700 text-rose-100",
    countIdleClass: "bg-rose-50 text-rose-600",
  },
];

export default function StatusFilterBar({ statusFilter, onChange, counts }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
          Захиалгын төлөв
        </span>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((filter) => {
            const isActive = statusFilter === filter.key;

            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => onChange(filter.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
                  isActive
                    ? filter.activeClass
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {filter.label}
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                    isActive ? filter.countActiveClass : filter.countIdleClass
                  }`}
                >
                  {counts[filter.key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
