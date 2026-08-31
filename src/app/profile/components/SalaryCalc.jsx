"use client";

import React, { useState, useMemo } from "react";
import { Calculator, Clock, Wallet } from "lucide-react";

const DAY_COEFFICIENTS = {
  dayShift: 12,
  nightShift: 13.6,
  otDay: 18,
  otNight: 19.6,
  holiday: 16,
};

const NDSH_CAP_BASE = 7920000;

function getTaxRelief(gross) {
  if (gross <= 0 || gross >= 3000000) return 0;
  if (gross >= 2500000) return 10000;
  if (gross >= 2000000) return 12000;
  if (gross >= 1500000) return 14000;
  if (gross >= 1000000) return 16000;
  if (gross >= 500000) return 18000;
  if (gross < 70000) return 0;
  return 20000;
}

function formatMNT(value) {
  return new Intl.NumberFormat("mn-MN").format(Math.round(value)) + " ₮";
}

export default function SalaryCalc() {
  const [hourlyRate, setHourlyRate] = useState(19000);
  const [dayShiftDays, setDayShiftDays] = useState(10);
  const [nightShiftDays, setNightShiftDays] = useState(0);
  const [otDayDays, setOtDayDays] = useState(0);
  const [otNightDays, setOtNightDays] = useState(0);
  const [holidayDays, setHolidayDays] = useState(0);
  const [travelHours, setTravelHours] = useState(10);
  const [fond, setFond] = useState(20000);

  const result = useMemo(() => {
    const dayHours = Math.max(0, dayShiftDays) * DAY_COEFFICIENTS.dayShift;
    const nightHours =
      Math.max(0, nightShiftDays) * DAY_COEFFICIENTS.nightShift;
    const otDayHours = Math.max(0, otDayDays) * DAY_COEFFICIENTS.otDay;
    const otNightHours = Math.max(0, otNightDays) * DAY_COEFFICIENTS.otNight;
    const holidayHours = Math.max(0, holidayDays) * DAY_COEFFICIENTS.holiday;
    const safeTravelHours = Math.max(0, Number(travelHours) || 0);

    const totalHours =
      dayHours +
      nightHours +
      otDayHours +
      otNightHours +
      holidayHours +
      safeTravelHours;

    const gross = totalHours * Math.max(0, Number(hourlyRate) || 0);
    const ndsh = gross > NDSH_CAP_BASE ? NDSH_CAP_BASE * 0.115 : gross * 0.115;
    const taxBase = Math.max(0, gross - ndsh);
    const rawHhoat = taxBase * 0.1;
    const relief = getTaxRelief(gross);
    const finalHhoat = Math.max(0, rawHhoat - relief);
    const safeFond = Math.max(0, Number(fond) || 0);
    const net = Math.max(0, gross - ndsh - finalHhoat - safeFond);

    return {
      dayHours,
      nightHours,
      otDayHours,
      otNightHours,
      holidayHours,
      totalHours,
      gross,
      ndsh,
      taxBase,
      rawHhoat,
      relief,
      finalHhoat,
      net,
    };
  }, [
    hourlyRate,
    dayShiftDays,
    nightShiftDays,
    otDayDays,
    otNightDays,
    holidayDays,
    travelHours,
    fond,
  ]);

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
          <label className="block text-xs font-semibold text-slate-600">
            Цагийн үнэлгээ (₮)
          </label>
          <input
            type="number"
            value={hourlyRate || ""}
            onChange={(e) => setHourlyRate(Number(e.target.value))}
            className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
          <label className="block text-xs font-semibold text-slate-600">
            Фонд / Суутгал (₮)
          </label>
          <input
            type="number"
            value={fond || ""}
            onChange={(e) => setFond(Number(e.target.value))}
            className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5 px-0.5 text-xs font-bold text-slate-700">
          <Clock className="h-4 w-4 text-slate-400" />
          <span>Ажилласан өдөр / цаг</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-slate-600">
                Өдрийн ээлж
              </span>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                {result.dayHours}ц
              </span>
            </div>
            <input
              type="number"
              value={dayShiftDays || ""}
              onChange={(e) => setDayShiftDays(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-800 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-slate-600">
                Шөнийн ээлж
              </span>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                {result.nightHours}ц
              </span>
            </div>
            <input
              type="number"
              value={nightShiftDays || ""}
              onChange={(e) => setNightShiftDays(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-800 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-slate-600">
                Сунасан өдөр
              </span>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                {result.otDayHours}ц
              </span>
            </div>
            <input
              type="number"
              value={otDayDays || ""}
              onChange={(e) => setOtDayDays(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-800 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-slate-600">
                Сунсан шөнө
              </span>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                {result.otNightHours}ц
              </span>
            </div>
            <input
              type="number"
              value={otNightDays || ""}
              onChange={(e) => setOtNightDays(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-800 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-slate-600">
                Нийтийн амралт
              </span>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                {result.holidayHours}
              </span>
            </div>
            <input
              type="number"
              value={holidayDays || ""}
              onChange={(e) => setHolidayDays(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-800 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-slate-600">
                Аялал (цагаар)
              </span>
            </div>
            <input
              type="number"
              value={travelHours || ""}
              onChange={(e) => setTravelHours(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-800 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* 3. Бодолтын дэлгэрэнгүй ба Эцсийн Дүн */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2 text-xs">
        <div className="flex justify-between items-center text-slate-600">
          <span>Нийт ажилласан цаг:</span>
          <span className="font-bold text-slate-900 tabular-nums">
            {result.totalHours} цаг
          </span>
        </div>

        <div className="flex justify-between items-center text-slate-600">
          <span>Нийт бодогдсон (Gross):</span>
          <span className="font-bold text-slate-900 tabular-nums">
            {formatMNT(result.gross)}
          </span>
        </div>

        <div className="border-t border-dashed border-slate-200 my-2" />

        {/* Суутгалууд */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between items-center text-slate-500">
            <span>НДШ (11.5%):</span>
            <span className="font-semibold text-rose-500 tabular-nums">
              - {formatMNT(result.ndsh)}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-500">
            <span>ХХОАТ:</span>
            <span className="font-semibold text-rose-500 tabular-nums">
              - {formatMNT(result.finalHhoat)}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-500">
            <span>Фонд:</span>
            <span className="font-semibold text-rose-500 tabular-nums">
              - {formatMNT(fond)}
            </span>
          </div>
        </div>

        {/* Гарт олгох цонх */}
        <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-900 p-3.5 text-white shadow-xs">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-indigo-400" />
            <span className="text-xs font-medium text-slate-300">
              Гарт олгох цалин:
            </span>
          </div>
          <span className="text-lg font-extrabold text-indigo-400 tabular-nums">
            {formatMNT(result.net)}
          </span>
        </div>
      </div>
    </div>
  );
}
