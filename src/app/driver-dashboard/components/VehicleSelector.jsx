"use client";

import { Search, X } from "lucide-react";

const getVehicleModel = (vehicle) => vehicle.model || vehicle.name || "-";

const getRtNumber = (vehicle) =>
  vehicle.rtNumber || vehicle.rtNo || vehicle.rt || vehicle.registrationNumber;

export default function VehicleSelector({
  vehicles,
  search,
  loading,
  activeVehicle,
  onSearchChange,
  onSelectVehicle,
  onChangeVehicle,
}) {
  const normalizedQuery = search.trim().toLocaleLowerCase();
  const matchingVehicles = normalizedQuery
    ? vehicles.filter((vehicle) =>
        [vehicle.plate, getRtNumber(vehicle), getVehicleModel(vehicle)].some(
          (value) =>
            String(value || "")
              .toLocaleLowerCase()
              .includes(normalizedQuery),
        ),
      )
    : [];

  const sectionHeader = (
    <div className="border-b border-slate-100 pb-3">
      <h2 className="text-base font-bold text-slate-900">Захиалга өгөх</h2>
      <p className="mt-0.5 text-xs text-slate-500">
        Тээврийн хэрэгслээ сонгоод шаардлагатай сэлбэгээ захиална уу.
      </p>
    </div>
  );

  if (activeVehicle) {
    return (
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        {sectionHeader}
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Идэвхтэй тээврийн хэрэгсэл
              </p>
              <h3 className="mt-1 text-base font-bold text-slate-900">
                {getVehicleModel(activeVehicle)}
              </h3>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                {activeVehicle.plate && (
                  <span className="rounded-md bg-white px-2 py-1 font-mono font-semibold text-slate-700">
                    Улсын дугаар: {activeVehicle.plate}
                  </span>
                )}
                {getRtNumber(activeVehicle) && (
                  <span className="rounded-md bg-white px-2 py-1 font-mono font-semibold text-slate-700">
                    RT: {getRtNumber(activeVehicle)}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onChangeVehicle}
              className="shrink-0 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
            >
              Машин солих
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      {sectionHeader}
      <div></div>

      <div className="relative">
        <Search
          size={17}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Жишээ нь: 1234 УБА, RT-01, Porter"
          aria-label="Тээврийн хэрэгсэл хайх"
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Хайлтыг цэвэрлэх"
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        )}

        {normalizedQuery && (
          <div className="absolute z-10 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
            {matchingVehicles.map((vehicle) => (
              <button
                key={vehicle.id}
                type="button"
                onClick={() => onSelectVehicle(vehicle.id)}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-slate-50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-slate-900">
                    {getVehicleModel(vehicle)}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {vehicle.plate || "Улсын дугааргүй"}
                    {getRtNumber(vehicle)
                      ? ` · RT: ${getRtNumber(vehicle)}`
                      : ""}
                  </span>
                </span>
              </button>
            ))}

            {!loading && matchingVehicles.length === 0 && (
              <p className="px-3 py-4 text-center text-sm text-slate-500">
                Тохирох тээврийн хэрэгсэл олдсонгүй.
              </p>
            )}
          </div>
        )}
      </div>

      {!loading && vehicles.length === 0 && (
        <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
          Танд оноогдсон тээврийн хэрэгсэл алга.
        </p>
      )}
    </section>
  );
}
