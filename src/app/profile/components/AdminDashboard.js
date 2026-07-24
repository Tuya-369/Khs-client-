"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import {
  getItemDate,
  isNewItem,
  getRequesterSap,
  getRequesterName,
  formatDate,
  statusLabel,
} from "../helpers";

export default function AdminDashboard({ currentUser }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Шүүлтүүрүүд
  const [sapQuery, setSapQuery] = useState("");
  const [dashboardFilter, setDashboardFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");

  // Модал цонхны state
  const [selectedItem, setSelectedItem] = useState(null);

  const role = currentUser?.role;

  useEffect(() => {
    const fetchItems = async () => {
      const token = getAccessToken();
      if (!token) return;
      setLoading(true);
      setError("");
      try {
        if (role === "TOKEN_MANAGER") {
          const res = await api.getManagerOrders(token, "all");
          setItems(res?.data || []);
        } else if (role === "ADMIN") {
          const res = await api.getAdminRequests(token, {
            page: 1,
            limit: 100,
          });
          setItems(res?.data?.items || []);
        } else {
          const res = await api.getMyRequests(token);
          setItems(res?.data || []);
        }
      } catch {
        setError("Хяналтын мэдээлэл татах үед алдаа гарлаа.");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [role]);

  // Он сонгох жагсаалт үүсгэх
  const yearOptions = useMemo(() => {
    const years = new Set();
    items.forEach((item) => {
      const dateValue = getItemDate(item, role);
      if (dateValue) years.add(new Date(dateValue).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [items, role]);

  // Дата шүүх логик
  const filteredItems = useMemo(() => {
    let rows = [...items];
    if (dashboardFilter === "new")
      rows = rows.filter((item) => isNewItem(item, role));
    else if (dashboardFilter === "old")
      rows = rows.filter((item) => !isNewItem(item, role));

    if (selectedYear !== "all") {
      rows = rows.filter(
        (item) =>
          String(new Date(getItemDate(item, role)).getFullYear()) ===
          selectedYear,
      );
    }
    if (selectedMonth !== "all") {
      rows = rows.filter(
        (item) =>
          String(new Date(getItemDate(item, role)).getMonth() + 1) ===
          selectedMonth,
      );
    }
    if (role === "ADMIN") {
      if (verificationFilter === "approved")
        rows = rows.filter((item) => item?.status === "APPROVED");
      else if (verificationFilter === "rejected")
        rows = rows.filter((item) => item?.status === "REJECTED");
    }
    const query = sapQuery.trim().toLowerCase();
    if (query) {
      rows = rows.filter((item) =>
        String(getRequesterSap(item, role, currentUser))
          .toLowerCase()
          .includes(query),
      );
    }
    return rows.sort(
      (a, b) =>
        new Date(getItemDate(b, role) || 0).getTime() -
        new Date(getItemDate(a, role) || 0).getTime(),
    );
  }, [
    items,
    dashboardFilter,
    verificationFilter,
    selectedYear,
    selectedMonth,
    sapQuery,
    role,
    currentUser,
  ]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4 animate-fade-in">
      {/* 1. ШҮҮЛТҮҮРИЙН ХЭСЭГ */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">
            Хяналтын самбар
          </h2>
          <input
            type="text"
            value={sapQuery}
            onChange={(e) => setSapQuery(e.target.value)}
            placeholder="SAP дугаараар хайх..."
            className="w-full sm:w-52 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg shrink-0">
            {[
              { k: "all", l: "Бүгд" },
              { k: "new", l: "Шинэ" },
              { k: "old", l: "Хуучин" },
            ].map((f) => (
              <button
                key={f.k}
                onClick={() => setDashboardFilter(f.k)}
                className={`px-2.5 py-1 rounded-md font-medium transition ${dashboardFilter === f.k ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"}`}
              >
                {f.l}
              </button>
            ))}
          </div>

          {role === "ADMIN" && (
            <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg shrink-0">
              {[
                { k: "all", l: "Бүх төлөв" },
                { k: "approved", l: "Баталсан" },
                { k: "rejected", l: "Татгалзсан" },
              ].map((f) => (
                <button
                  key={f.k}
                  onClick={() => setVerificationFilter(f.k)}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${verificationFilter === f.k ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"}`}
                >
                  {f.l}
                </button>
              ))}
            </div>
          )}

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-600 font-medium"
          >
            <option value="all">Бүх он</option>
            {yearOptions.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-600 font-medium"
          >
            <option value="all">Бүх сар</option>
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i + 1} value={String(i + 1)}>
                {i + 1} сар
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. ЖАГСААЛТ / ХҮСНЭГТ ХЭСЭГ */}
      {error && (
        <div className="text-xs text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
          {error}
        </div>
      )}
      {loading && (
        <div className="text-xs text-slate-400 py-4 animate-pulse">
          Ачаалж байна...
        </div>
      )}
      {!loading && !error && filteredItems.length === 0 && (
        <div className="text-center text-xs text-slate-400 py-6 border border-dashed rounded-xl bg-slate-50">
          Захиалга олдсонгүй.
        </div>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <>
          {/* Desktop Хүснэгт */}
          <div className="hidden md:block overflow-hidden border border-slate-100 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3 w-16">ID</th>
                  <th className="p-3">SAP</th>
                  <th className="p-3">Захиалагч</th>
                  <th className="p-3">Огноо</th>
                  <th className="p-3 text-right">Төлөв</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="hover:bg-slate-50/80 cursor-pointer transition"
                  >
                    <td className="p-3 text-slate-400 font-mono text-[10px]">
                      {item.id?.slice(0, 6)}
                    </td>
                    <td className="p-3 font-semibold text-slate-700">
                      {getRequesterSap(item, role, currentUser)}
                    </td>
                    <td className="p-3 font-medium text-slate-800">
                      {getRequesterName(item, role)}
                    </td>
                    <td className="p-3 text-slate-400">
                      {formatDate(getItemDate(item, role))}
                    </td>
                    <td className="p-3 text-right">
                      <span className="inline-flex px-2 py-0.5 rounded-md font-medium text-[10px] border border-slate-200 bg-slate-50 text-slate-600">
                        {statusLabel(item?.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile First Жагсаалт */}
          <div className="md:hidden space-y-2">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/50 active:scale-[0.99] transition cursor-pointer flex justify-between items-start gap-2"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {getRequesterName(item, role)}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      #{item.id?.slice(0, 5)}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500">
                    SAP ID: {getRequesterSap(item, role, currentUser)}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {formatDate(getItemDate(item, role))}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-md font-medium text-[10px] border border-slate-200 bg-white text-slate-600 shrink-0">
                  {statusLabel(item?.status)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 3. ДЭЛГЭРЭНГҮЙ ХАРАХ МОДАЛ */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] p-4 flex items-center justify-center animate-fade-in">
          <div className="w-full max-w-xl bg-white rounded-xl border border-slate-200 shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                Захиалгын дэлгэрэнгүй
              </h3>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-2 py-1 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Хаах
              </button>
            </div>
            <div className="text-xs space-y-2.5 text-slate-700">
              <p>
                <span className="font-semibold text-slate-900">ID:</span>{" "}
                {selectedItem.id}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Захиалагч:</span>{" "}
                {getRequesterName(selectedItem, role)}
              </p>
              <p>
                <span className="font-semibold text-slate-900">SAP:</span>{" "}
                {getRequesterSap(selectedItem, role, currentUser)}
              </p>
              {role === "TOKEN_MANAGER" && (
                <p>
                  <span className="font-semibold text-slate-900">Утас:</span>{" "}
                  {selectedItem?.user?.phoneNumber || "-"}
                </p>
              )}
              <p>
                <span className="font-semibold text-slate-900">Огноо:</span>{" "}
                {formatDate(getItemDate(selectedItem, role))}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Төлөв:</span>{" "}
                {statusLabel(selectedItem?.status)}
              </p>
              {role === "TOKEN_MANAGER" ? (
                <>
                  <div className="relative h-36 w-36 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    {selectedItem?.merchItem?.imageUrl ? (
                      <Image
                        src={selectedItem.merchItem.imageUrl}
                        alt={selectedItem.merchItem.title || "Merch"}
                        fill
                        sizes="144px"
                        unoptimized
                        className="object-contain"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-slate-400">
                        Зураггүй
                      </div>
                    )}
                  </div>
                  <p>
                    <span className="font-semibold text-slate-900">Бараа:</span>{" "}
                    {selectedItem?.merchItem?.title || "-"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">
                      Хэмжээ / Өнгө:
                    </span>{" "}
                    {selectedItem?.size || "-"} / {selectedItem?.color || "-"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Тоо:</span>{" "}
                    {selectedItem?.qty ?? "-"}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <span className="font-semibold text-slate-900">Машин:</span>{" "}
                    {selectedItem?.vehicle?.name || "-"} •{" "}
                    {selectedItem?.vehicle?.plate || "-"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">
                      Тайлбар:
                    </span>{" "}
                    {selectedItem?.description || "-"}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
