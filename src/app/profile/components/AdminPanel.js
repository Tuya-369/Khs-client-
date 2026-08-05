"use client";

import Image from "next/image";
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

const getApproverName = (order) =>
  getUserName(order?.confirmedBy || order?.approvedBy || order?.manager);

function OrderCard({ order }) {
  const isConfirmed = order?.status === "CONFIRMED";

  return (
    <article className="flex gap-3 border-b border-slate-100 py-3 last:border-b-0 first:pt-0 last:pb-0">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
        {order?.merchItem?.imageUrl ? (
          <Image
            src={order.merchItem.imageUrl}
            alt={order.merchItem.title || "Merch"}
            fill
            sizes="56px"
            unoptimized
            className="object-contain"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="truncate text-xs font-bold text-slate-900">
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
        <p className="text-[11px] text-slate-600">
          Захиалагч:{" "}
          <span className="font-semibold">{getUserName(order?.user)}</span>
          {" | "}SAP: {order?.user?.sapId || "-"}
        </p>
        <p className="text-[11px] text-slate-500">
          Хэмжээ: {order?.size || "-"} | Өнгө: {order?.color || "-"} | Тоо:{" "}
          {order?.qty ?? "-"}
        </p>
        <p className="text-[11px] text-slate-400">
          Захиалсан: {formatDate(order?.orderedAt || order?.createdAt)}
          {isConfirmed && ` | Баталсан: ${getApproverName(order)}`}
        </p>
      </div>
    </article>
  );
}

function OrderSection({ title, description, orders, confirmed }) {
  return (
    <section
      className={`rounded-xl border p-4 ${
        confirmed
          ? "border-emerald-200 bg-emerald-50/40"
          : "border-amber-200 bg-amber-50/40"
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
        <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-slate-600 shadow-xs">
          {orders.length}
        </span>
      </div>

      {orders.length ? (
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white/70 p-4 text-center text-xs text-slate-400">
          Захиалга алга.
        </div>
      )}
    </section>
  );
}

export default function AdminPanel() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [reviewedOrders, setReviewedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      const token = getAccessToken();
      if (!token) return;

      setLoading(true);
      setErrorMessage("");
      try {
        const response = await api.getAdminPanelOrders(token);
        setPendingOrders(response?.data?.pendingOrders || []);
        setReviewedOrders(response?.data?.reviewedOrders || []);
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

    void loadOrders();
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

      {loading && (
        <p className="text-xs text-slate-400">Захиалгууд ачаалж байна...</p>
      )}
      {errorMessage && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {errorMessage}
        </p>
      )}
      {!loading && !errorMessage && (
        <div className="grid gap-4 lg:grid-cols-2">
          <OrderSection
            title="Хүлээгдэж буй захиалга"
            description="Баталгаажуулалт хүлээж буй захиалгууд"
            orders={sortOrders(pendingOrders)}
          />
          <OrderSection
            title="Шийдвэрлэсэн захиалга"
            description="Баталсан эсвэл татгалзсан захиалгууд"
            orders={sortOrders(reviewedOrders)}
            confirmed
          />
        </div>
      )}
    </section>
  );
}
