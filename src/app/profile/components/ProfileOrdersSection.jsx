"use client";

const tabs = [
  { id: "SEARCHING", label: "Сэлбэг хайж байгаа" },
  { id: "NOT_FOUND", label: "Сэлбэг олоогүй" },
  { id: "COMPLETED", label: "Гүйцэтгэсэн" },
  { id: "ALL", label: "Бүгд" },
];

export default function ProfileOrdersSection({
  title = "Хяналтын самбар",
  totalCount = 0,
  activeTab = "SEARCHING",
  onTabChange,
  selectedDate = "",
  onDateChange,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-sm font-bold text-slate-900 sm:text-base">
          {title}
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Нийт {totalCount} захиалга
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="inline-flex min-w-max rounded-lg bg-slate-100/80 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange?.(tab.id)}
              className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1 text-xs">
          <span className="text-slate-400 font-medium">Огноо:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange?.(e.target.value)}
            className="bg-transparent focus:outline-none text-slate-700 font-medium cursor-pointer"
          />
          {selectedDate && (
            <button
              type="button"
              className="ml-1 text-slate-400 hover:text-slate-600 font-bold"
              title="Цэвэрлэх"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
