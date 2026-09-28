"use client";

import { Check, ChevronDown } from "lucide-react";

export default function VehicleCategories({
  vehicle,
  openCategoryIds,
  selectedPartIds,
  onToggleCategory,
  onTogglePart,
}) {
  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
      <div>
        <h2 className="text-base font-bold text-slate-900">
          Сэлбэгийн ангилал
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          {vehicle.name || vehicle.model}-д шаардлагатай сэлбэгийг сонгоно уу.
        </p>
      </div>

      <div className="space-y-2.5">
        {(vehicle.partCategories || []).map((category) => {
          const isOpen = openCategoryIds.includes(category.id);

          return (
            <div
              key={category.id}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white"
            >
              <button
                type="button"
                onClick={() => onToggleCategory(category.id)}
                className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left text-sm font-bold text-slate-800 hover:bg-slate-50"
              >
                <span>{category.name}</span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <div className="grid grid-cols-1 gap-2 border-t border-slate-100 p-3 sm:grid-cols-2">
                  {(category.parts || []).map((part) => {
                    const isSelected = selectedPartIds.includes(part.id);

                    return (
                      <label
                        key={part.id}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2.5 text-xs font-medium transition ${isSelected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-700 hover:border-slate-400"}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onTogglePart(part.id)}
                          className="sr-only"
                        />
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${isSelected ? "border-white bg-white text-slate-900" : "border-slate-300"}`}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </span>
                        {part.name}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
