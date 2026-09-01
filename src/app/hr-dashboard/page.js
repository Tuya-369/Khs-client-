"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock3, Pause, RefreshCw } from "lucide-react";
import { ApiError, api } from "@/lib/api";
import { clearSession, getAccessToken } from "@/lib/session";

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
  const [sapQuery, setSapQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

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
    const normalizedSapQuery = sapQuery.trim().toLowerCase();

    return feedbackItems.filter((item) => {
      const matchesSap =
        !normalizedSapQuery ||
        String(item.sapId || "")
          .toLowerCase()
          .includes(normalizedSapQuery);

      if (!selectedMonth || !item.createdAt) return matchesSap;

      const createdAt = new Date(item.createdAt);
      const itemMonth = `${createdAt.getFullYear()}-${String(
        createdAt.getMonth() + 1,
      ).padStart(2, "0")}`;

      return matchesSap && itemMonth === selectedMonth;
    });
  }, [feedbackItems, sapQuery, selectedMonth]);

  return (
    <main
      className={`text-slate-800 ${
        embedded ? "" : "min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8"
      }`}
    >
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Хянах самбар</h1>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="search"
            value={sapQuery}
            onChange={(event) => setSapQuery(event.target.value)}
            placeholder="SAP дугаараар хайх..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200 sm:w-60"
          />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span>Сар:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>
        </div>

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
            {filteredFeedbackItems.map((item) => {
              const currentStatus =
                statusConfig[item.status] || statusConfig.PENDING;
              const fullName =
                `${item.lastName || ""} ${item.firstName || ""}`.trim() ||
                "Тодорхойгүй";
              const isUpdating = updatingId === item.id;

              return (
                <article
                  key={item.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-slate-900">
                        {fullName}
                      </h2>
                      {(item.sapId || item.phoneNumber) && (
                        <p className="mt-1 text-xs text-slate-500">
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
      </div>
    </main>
  );
}
