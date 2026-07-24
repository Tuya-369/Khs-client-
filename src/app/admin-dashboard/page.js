"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, api } from "@/lib/api";
import { clearSession, getAccessToken } from "@/lib/session";
import DashboardProfileCard from "@/Component/common/DashboardProfileCard";

export default function AdminDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [readFilter, setReadFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadRequests = useCallback(
    async (status = statusFilter, read = readFilter) => {
      const token = getAccessToken();
      if (!token) {
        router.push("/auth");
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        const [meResponse, requestsResponse] = await Promise.all([
          api.me(token),
          api.getAdminRequests(token, {
            status:
              status === "pending"
                ? "PENDING"
                : status === "approved"
                  ? "APPROVED"
                  : status === "rejected"
                    ? "REJECTED"
                    : undefined,
            isReadByAdmin:
              read === "read"
                ? "true"
                : read === "unread"
                  ? "false"
                  : undefined,
            page: 1,
            limit: 100,
          }),
        ]);

        setProfile(meResponse?.data?.user || null);
        setOrders(requestsResponse?.data?.items || []);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearSession();
          router.push("/auth");
          return;
        }

        setErrorMessage("Хүсэлтийн жагсаалт татах үед алдаа гарлаа.");
      } finally {
        setLoading(false);
      }
    },
    [readFilter, router, statusFilter],
  );

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadRequests(statusFilter, readFilter);
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [loadRequests, readFilter, statusFilter]);

  const handleUpdateStatus = async (id, newStatus) => {
    const token = getAccessToken();
    if (!token) {
      router.push("/auth");
      return;
    }

    try {
      await api.updateRequestStatus(token, id, newStatus.toUpperCase());
      await loadRequests(statusFilter, readFilter);
    } catch (error) {
      setErrorMessage("Төлөв шинэчлэх үед алдаа гарлаа.");
    }
  };

  const handleMarkAsRead = async (id) => {
    const target = orders.find((order) => order.id === id);
    if (!target || target.isReadByAdmin) {
      return;
    }

    const token = getAccessToken();
    if (!token) {
      router.push("/auth");
      return;
    }

    try {
      await api.markRequestRead(token, id);
      await loadRequests(statusFilter, readFilter);
    } catch {
      setErrorMessage("Уншсан төлөвт оруулах үед алдаа гарлаа.");
    }
  };

  const getCount = (type, value) => {
    if (type === "status") {
      if (value === "all") return orders.length;
      return orders.filter((o) => o.status === value.toUpperCase()).length;
    }
    if (type === "read") {
      if (value === "read") return orders.filter((o) => o.isReadByAdmin).length;
      if (value === "unread")
        return orders.filter((o) => !o.isReadByAdmin).length;
    }
    return 0;
  };

  const filteredOrders = useMemo(() => orders, [orders]);

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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased p-4 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-5">
        <DashboardProfileCard
          badge="A"
          name={profile ? `${profile.lastName} ${profile.firstName}` : "..."}
          subtitle="Захиалгын менежер"
          sapId={profile?.sapId || "-"}
          totalLabel="Нийт хүсэлт"
          totalValue={orders.length}
        />

        {loading && (
          <div className="p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-500">
            Хүсэлтүүд ачаалж байна...
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
            {errorMessage}
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Захиалгын төлөв
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
                  statusFilter === "all"
                    ? "bg-slate-900 border-slate-900 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                Бүгд
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${statusFilter === "all" ? "bg-slate-700 text-slate-200" : "bg-slate-100 text-slate-500"}`}
                >
                  {getCount("status", "all")}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("pending")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
                  statusFilter === "pending"
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                Шинэ
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${statusFilter === "pending" ? "bg-blue-700 text-blue-100" : "bg-blue-50 text-blue-600"}`}
                >
                  {getCount("status", "pending")}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("approved")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
                  statusFilter === "approved"
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                Батлагдсан
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${statusFilter === "approved" ? "bg-emerald-700 text-emerald-100" : "bg-emerald-50 text-emerald-600"}`}
                >
                  {getCount("status", "approved")}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("rejected")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
                  statusFilter === "rejected"
                    ? "bg-rose-600 border-rose-600 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                Батлагдаагүй
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${statusFilter === "rejected" ? "bg-rose-700 text-rose-100" : "bg-rose-50 text-rose-600"}`}
                >
                  {getCount("status", "rejected")}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-blue-500">
              {filteredOrders.length} хүсэлт
            </span>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400 shadow-xs">
              Шүүлтүүрт тохирох захиалга олдсонгүй.
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isApproved = order.status === "APPROVED";
              const isRejected = order.status === "REJECTED";
              const isPendingNow = order.status === "PENDING";

              return (
                <div
                  key={order.id}
                  onClick={() => handleMarkAsRead(order.id)}
                  className={`bg-white border rounded-xl p-4 sm:p-5 shadow-xs space-y-4 transition-all relative cursor-pointer ${
                    !order.isReadByAdmin
                      ? "border-amber-400 ring-1 ring-amber-50/50"
                      : "border-slate-200"
                  }`}
                >
                  {!order.isReadByAdmin && (
                    <span className="absolute top-4 left-4 w-2 h-2 bg-amber-500 rounded-full" />
                  )}

                  <div
                    className={`flex justify-between items-start gap-4 ${!order.isReadByAdmin ? "pl-4" : ""}`}
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                          {order.driver?.lastName} {order.driver?.firstName}
                        </h3>
                        <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                          #{order.driver?.sapId}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-medium">
                        {order.vehicle?.name} •{" "}
                        <span className="font-mono">
                          {order.vehicle?.plate}
                        </span>
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border shrink-0 ${
                        isApproved
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : isPendingNow
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {isApproved
                        ? "Батлагдсан"
                        : isPendingNow
                          ? "Шинэ"
                          : "Батлагдаагүй"}
                    </span>
                  </div>

                  <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-100 space-y-2">
                    <div className="text-xs font-bold text-slate-900">
                      Сэлбэг:{" "}
                      <span className="text-blue-600">
                        {order.part?.name || "Ерөнхий"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {order.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center gap-4 pt-2 border-t border-slate-100 flex-wrap">
                    <span className="text-[10px] font-mono text-slate-400">
                      Илгээсэн: {formatDate(order.createdAt)}
                    </span>

                    {isPendingNow && (
                      <div className="flex gap-1.5 ml-auto w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(order.id, "REJECTED");
                          }}
                          className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold border border-rose-200 bg-rose-50/30 text-rose-600 rounded-lg hover:bg-rose-50 active:bg-rose-100 transition"
                        >
                          Цуцлах
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(order.id, "APPROVED");
                          }}
                          className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:scale-95 transition shadow-xs"
                        >
                          Батлах
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
