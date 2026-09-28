"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MessageSquareText,
  Pause,
} from "lucide-react";
import { ApiError, api } from "@/lib/api";
import { clearSession, getAccessToken } from "@/lib/session";

const PAGE_SIZE = 4;

const statusConfig = {
  PENDING: {
    label: "Хүлээгдэж байна",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  RESOLVED: {
    label: "Шийдвэрлэсэн",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  SUSPENDED: {
    label: "Түдгэлзүүлсэн",
    className: "border-slate-200 bg-slate-100 text-slate-700",
  },
};

const statusFilters = [
  { value: "ALL", label: "Бүгд" },
  { value: "PENDING", label: statusConfig.PENDING.label },
  { value: "RESOLVED", label: statusConfig.RESOLVED.label },
  { value: "SUSPENDED", label: statusConfig.SUSPENDED.label },
];

const categoryConfig = {
  WORKPLACE: {
    label: "Ажлын орчин",
    className: "bg-violet-50 text-violet-700",
    dotClass: "bg-violet-500",
    barClass: "bg-violet-500",
  },
  OPERATIONS: {
    label: "Үйл ажиллагаа",
    className: "bg-blue-50 text-blue-700",
    dotClass: "bg-blue-500",
    barClass: "bg-blue-500",
  },
  MANAGEMENT: {
    label: "Удирдлага",
    className: "bg-orange-50 text-orange-700",
    dotClass: "bg-orange-500",
    barClass: "bg-orange-500",
  },
  COMPENSATION: {
    label: "Цалин, хангамж",
    className: "bg-emerald-50 text-emerald-700",
    dotClass: "bg-emerald-500",
    barClass: "bg-emerald-500",
  },
  OTHER: {
    label: "Бусад",
    className: "bg-slate-100 text-slate-700",
    dotClass: "bg-slate-400",
    barClass: "bg-slate-400",
  },
};

const categoryFilters = [
  { value: "ALL", label: "Бүх ангилал" },
  ...Object.entries(categoryConfig).map(([value, { label }]) => ({
    value,
    label,
  })),
];

const branchLabels = {
  UG: "UG",
  UB: "UB",
  BAYAJUULAH: "Баяжуулах",
  PROJECT: "Төсөл",
  OPERATION: "Үйл ажиллагаа",
  CONTRACTION: "Гэрээт ажил",
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Intl.DateTimeFormat("mn-MN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

export default function HrDashboardPage({ embedded = false }) {
  const router = useRouter();
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [page, setPage] = useState(0);

  const loadFeedback = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/auth");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const meResponse = await api.me(token);
      if (meResponse?.data?.user?.role !== "HR") {
        router.replace("/");
        return;
      }

      const response = await api.getHrFeedback(token);
      const data = response?.data;
      setFeedbackItems(Array.isArray(data) ? data : data?.items || []);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSession();
        router.replace("/auth");
        return;
      }

      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Санал хүсэлт татахад алдаа гарлаа.",
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadFeedback();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [loadFeedback]);

  const updateStatus = async (id, status) => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/auth");
      return;
    }

    setUpdatingId(id);
    setErrorMessage("");
    try {
      await api.updateFeedbackStatus(token, id, status);
      setFeedbackItems((items) =>
        items.map((item) => (item.id === id ? { ...item, status } : item)),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Төлөв шинэчлэхэд алдаа гарлаа.",
      );
    } finally {
      setUpdatingId("");
    }
  };

  const filteredFeedbackItems = useMemo(() => {
    const filtered = feedbackItems.filter((item) => {
      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;
      const matchesCategory =
        categoryFilter === "ALL" || item.category === categoryFilter;
      const matchesBranch =
        branchFilter === "ALL" || item.ProjectName === branchFilter;

      return matchesStatus && matchesCategory && matchesBranch;
    });

    return filtered.slice().sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [feedbackItems, statusFilter, categoryFilter, branchFilter]);

  // Төлөвүүдийн тооцоолол
  const stats = useMemo(() => {
    const pending = feedbackItems.filter((i) => i.status === "PENDING").length;
    const resolved = feedbackItems.filter(
      (i) => i.status === "RESOLVED",
    ).length;
    const suspended = feedbackItems.filter(
      (i) => i.status === "SUSPENDED",
    ).length;
    const total = feedbackItems.length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return { pending, resolved, suspended, total, resolutionRate };
  }, [feedbackItems]);

  const categoryCounts = useMemo(
    () =>
      Object.keys(categoryConfig).map((category) => ({
        category,
        count: feedbackItems.filter((item) => item.category === category)
          .length,
      })),
    [feedbackItems],
  );

  const pageCount = Math.max(
    1,
    Math.ceil(filteredFeedbackItems.length / PAGE_SIZE),
  );
  const currentPage = Math.min(page, pageCount - 1);
  const paginatedFeedbackItems = filteredFeedbackItems.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  );

  const updateStatusFilter = (value) => {
    setStatusFilter(value);
    setPage(0);
  };

  return (
    <main
      className={`text-slate-800 ${
        embedded ? "" : "min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8"
      }`}
    >
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Санал хүсэлт</h1>
          </div>
        </div>

        {/* ШИНЭЧИЛСЭН: Нэгтгэсэн, зай багатай, мэргэжлийн тойм карт */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="absolute -right-12 -top-12 size-48 rounded-full bg-indigo-50/60 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:divide-x lg:divide-slate-100">
            {/* Зүүн тал: Нийт тоо, Шийдвэрлэлтийн хувь ба Төлөвийн суварга */}
            <div className="flex flex-col justify-between space-y-4 lg:pr-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Санал, хүсэлт
                    </h3>
                    <p className="text-xs text-slate-500">
                      Нийт ирсэн хүсэлт ба шийдвэрлэлтийн явц
                    </p>
                  </div>
                </div>

                {stats.pending > 0 && (
                  <div className="flex items-center gap-1.5 rounded-full border border-amber-200/60 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex size-2 rounded-full bg-amber-500"></span>
                    </span>
                    {stats.pending} шинэ
                  </div>
                )}
              </div>

              {/* Тоон үзүүлэлт болон Шийдвэрлэлтийн хувь */}
              <div className="flex items-end justify-between border-y border-slate-100 py-3">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold tracking-tight tabular-nums text-slate-900">
                      {stats.total}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      нийт хүсэлт
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 text-xs font-semibold text-emerald-600">
                    <span>{stats.resolutionRate}%</span>
                    <span className="text-[10px] font-normal text-slate-400">
                      шийдвэрлэлт
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${stats.resolutionRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Төлөвийн суварга */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-2 text-center">
                  <p className="text-[11px] font-medium text-slate-500">
                    Хүлээгдэж буй
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-amber-600">
                    {stats.pending}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-2 text-center">
                  <p className="text-[11px] font-medium text-slate-500">
                    Шийдвэрлэсэн
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-emerald-600">
                    {stats.resolved}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-2 text-center">
                  <p className="text-[11px] font-medium text-slate-500">
                    Түдгэлзүүлсэн
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-slate-600">
                    {stats.suspended}
                  </p>
                </div>
              </div>
            </div>

            {/* Баруун тал: Ангиллын хуваарилалт */}
            <div className="flex flex-col justify-between space-y-3 lg:pl-6">
              <h4 className="text-xs font-bold text-slate-800">
                Санал хүсэлтийн төрлөөр хуваарилалт
              </h4>
              <div className="space-y-2.5">
                {categoryCounts.map(({ category, count }) => {
                  const config = categoryConfig[category];
                  const percent = stats.total
                    ? Math.round((count / stats.total) * 100)
                    : 0;

                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <span
                            className={`size-2 rounded-full ${config.dotClass}`}
                          />
                          {config.label}
                        </span>
                        <span className="font-semibold tabular-nums text-slate-800">
                          {count}{" "}
                          <span className="text-[10px] font-normal text-slate-400">
                            ({percent}%)
                          </span>
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${config.barClass} transition-all duration-500`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Шүүлтүүрийн хэсэг */}
        <section className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <select
                value={branchFilter}
                onChange={(event) => {
                  setBranchFilter(event.target.value);
                  setPage(0);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-400"
              >
                <option value="ALL">Бүх салбар</option>
                {Object.entries(branchLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                value={categoryFilter}
                onChange={(event) => {
                  setCategoryFilter(event.target.value);
                  setPage(0);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-400"
              >
                {categoryFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => updateStatusFilter(filter.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  statusFilter === filter.value
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </section>

        {errorMessage && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {errorMessage}
          </p>
        )}

        {loading ? (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500">
            Ачаалж байна...
          </p>
        ) : filteredFeedbackItems.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Илгээсэн санал хүсэлт байхгүй байна.
          </p>
        ) : (
          <div className="space-y-3">
            {paginatedFeedbackItems.map((item, index) => {
              const currentStatus =
                statusConfig[item.status] || statusConfig.PENDING;
              const currentCategory =
                categoryConfig[item.category] || categoryConfig.OTHER;
              const fullName =
                `${item.lastName || ""} ${item.firstName || ""}`.trim() ||
                "Тодорхойгүй";
              const isUpdating = updatingId === item.id;

              return (
                <article
                  key={item.id}
                  className={`rounded-lg border border-slate-200 bg-white p-4 shadow-sm ${
                    index >= 3 ? "hidden sm:block" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-slate-900">
                        {fullName}
                      </h2>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-md px-2 py-1 text-[11px] font-semibold ${currentCategory.className}`}
                        >
                          {currentCategory.label}
                        </span>
                        {item.ProjectName && (
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                            {branchLabels[item.ProjectName] || item.ProjectName}
                          </span>
                        )}
                      </div>
                      {(item.sapId || item.phoneNumber) && (
                        <p className="mt-2 hidden text-xs text-slate-500 sm:block">
                          {item.sapId && <>SAP: {item.sapId}</>}
                          {item.sapId && item.phoneNumber && " | "}
                          {item.phoneNumber && <>Утас: {item.phoneNumber}</>}
                        </p>
                      )}
                    </div>
                    <span
                      className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${currentStatus.className}`}
                    >
                      {currentStatus.label}
                    </span>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {item.message}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock3 size={14} />
                      {formatDate(item.createdAt)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={isUpdating || item.status === "RESOLVED"}
                        onClick={() => void updateStatus(item.id, "RESOLVED")}
                        className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Check size={14} />
                        Шийдвэрлэсэн
                      </button>
                      <button
                        type="button"
                        disabled={isUpdating || item.status === "SUSPENDED"}
                        onClick={() => void updateStatus(item.id, "SUSPENDED")}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Pause size={14} />
                        Түдгэлзүүлсэн
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && filteredFeedbackItems.length > 0 && (
          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-xs text-slate-500">
              {currentPage + 1} / {pageCount} хуудас
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Өмнөх хуудас"
                disabled={currentPage === 0}
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="Дараагийн хуудас"
                disabled={currentPage >= pageCount - 1}
                onClick={() =>
                  setPage((prev) => Math.min(pageCount - 1, prev + 1))
                }
                className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
