"use client";

import React, { useState, useMemo } from "react";
import { Wallet } from "lucide-react";

const DAY_COEFFICIENTS = {
  dayShift: 12,
  nightShift: 13.6,
  otDay: 18,
  otNight: 19.6,
  holidayDay: 12,
  holidayNight: 13.6,
  holidayExtra: 4,
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

function round2(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export default function SalaryCalc() {
  const [hourlyRate, setHourlyRate] = useState(0);
  const [dayShiftDays, setDayShiftDays] = useState(14);
  const [nightShiftDays, setNightShiftDays] = useState(0);
  const [otDayDays, setOtDayDays] = useState(0);
  const [otNightDays, setOtNightDays] = useState(0);
  const [holidayDayDays, setHolidayDayDays] = useState(0);
  const [holidayNightDays, setHolidayNightDays] = useState(0);
  const [travelHours, setTravelHours] = useState(10);
  const [fond, setFond] = useState(20000);

  const result = useMemo(() => {
    const safeDay = Math.max(0, Number(dayShiftDays) || 0);
    const safeNight = Math.max(0, Number(nightShiftDays) || 0);
    const safeOtDay = Math.max(0, Number(otDayDays) || 0);
    const safeOtNight = Math.max(0, Number(otNightDays) || 0);
    const safeHolidayDay = Math.max(0, Number(holidayDayDays) || 0);
    const safeHolidayNight = Math.max(0, Number(holidayNightDays) || 0);
    const safeTravelHours = Math.max(0, Number(travelHours) || 0);

    const totalDays =
      safeDay +
      safeNight +
      safeOtDay +
      safeOtNight +
      safeHolidayDay +
      safeHolidayNight;

    const dayHours = round2(safeDay * DAY_COEFFICIENTS.dayShift);
    const nightHours = round2(safeNight * DAY_COEFFICIENTS.nightShift);
    const otDayHours = round2(safeOtDay * DAY_COEFFICIENTS.otDay);
    const otNightHours = round2(safeOtNight * DAY_COEFFICIENTS.otNight);

    const holidayDayHours = round2(
      safeHolidayDay *
        (DAY_COEFFICIENTS.holidayDay + DAY_COEFFICIENTS.holidayExtra),
    );
    const holidayNightHours = round2(
      safeHolidayNight *
        (DAY_COEFFICIENTS.holidayNight + DAY_COEFFICIENTS.holidayExtra),
    );
    const holidayExtraHours = round2(
      (safeHolidayDay + safeHolidayNight) * DAY_COEFFICIENTS.holidayExtra,
    );
    const calculatedTravelHours = round2(safeTravelHours);

    const rawTotalHours =
      dayHours +
      nightHours +
      otDayHours +
      otNightHours +
      holidayDayHours +
      holidayNightHours +
      calculatedTravelHours;
    const totalHours = round2(rawTotalHours);

    const gross = round2(totalHours * Math.max(0, Number(hourlyRate) || 0));
    const ndshBase = gross > NDSH_CAP_BASE ? NDSH_CAP_BASE : gross;
    const ndsh = round2(ndshBase * 0.115);
    const taxBase = Math.max(0, round2(gross - ndsh));
    const rawHhoat = round2(taxBase * 0.1);
    const relief = getTaxRelief(gross);
    const finalHhoat = Math.max(0, round2(rawHhoat - relief));
    const safeFond = Math.max(0, Number(fond) || 0);
    const net = Math.max(0, round2(gross - ndsh - finalHhoat - safeFond));

    return {
      totalDays,
      dayHours,
      nightHours,
      otDayHours,
      otNightHours,
      holidayDayHours,
      holidayNightHours,
      holidayExtraHours,
      travelHours: calculatedTravelHours,
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
    holidayDayDays,
    holidayNightDays,
    travelHours,
    fond,
  ]);

  return (
    <section className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <h2 className="text-sm font-bold text-slate-900">Цалин тооцоолох</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Ажилласан өдрийн тоо болон бусад мэдээллээ оруулж тооцоолно уу.
        </p>
      </header>

      <div className="space-y-5 px-4 py-4 sm:px-5 sm:py-5">
        <div className="grid grid-cols-1 gap-3 border-b border-slate-100 pb-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-800">
              Цагийн үнэлгээ (₮)
            </label>
            <input
              type="number"
              value={hourlyRate || ""}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 transition focus:border-[#4677b9] focus:outline-none focus:ring-1 focus:ring-[#4677b9]"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800">
              Фонд / Суутгал (₮)
            </label>
            <input
              type="number"
              value={fond || ""}
              onChange={(e) => setFond(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-[#4677b9] transition focus:border-[#4677b9] focus:outline-none focus:ring-1 focus:ring-[#4677b9]"
              placeholder="0"
            />
          </div>
        </div>

        <div className="space-y-4">
          <p className="rounded-lg border border-[#729fd0]/25 bg-red-50/50 p-3 text-xs text-slate-700 leading-relaxed">
            <span className="font-extrabold text-red-600 mr-1.5">Санамж:</span>
            Доорх хүснэгтэд өөрийн ажилласан өдрөө бичнэ үү. Тооцоолол зөвхөн
            ажилласан өдрөөр хийгдэнэ.
          </p>

          {/* Өдрийн ээлж */}
          <div className="border-b border-slate-100 pb-4">
            <p className="mb-2 text-xs font-bold text-slate-800">Өдрийн ээлж</p>
            <div className="grid grid-cols-1 gap-2.5 min-[480px]:grid-cols-2 sm:grid-cols-3">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 sm:flex-col sm:items-stretch">
                <div className="flex items-center gap-2 sm:justify-between sm:mb-1.5">
                  <span className="text-xs font-medium text-slate-700">
                    Ажилсан өдөр
                  </span>
                  <span className="text-[10px] font-bold text-[#1f4a88] bg-[#729fd0]/15 px-1.5 py-0.5 rounded-md shrink-0">
                    {result.dayHours}ц
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={dayShiftDays || ""}
                  onChange={(e) => setDayShiftDays(Number(e.target.value))}
                  className="w-20 rounded-lg border border-slate-200 px-2.5 py-1 text-right text-xs font-semibold text-slate-900 transition focus:border-[#4677b9] focus:outline-none focus:ring-1 focus:ring-[#4677b9] sm:w-full sm:text-left"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 sm:flex-col sm:items-stretch">
                <div className="flex items-center gap-2 sm:justify-between sm:mb-1.5">
                  <span className="text-xs font-medium text-slate-700">
                    Сунасан өдөр
                  </span>
                  <span className="text-[10px] font-bold text-[#1f4a88] bg-[#729fd0]/15 px-1.5 py-0.5 rounded-md shrink-0">
                    {result.otDayHours}ц
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={otDayDays || ""}
                  onChange={(e) => setOtDayDays(Number(e.target.value))}
                  className="w-20 rounded-lg border border-slate-200 px-2.5 py-1 text-right text-xs font-semibold text-slate-900 transition focus:border-[#4677b9] focus:outline-none focus:ring-1 focus:ring-[#4677b9] sm:w-full sm:text-left"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 sm:flex-col sm:items-stretch min-[480px]:col-span-2 sm:col-span-1">
                <div className="flex items-center gap-2 sm:justify-between sm:mb-1.5">
                  <span className="text-xs font-medium text-slate-700">
                    Нийтийн амралт
                  </span>
                  <span className="text-[10px] font-bold text-[#1f4a88] bg-[#729fd0]/15 px-1.5 py-0.5 rounded-md shrink-0">
                    {result.holidayDayHours}ц
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={holidayDayDays || ""}
                  onChange={(e) => setHolidayDayDays(Number(e.target.value))}
                  className="w-20 rounded-lg border border-slate-200 px-2.5 py-1 text-right text-xs font-semibold text-slate-900 transition focus:border-[#4677b9] focus:outline-none focus:ring-1 focus:ring-[#4677b9] sm:w-full sm:text-left"
                />
              </div>
            </div>
          </div>

          {/* Шөнийн ээлж */}
          <div className="border-b border-slate-100 pb-4">
            <p className="mb-2 text-xs font-bold text-slate-800">Шөнийн ээлж</p>
            <div className="grid grid-cols-1 gap-2.5 min-[480px]:grid-cols-2 sm:grid-cols-3">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 sm:flex-col sm:items-stretch">
                <div className="flex items-center gap-2 sm:justify-between sm:mb-1.5">
                  <span className="text-xs font-medium text-slate-700">
                    Ажилсан өдөр
                  </span>
                  <span className="text-[10px] font-bold text-[#1f4a88] bg-[#729fd0]/15 px-1.5 py-0.5 rounded-md shrink-0">
                    {result.nightHours}ц
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={nightShiftDays || ""}
                  onChange={(e) => setNightShiftDays(Number(e.target.value))}
                  className="w-20 rounded-lg border border-slate-200 px-2.5 py-1 text-right text-xs font-semibold text-slate-900 transition focus:border-[#4677b9] focus:outline-none focus:ring-1 focus:ring-[#4677b9] sm:w-full sm:text-left"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 sm:flex-col sm:items-stretch">
                <div className="flex items-center gap-2 sm:justify-between sm:mb-1.5">
                  <span className="text-xs font-medium text-slate-700">
                    Сунасан өдөр
                  </span>
                  <span className="text-[10px] font-bold text-[#1f4a88] bg-[#729fd0]/15 px-1.5 py-0.5 rounded-md shrink-0">
                    {result.otNightHours}ц
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={otNightDays || ""}
                  onChange={(e) => setOtNightDays(Number(e.target.value))}
                  className="w-20 rounded-lg border border-slate-200 px-2.5 py-1 text-right text-xs font-semibold text-slate-900 transition focus:border-[#4677b9] focus:outline-none focus:ring-1 focus:ring-[#4677b9] sm:w-full sm:text-left"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 sm:flex-col sm:items-stretch min-[480px]:col-span-2 sm:col-span-1">
                <div className="flex items-center gap-2 sm:justify-between sm:mb-1.5">
                  <span className="text-xs font-medium text-slate-700">
                    Нийтийн амралт
                  </span>
                  <span className="text-[10px] font-bold text-[#1f4a88] bg-[#729fd0]/15 px-1.5 py-0.5 rounded-md shrink-0">
                    {result.holidayNightHours}ц
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={holidayNightDays || ""}
                  onChange={(e) => setHolidayNightDays(Number(e.target.value))}
                  className="w-20 rounded-lg border border-slate-200 px-2.5 py-1 text-right text-xs font-semibold text-slate-900 transition focus:border-[#4677b9] focus:outline-none focus:ring-1 focus:ring-[#4677b9] sm:w-full sm:text-left"
                />
              </div>
            </div>
          </div>

          {/* Аялал */}
          <div>
            <p className="mb-2 text-xs font-bold text-slate-800">Аялал</p>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 sm:flex-col sm:items-stretch">
              <div className="flex items-center gap-2 sm:justify-between sm:mb-1.5">
                <span className="text-xs font-medium text-slate-700">
                  Аяллын цаг
                </span>
                <span className="text-[10px] font-bold text-[#1f4a88] bg-[#729fd0]/15 px-1.5 py-0.5 rounded-md shrink-0">
                  {result.travelHours}ц
                </span>
              </div>
              <input
                type="number"
                min="0"
                value={travelHours || ""}
                onChange={(e) => setTravelHours(Number(e.target.value))}
                className="w-20 rounded-lg border border-slate-200 px-2.5 py-1 text-right text-xs font-semibold text-slate-900 transition focus:border-[#4677b9] focus:outline-none focus:ring-1 focus:ring-[#4677b9] sm:w-full sm:text-left"
              />
            </div>
          </div>
        </div>

        {/* Үр дүн хэсэг */}
        <div className="mt-6 rounded-xl bg-slate-50/50 p-3.5 border border-slate-100">
          <div className="border-b border-slate-200/60 pb-3 mb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Тооцооллын үр дүн
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-700 gap-2">
              <span className="shrink-0">Нийт ажилласан өдөр:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {result.totalDays} өдөр
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-700 gap-2">
              <span className="shrink-0">Амралтын нэмэлт цаг:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {result.holidayExtraHours} цаг
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-700 gap-2">
              <span className="shrink-0">Нийт ажилласан цаг:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {result.totalHours} цаг
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-700 pt-1 gap-2">
              <span className="shrink-0">Нийт бодогдох цалин:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {formatMNT(result.gross)}
              </span>
            </div>

            <div className="my-2.5 border-t border-dashed border-slate-200" />

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-slate-600 gap-2">
                <span className="shrink-0">НДШ:</span>
                <span className="font-semibold text-rose-600 tabular-nums">
                  - {formatMNT(result.ndsh)}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600 gap-2">
                <span className="shrink-0">ХХОАТ:</span>
                <span className="font-semibold text-rose-600 tabular-nums">
                  - {formatMNT(result.finalHhoat)}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600 gap-2">
                <span className="shrink-0">ХХОАТ хөнгөлөлт:</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  + {formatMNT(result.relief)}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600 gap-2">
                <span className="shrink-0">Хамтын суутгал (фонд):</span>
                <span className="font-semibold text-rose-600 tabular-nums">
                  - {formatMNT(fond)}
                </span>
              </div>
            </div>

            <div className="mt-3 border-t border-slate-200/80 pt-3">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Wallet className="h-4 w-4 text-[#f7a614]" />
                  <span>Гарт олгох цалин:</span>
                </div>
                <span className="font-extrabold text-[#1f4a88] text-base tabular-nums">
                  {formatMNT(result.net)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
