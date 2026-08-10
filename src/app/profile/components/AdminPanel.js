"use client";

import { useEffect, useState } from "react";
import { ApiError, api } from "@/lib/api";
import { getAccessToken } from "@/lib/session";

const formatDate = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getUserName = (user) =>
  `${user?.lastName || ""} ${user?.firstName || ""}`.trim() || "-";

const getRequestStatusLabel = (status) => {
  if (status === "SEARCHING") return "Сэлбэг хайж байгаа";
  if (status === "NOT_FOUND") return "Сэлбэг олоогүй";
  if (status === "COMPLETED") return "Гүйцэтгэсэн";
  if (status === "PENDING") return "Шинэ";
  return status || "Шинэ";
};

const getRequestStatusClass = (status) => {
  if (status === "SEARCHING") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }
  if (status === "NOT_FOUND") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }
  if (status === "COMPLETED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  return "border-amber-200 bg-amber-50 text-amber-700";
};

function OrderCard({ order }) {
  const isConfirmed = order?.status === "CONFIRMED";

  return (
    <article className="border-b border-slate-100 py-3 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-xs font-bold text-slate-900">
          {order?.merchItem?.title || "Бараа"}
        </p>
        <span
          className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${
            isConfirmed
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-amber-200 bg-amber-50 text-amber-700"
          }`}
        >
          {isConfirmed ? "Батлагдсан" : "Батлагдаагүй"}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-slate-600">
        Захиалагч: {getUserName(order?.user)} · SAP: {order?.user?.sapId || "-"}
      </p>
      <p className="mt-1 text-[11px] text-slate-500">
        Хэмжээ: {order?.size || "-"} · Өнгө: {order?.color || "-"} · Тоо:{" "}
        {order?.qty ?? "-"}
      </p>
      <p className="mt-1 text-[11px] text-slate-400">
        Захиалсан: {formatDate(order?.orderedAt || order?.createdAt)}
      </p>
    </article>
  );
}

function PartRequestCard({ request }) {
  const partNames = request?.requestParts
    ?.map((item) => item?.part?.name)
    .filter(Boolean)
    .join(", ");

  return (
    <article className="border-b border-slate-100 py-3 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-900">
            {partNames || request?.part?.name || "Сэлбэгийн хүсэлт"}
          </p>
          <p className="mt-1 text-[11px] text-slate-600">
            Машин: {request?.vehicle?.name || "-"} ·{" "}
            {request?.vehicle?.plate || "-"}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${getRequestStatusClass(request?.status)}`}
        >
          {getRequestStatusLabel(request?.status)}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-slate-500">
        Захиалагч: {getUserName(request?.driver)} · SAP:{" "}
        {request?.driver?.sapId || "-"}
      </p>
      <p className="mt-1 text-[11px] text-slate-400">
        Хүсэлт гаргасан: {formatDate(request?.createdAt)}
      </p>
    </article>
  );
}

export default function AdminPanel() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [reviewedOrders, setReviewedOrders] = useState([]);
  const [partRequests, setPartRequests] = useState([]);
  const [activeView, setActiveView] = useState("merch");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      const token = getAccessToken();
      if (!token) return;

      setLoading(true);
      setErrorMessage("");
      try {
        const [merchResponse, requestsResponse] = await Promise.all([
          api.getAdminPanelOrders(token),
          api.getAdminRequests(token, { page: 1, limit: 100 }),
        ]);
        setPendingOrders(merchResponse?.data?.pendingOrders || []);
        setReviewedOrders(merchResponse?.data?.reviewedOrders || []);
        setPartRequests(requestsResponse?.data?.items || []);
      } catch (error) {
        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : "Admin Panel-ийн захиалга татах үед алдаа гарлаа.",
        );
      } finally {
        setLoading(false);
      }
    };

    const loadTimer = window.setTimeout(() => {
      void loadOrders();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, []);

  const sortOrders = (orders) =>
    [...orders].sort(
      (first, second) =>
        new Date(second?.orderedAt || second?.createdAt || 0).getTime() -
        new Date(first?.orderedAt || first?.createdAt || 0).getTime(),
    );

  return (
    <section
      id="admin-panel"
      className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5"
    >
      <div>
        <h2 className="text-base font-bold text-red-500">Хяналтын хэсэг</h2>
      </div>

      <div className="flex border-b border-slate-200">
        {[
          ["merch", "Merch", pendingOrders.length + reviewedOrders.length],
          ["parts", "Сэлбэг", partRequests.length],
        ].map(([value, label, count]) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveView(value)}
            className={`border-b-2 px-3 py-2 text-xs font-semibold transition-colors ${
              activeView === value
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {loading && (
        <p className="text-xs text-slate-400">Захиалгууд ачаалж байна...</p>
      )}
      {errorMessage && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {errorMessage}
        </p>
      )}
      {!loading && !errorMessage && (
        <>
          {activeView === "merch" ? (
            <section className="rounded-xl border border-slate-200 bg-white p-4">
              {sortOrders([...pendingOrders, ...reviewedOrders]).length ? (
                sortOrders([...pendingOrders, ...reviewedOrders]).map(
                  (order) => <OrderCard key={order.id} order={order} />,
                )
              ) : (
                <p className="py-6 text-center text-xs text-slate-400">
                  Merch захиалга алга.
                </p>
              )}
            </section>
          ) : (
            <section className="rounded-xl border border-slate-200 bg-white p-4">
              {sortOrders(partRequests).length ? (
                sortOrders(partRequests).map((request) => (
                  <PartRequestCard key={request.id} request={request} />
                ))
              ) : (
                <p className="py-6 text-center text-xs text-slate-400">
                  Сэлбэгийн хүсэлт алга.
                </p>
              )}
            </section>
          )}
        </>
      )}
    </section>
  );
}
