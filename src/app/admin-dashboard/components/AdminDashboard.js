"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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

const getUploadedImageUrl = (url) => {
  if (!url) return "";
  return url.startsWith("/")
    ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${url}`
    : url;
};

export default function AdminDashboard({ currentUser }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingItemId, setUpdatingItemId] = useState("");

  const role = currentUser?.role;
  const isRequestSupervisor = role === "ADMIN";

  // Шүүлтүүрийн state-үүд
  const [sapQuery, setSapQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(
    isRequestSupervisor ? "SEARCHING" : "all",
  );
  const [selectedDate, setSelectedDate] = useState(""); // YYYY-MM-DD

  // Модал цонхны state
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const statusTimer = window.setTimeout(() => {
      setStatusFilter(isRequestSupervisor ? "SEARCHING" : "all");
    }, 0);

    return () => window.clearTimeout(statusTimer);
  }, [isRequestSupervisor]);

  // Өгөгдөл татах функц
  const fetchItems = useCallback(
    async (isMounted) => {
      const token = getAccessToken();
      if (!token) return;

      setLoading(true);
      setError("");
      try {
        let res;
        if (role === "TOKEN_MANAGER") {
          res = await api.getManagerOrders(token, "all");
        } else if (isRequestSupervisor) {
          res = await api.getAdminRequests(token, {
            page: 1,
            limit: 100,
          });
        } else {
          res = await api.getMyRequests(token);
        }

        if (isMounted()) {
          const fetchedData = isRequestSupervisor
            ? res?.data?.items
            : res?.data;
          setItems(Array.isArray(fetchedData) ? fetchedData : []);
        }
      } catch (err) {
        if (isMounted()) {
          setError(
            err?.response?.data?.message ||
              "Хяналтын мэдээлэл татах үед алдаа гарлаа.",
          );
        }
      } finally {
        if (isMounted()) {
          setLoading(false);
        }
      }
    },
    [isRequestSupervisor, role],
  );

  useEffect(() => {
    let mounted = true;
    const isMounted = () => mounted;
    const loadTimer = window.setTimeout(() => {
      void fetchItems(isMounted);
    }, 0);

    return () => {
      mounted = false;
      window.clearTimeout(loadTimer);
    };
  }, [fetchItems]);

  // Төлөв солих (ADMIN & TOKEN_MANAGER-т тус тусад нь)
  const handleStatusChange = async (event, itemId, newStatus) => {
    event.stopPropagation();

    const token = getAccessToken();
    if (!token) return;

    setUpdatingItemId(itemId);
    setError("");
    try {
      if (role === "TOKEN_MANAGER") {
        if (newStatus === "CONFIRMED") {
          await api.confirmOrder(token, itemId);
        } else {
          await api.rejectOrder(token, itemId);
        }
      } else {
        await api.updateRequestStatus(token, itemId, newStatus);
      }

      // Төлөвийг шинэчлэх
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === itemId ? { ...item, status: newStatus } : item,
        ),
      );

      if (selectedItem?.id === itemId) {
        setSelectedItem((prev) =>
          prev ? { ...prev, status: newStatus } : null,
        );
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || "Төлөв шинэчлэх үед алдаа гарлаа.",
      );
    } finally {
      setUpdatingItemId("");
    }
  };

  // Дата шүүх логик
  const filteredItems = useMemo(() => {
    let rows = items ? [...items] : [];

    // 1. Төлөвөөр шүүх
    if (isRequestSupervisor) {
      if (statusFilter === "SEARCHING") {
        rows = rows.filter((item) =>
          ["PENDING", "NEW", "APPROVED", "SEARCHING"].includes(item?.status),
        );
      } else if (statusFilter === "NOT_FOUND") {
        rows = rows.filter((item) =>
          ["NOT_FOUND", "REJECTED"].includes(item?.status),
        );
      } else if (statusFilter === "COMPLETED") {
        rows = rows.filter((item) =>
          ["COMPLETED", "CONFIRMED"].includes(item?.status),
        );
      }
    } else {
      if (statusFilter === "approved") {
        rows = rows.filter((item) =>
          ["APPROVED", "CONFIRMED"].includes(item?.status),
        );
      } else if (statusFilter === "unapproved") {
        rows = rows.filter(
          (item) => !["APPROVED", "CONFIRMED"].includes(item?.status),
        );
      }
    }

    // 2. Огноогоор шүүх
    if (selectedDate) {
      rows = rows.filter((item) => {
        const itemDateValue = getItemDate(item, role);
        if (!itemDateValue) return false;

        const dateObj = new Date(itemDateValue);
        if (isNaN(dateObj.getTime())) return false;

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
      rows = rows.filter((item) => {
        const sap = getRequesterSap(item, role, currentUser);
        return String(sap || "")
          .toLowerCase()
          .includes(query);
      });
    }

    return rows.sort((a, b) => {
      const dateA = new Date(getItemDate(a, role) || 0).getTime();
      const dateB = new Date(getItemDate(b, role) || 0).getTime();
      return dateB - dateA;
    });
  }, [
    items,
    statusFilter,
    selectedDate,
    sapQuery,
    isRequestSupervisor,
    role,
    currentUser,
  ]);

  // Табуудыг тодорхойлох
  const filterTabs = useMemo(() => {
    if (isRequestSupervisor) {
      return [
        { k: "SEARCHING", l: "Сэлбэг хайж байгаа" },
        { k: "NOT_FOUND", l: "Сэлбэг олоогүй" },
        { k: "COMPLETED", l: "Гүйцэтгэсэн" },
        { k: "all", l: "Бүгд" },
      ];
    }
    return [
      { k: "all", l: "Бүгд" },
      { k: "approved", l: "Баталсан" },
      { k: "unapproved", l: "Батлаагүй" },
    ];
  }, [isRequestSupervisor]);

  return (
    <div className="w-full max-w-full min-w-0 overflow-x-hidden rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-5 shadow-xs space-y-4 animate-fade-in">
      {/* 1. ШҮҮЛТҮҮРИЙН ХЭСЭГ */}
      <div className="space-y-3 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">
              Хяналтын самбар
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">
              Нийт {filteredItems.length} захиалга
            </p>
          </div>
          <input
            type="text"
            value={sapQuery}
            onChange={(e) => setSapQuery(e.target.value)}
            placeholder="SAP дугаараар хайх..."
            className="w-full sm:w-52 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 transition"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs min-w-0">
          {/* МОБАЙЛ ДЭЭР ДАРААЛАЛ ШИЛЖИЖ ШИНЭ МӨР ҮҮСГЭДЭГ TABS (гарч алдагдахгүй) */}
          <div className="flex w-full sm:w-auto flex-wrap min-w-0 gap-1 bg-slate-100/80 p-1 rounded-xl">
            {filterTabs.map((f) => (
              <button
                key={f.k}
                type="button"
                onClick={() => setStatusFilter(f.k)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium transition text-xs ${
                  statusFilter === f.k
                    ? "bg-white text-slate-900 shadow-sm font-semibold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {f.l}
              </button>
            ))}
          </div>

          {/* Огноо Хайгч */}
          <div className="flex items-center justify-between sm:justify-start gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 w-full sm:w-auto min-w-0 max-w-full">
            <span className="text-slate-400 font-medium text-xs shrink-0">
              Огноо:
            </span>
            <div className="flex items-center gap-1 min-w-0 flex-1 sm:flex-initial">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent focus:outline-none text-slate-700 font-medium cursor-pointer text-xs w-full min-w-0"
              />
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate("")}
                  className="text-slate-400 hover:text-slate-600 font-bold transition px-1 text-xs shrink-0"
                  title="Цэвэрлэх"
                >
                  ✕
                </button>
              )}
            </div>
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
        <div className="w-full min-w-0">
          {/* Desktop Хүснэгт */}
          <div className="hidden md:block overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3 w-16">ID</th>
                  <th className="p-3">SAP</th>
                  <th className="p-3">Захиалагч</th>
                  <th className="p-3">Огноо</th>
                  <th className="p-3 text-right">Үйлдэл / Төлөв</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredItems.map((item) => {
                  const isUpdating = updatingItemId === item.id;
                  const isPendingToken =
                    role === "TOKEN_MANAGER" && item?.status === "NEW";

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
                        {isRequestSupervisor ? (
                          statusFilter !== "COMPLETED" &&
                          item.status !== "COMPLETED" ? (
                            <div
                              className="inline-flex gap-1.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                disabled={
                                  isUpdating || item.status === "SEARCHING"
                                }
                                onClick={(e) =>
                                  handleStatusChange(e, item.id, "SEARCHING")
                                }
                                className={`rounded-md px-2 py-1 text-[10px] font-medium border transition ${
                                  item.status === "SEARCHING"
                                    ? "bg-amber-50 text-amber-700 border-amber-200 opacity-60 cursor-default"
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                Хайж байгаа
                              </button>
                              <button
                                type="button"
                                disabled={
                                  isUpdating || item.status === "NOT_FOUND"
                                }
                                onClick={(e) =>
                                  handleStatusChange(e, item.id, "NOT_FOUND")
                                }
                                className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                              >
                                Сэлбэг олоогүй
                              </button>
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={(e) =>
                                  handleStatusChange(e, item.id, "COMPLETED")
                                }
                                className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                              >
                                Гүйцэтгэсэн
                              </button>
                            </div>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded-md font-medium text-[10px] border border-slate-200 bg-slate-50 text-slate-600">
                              {statusLabel(item?.status)}
                            </span>
                          )
                        ) : isPendingToken ? (
                          <div
                            className="inline-flex gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={(e) =>
                                handleStatusChange(e, item.id, "CONFIRMED")
                              }
                              disabled={isUpdating}
                              className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 hover:bg-emerald-100"
                            >
                              Батлах
                            </button>
                            <button
                              type="button"
                              onClick={(e) =>
                                handleStatusChange(e, item.id, "REJECTED")
                              }
                              disabled={isUpdating}
                              className="rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700 hover:bg-rose-100"
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
          <div className="md:hidden space-y-2 min-w-0">
            {filteredItems.map((item) => {
              const isUpdating = updatingItemId === item.id;
              const isPendingToken =
                role === "TOKEN_MANAGER" && item?.status === "NEW";

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/50 active:scale-[0.99] transition cursor-pointer flex flex-col gap-2 min-w-0 overflow-hidden"
                >
                  <div className="flex justify-between items-start gap-2 min-w-0">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {getRequesterName(item, role)}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          #{item.id?.slice(0, 5)}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 truncate">
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

                  {/* ADMIN гар утасны товчлуурууд (Grid grid-cols-3 ашиглаж багтаасан) */}
                  {isRequestSupervisor &&
                    statusFilter !== "COMPLETED" &&
                    item.status !== "COMPLETED" && (
                      <div
                        className="grid grid-cols-3 gap-1 pt-1.5 border-t border-slate-200/50 w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          disabled={isUpdating || item.status === "SEARCHING"}
                          onClick={(e) =>
                            handleStatusChange(e, item.id, "SEARCHING")
                          }
                          className="w-full rounded-md border border-slate-200 bg-white px-1 py-1.5 text-[10px] font-medium text-slate-700 truncate text-center disabled:opacity-50"
                        >
                          Хайж байгаа
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={(e) =>
                            handleStatusChange(e, item.id, "NOT_FOUND")
                          }
                          className="w-full rounded-md border border-rose-200 bg-rose-50 px-1 py-1.5 text-[10px] font-medium text-rose-700 truncate text-center disabled:opacity-50"
                        >
                          Олоогүй
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={(e) =>
                            handleStatusChange(e, item.id, "COMPLETED")
                          }
                          className="w-full rounded-md border border-emerald-200 bg-emerald-50 px-1 py-1.5 text-[10px] font-medium text-emerald-700 truncate text-center disabled:opacity-50"
                        >
                          Гүйцэтгэсэн
                        </button>
                      </div>
                    )}

                  {/* TOKEN_MANAGER гар утасны товчлуурууд */}
                  {role === "TOKEN_MANAGER" && isPendingToken && (
                    <div
                      className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-200/50 w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) =>
                          handleStatusChange(e, item.id, "CONFIRMED")
                        }
                        disabled={isUpdating}
                        className="w-full rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-[10px] font-medium text-emerald-700 text-center truncate"
                      >
                        Батлах
                      </button>
                      <button
                        type="button"
                        onClick={(e) =>
                          handleStatusChange(e, item.id, "REJECTED")
                        }
                        disabled={isUpdating}
                        className="w-full rounded-md border border-rose-200 bg-rose-50 px-2 py-1.5 text-[10px] font-medium text-rose-700 text-center truncate"
                      >
                        Батлахгүй
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. ДЭЛГЭРЭНГҮЙ ХАРАХ МОДАЛ */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] p-4 flex items-center justify-center animate-fade-in">
          <div className="w-full max-w-xl bg-white rounded-xl border border-slate-200 shadow-xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
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
                  <div>
                    <span className="font-semibold text-slate-900">
                      Сонгосон сэлбэг:
                    </span>{" "}
                    {selectedItem?.requestParts
                      ?.map((item) => item.part?.name)
                      .filter(Boolean)
                      .join(", ") ||
                      selectedItem?.part?.name ||
                      "-"}
                  </div>
                  <p>
                    <span className="font-semibold text-slate-900">
                      Тайлбар:
                    </span>{" "}
                    {selectedItem?.description || "-"}
                  </p>
                  {selectedItem?.images?.length > 0 && (
                    <div>
                      <p className="mb-2 font-semibold text-slate-900">
                        Эвдрэлийн зургууд:
                      </p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {selectedItem.images.map((image) => {
                          const imageUrl = getUploadedImageUrl(image.url);

                          return (
                            <a
                              key={image.id}
                              href={imageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="relative aspect-square overflow-hidden rounded-lg border border-slate-200"
                            >
                              <Image
                                src={imageUrl}
                                alt="Эвдрэлийн зураг"
                                fill
                                sizes="(max-width: 640px) 45vw, 160px"
                                unoptimized
                                className="object-cover"
                              />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
