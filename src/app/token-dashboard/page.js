"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, api } from "@/lib/api";
import { clearSession, getAccessToken } from "@/lib/session";
import DashboardProfileCard from "@/components/common/DashboardProfileCard";

const FILTERS = [
  { key: "all", label: "Бүгд" },
  { key: "delivered", label: "Хүлээлгэн өгсөн" },
  { key: "pending", label: "Хүлээгдэж байна" },
];

const isNewOrder = (order) => {
  if (order.isReadByManager || !order.orderedAt) {
    return false;
  }

  const orderedAt = new Date(order.orderedAt).getTime();
  const fourDaysAgo = Date.now() - 4 * 24 * 60 * 60 * 1000;

  return Number.isFinite(orderedAt) && orderedAt >= fourDaysAgo;
};

export default function TokenDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadOrders = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      router.push("/auth");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const [meResponse, ordersResponse] = await Promise.all([
        api.me(token),
        api.getManagerOrders(token, "all"),
      ]);

      setProfile(meResponse?.data?.user || null);
      setOrders(ordersResponse?.data || []);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSession();
        router.push("/auth");
        return;
      }

      setErrorMessage("Merch захиалга татах үед алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadOrders();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    if (activeFilter === "delivered") {
      return orders.filter((order) => order.status === "CONFIRMED");
    }

    if (activeFilter === "pending") {
      return orders.filter(
        (order) => order.status !== "CONFIRMED" && !isNewOrder(order),
      );
    }

    return orders;
  }, [activeFilter, orders]);

  const formatDate = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleString("mn-MN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleConfirm = async (id) => {
    const token = getAccessToken();
    if (!token) {
      router.push("/auth");
      return;
    }

    try {
      await api.confirmOrder(token, id);
      await loadOrders();
    } catch {
      setErrorMessage("Захиалга батлах үед алдаа гарлаа.");
    }
  };

  const handleMarkRead = async (id) => {
    const target = orders.find((order) => order.id === id);
    if (!target || target.isReadByManager) {
      return;
    }

    const token = getAccessToken();
    if (!token) {
      router.push("/auth");
      return;
    }

    try {
      await api.markOrderRead(token, id);
      await loadOrders();
    } catch {
      setErrorMessage("Уншсан төлөв шинэчлэх үед алдаа гарлаа.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 font-sans p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <DashboardProfileCard
          badge={profile?.firstName?.charAt(0)?.toUpperCase() || "T"}
          name={profile ? `${profile.lastName} ${profile.firstName}` : "..."}
          subtitle="Худалдан авалтын менежер"
          sapId={profile?.sapId || "-"}
          totalLabel="Нийт захиалга"
          totalValue={orders.length}
        />

        {loading && (
          <div className="p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-500">
            Захиалгууд ачаалж байна...
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
            {errorMessage}
          </div>
        )}

        <div className="bg-white border border-gray-200/60 rounded-2xl shadow-sm p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-gray-200 pb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-950 tracking-tight">
                Захиалгын хяналтын хэсэг
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => {
              const active = activeFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition ${
                    active
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const isNew = isNewOrder(order);
              const isDelivered = order.status === "CONFIRMED";
              const canMarkDelivered = !isDelivered;

              return (
                <div
                  key={order.id}
                  onClick={() => handleMarkRead(order.id)}
                  className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
                        {order?.merchItem?.imageUrl ? (
                          <Image
                            src={order.merchItem.imageUrl}
                            alt={order.merchItem.title}
                            fill
                            sizes="64px"
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                            No image
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {order?.merchItem?.title} / {order.size} /{" "}
                          {order.color}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {order?.user?.lastName} {order?.user?.firstName} • SAP{" "}
                          {order?.user?.sapId}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Утас: {order?.user?.phoneNumber || "-"}
                        </p>
                      </div>
                    </div>

                    {canMarkDelivered && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleConfirm(order.id);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                      >
                        Хүлээлгэн өгсөн
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600">
                      Захиалсан:{" "}
                      <span className="font-semibold">
                        {formatDate(order.orderedAt)}
                      </span>
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600">
                      Тоо: <span className="font-semibold">{order.qty}ш</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span
                      className={`px-2 py-1 rounded-md border font-semibold ${
                        isDelivered
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : isNew
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {isDelivered
                        ? "Хүлээлгэн өгсөн"
                        : isNew
                          ? "Шинэ"
                          : "Хүлээгдэж байна"}
                    </span>
                    <span className="text-slate-500">
                      {order.isReadByManager ? "Уншсан" : "Уншаагүй"}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredOrders.length === 0 && (
              <div className="text-center text-sm text-slate-500 py-8 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                Сонгосон төлөвт тохирох merch захиалга алга.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
