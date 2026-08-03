"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import {
  getItemDate,
  getRequesterSap,
  getRequesterName,
  formatDate,
  statusLabel,
} from "../helpers";

export default function AdminDashboard({ currentUser }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingItemId, setUpdatingItemId] = useState("");

  // Шүүлтүүрийн state-үүд
  const [sapQuery, setSapQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'approved', 'unapproved'
  const [selectedDate, setSelectedDate] = useState(""); // YYYY-MM-DD хайх огноо

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

  const handleStatusUpdate = async (event, itemId, status) => {
    event.stopPropagation();

    const token = getAccessToken();
    if (!token) return;

    setUpdatingItemId(itemId);
    setError("");
    try {
      if (role === "TOKEN_MANAGER") {
        if (status === "CONFIRMED") {
          await api.confirmOrder(token, itemId);
        } else {
          await api.rejectOrder(token, itemId);
        }
      } else {
        await api.updateRequestStatus(token, itemId, status);
      }
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === itemId ? { ...item, status } : item,
        ),
      );
    } catch {
      setError("Захиалгын төлөв шинэчлэх үед алдаа гарлаа.");
    } finally {
      setUpdatingItemId("");
    }
  };

  // Дата шүүх логик
  const filteredItems = useMemo(() => {
    let rows = [...items];

    // 1. Баталсан / Батлаагүй товчлуураар шүүх
    if (statusFilter === "approved") {
      rows = rows.filter((item) =>
        ["APPROVED", "CONFIRMED"].includes(item?.status),
      );
    } else if (statusFilter === "unapproved") {
      rows = rows.filter(
        (item) => !["APPROVED", "CONFIRMED"].includes(item?.status),
      );
    }

    // 2. Огнооны нэгдсэн хайлтаар шүүх (Жил, сар, өдөр)
    if (selectedDate) {
      rows = rows.filter((item) => {
        const itemDateValue = getItemDate(item, role);
        if (!itemDateValue) return false;

        const dateObj = new Date(itemDateValue);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        const itemDateString = `${year}-${month}-${day}`;

        return itemDateString === selectedDate;
      });
    }

    // 3. SAP дугаараар шүүх
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
  }, [items, statusFilter, selectedDate, sapQuery, role, currentUser]);

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

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Шинэ/Хуучин товчны оронд Баталсан/Батлаагүй Button Group */}
          <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg shrink-0">
            {[
              { k: "all", l: "Бүгд" },
              { k: "approved", l: "Баталсан" },
              { k: "unapproved", l: "Батлаагүй" },
            ].map((f) => (
              <button
                key={f.k}
                onClick={() => setStatusFilter(f.k)}
                className={`px-3 py-1.5 rounded-md font-medium transition text-xs ${
                  statusFilter === f.k
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {f.l}
              </button>
            ))}
          </div>

          {/* Он, сар, өдрийн Нэгдсэн Огноо Хайгч */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-slate-400 font-medium">Огноо:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent focus:outline-none text-slate-700 font-medium cursor-pointer"
            />
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate("")}
                className="ml-1 text-slate-400 hover:text-slate-600 font-bold transition"
                title="Цэвэрлэх"
              >
                ✕
              </button>
            )}
          </div>
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
                {filteredItems.map((item) => {
                  const isPendingItem =
                    (role === "ADMIN" && item?.status === "PENDING") ||
                    (role === "TOKEN_MANAGER" && item?.status === "NEW");

                  return (
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
                        {isPendingItem ? (
                          <div className="inline-flex gap-1">
                            <button
                              type="button"
                              onClick={(event) =>
                                handleStatusUpdate(
                                  event,
                                  item.id,
                                  role === "TOKEN_MANAGER"
                                    ? "CONFIRMED"
                                    : "APPROVED",
                                )
                              }
                              disabled={updatingItemId === item.id}
                              className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Батлах
                            </button>
                            <button
                              type="button"
                              onClick={(event) =>
                                handleStatusUpdate(event, item.id, "REJECTED")
                              }
                              disabled={updatingItemId === item.id}
                              className="rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Батлахгүй
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-md font-medium text-[10px] border border-slate-200 bg-slate-50 text-slate-600">
                            {statusLabel(item?.status)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile First Жагсаалт */}
          <div className="md:hidden space-y-2">
            {filteredItems.map((item) => {
              const isPendingItem =
                (role === "ADMIN" && item?.status === "PENDING") ||
                (role === "TOKEN_MANAGER" && item?.status === "NEW");

              return (
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
                  {isPendingItem ? (
                    <div className="flex shrink-0 flex-col gap-1">
                      <button
                        type="button"
                        onClick={(event) =>
                          handleStatusUpdate(
                            event,
                            item.id,
                            role === "TOKEN_MANAGER" ? "CONFIRMED" : "APPROVED",
                          )
                        }
                        disabled={updatingItemId === item.id}
                        className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Батлах
                      </button>
                      <button
                        type="button"
                        onClick={(event) =>
                          handleStatusUpdate(event, item.id, "REJECTED")
                        }
                        disabled={updatingItemId === item.id}
                        className="rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Батлахгүй
                      </button>
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md font-medium text-[10px] border border-slate-200 bg-white text-slate-600 shrink-0">
                      {statusLabel(item?.status)}
                    </span>
                  )}
                </div>
              );
            })}
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
