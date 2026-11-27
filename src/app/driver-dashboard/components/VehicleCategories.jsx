"use client";

import { useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLocaleLowerCase();

export default function VehicleCategories({
  vehicle,
  openCategoryIds,
  selectedPartIds,
  onToggleCategory,
  onTogglePart,
}) {
  const [search, setSearch] = useState("");
  const normalizedQuery = normalizeText(search);
  const categories = vehicle.partCategories || [];
  const filteredCategories = categories
    .map((category) => {
      const parts = category.parts || [];
      const categoryMatches =
        Boolean(normalizedQuery) &&
        normalizeText(category.name).includes(normalizedQuery);
      const matchingParts = normalizedQuery
        ? parts.filter((part) =>
            normalizeText(part.name).includes(normalizedQuery),
          )
        : parts;

      return {
        category,
        categoryMatches,
        parts: categoryMatches ? parts : matchingParts,
      };
    })
    .filter(
      ({ categoryMatches, parts }) =>
        !normalizedQuery || categoryMatches || parts.length > 0,
    );
  const suggestions = normalizedQuery
    ? [
        ...filteredCategories
          .filter(({ categoryMatches }) => categoryMatches)
          .map(({ category }) => ({ type: "category", category })),
        ...categories.flatMap((category) =>
          (category.parts || [])
            .filter((part) => normalizeText(part.name).includes(normalizedQuery))
            .map((part) => ({ type: "part", category, part })),
        ),
      ].slice(0, 8)
    : [];

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

      <div className="relative">
        <Search
          size={17}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Сэлбэг эсвэл ангилал хайх"
          aria-label="Сэлбэг эсвэл ангилал хайх"
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Хайлтыг цэвэрлэх"
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        )}

        {normalizedQuery && (
          <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
            {suggestions.map((suggestion) => {
              if (suggestion.type === "category") {
                return (
                  <button
                    key={`category-${suggestion.category.id}`}
                    type="button"
                    onClick={() => {
                      if (
                        !openCategoryIds.includes(suggestion.category.id)
                      ) {
                        onToggleCategory(suggestion.category.id);
                      }
                      setSearch("");
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left text-sm transition hover:bg-slate-50"
                  >
                    <span className="font-semibold text-slate-800">
                      {suggestion.category.name}
                    </span>
                    <span className="shrink-0 text-xs text-slate-400">
                      Ангилал
                    </span>
                  </button>
                );
              }

              const isSelected = selectedPartIds.includes(suggestion.part.id);

              return (
                <button
                  key={`part-${suggestion.category.id}-${suggestion.part.id}`}
                  type="button"
                  onClick={() => {
                    onTogglePart(suggestion.part.id);
                    if (!openCategoryIds.includes(suggestion.category.id)) {
                      onToggleCategory(suggestion.category.id);
                    }
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left transition hover:bg-slate-50"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-800">
                      {suggestion.part.name}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500">
                      {suggestion.category.name}
                    </span>
                  </span>
                  {isSelected && (
                    <Check size={16} className="shrink-0 text-emerald-600" />
                  )}
                </button>
              );
            })}
            {suggestions.length === 0 && (
              <p className="px-3 py-4 text-center text-sm text-slate-500">
                Тохирох ангилал эсвэл сэлбэг олдсонгүй.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2.5">
        {filteredCategories.map(({ category, parts }) => {
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
                  {parts.map((part) => {
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
