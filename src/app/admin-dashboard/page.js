"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, api } from "@/lib/api";
import { clearSession, getAccessToken } from "@/lib/session";
import DashboardProfileCard from "@/components/common/DashboardProfileCard";
import StatusFilterBar from "./components/StatusFilterBar";
import OrderList from "./components/OrderList";
import OrderDetailModal from "./components/OrderDetailModal";
import { getUploadedImageUrl, formatDate } from "./helpers";

export default function AdminDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [readFilter, setReadFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

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
    const refreshTimer = window.setInterval(() => {
      void loadRequests(statusFilter, readFilter);
    }, 15_000);

    return () => {
      window.clearTimeout(loadTimer);
      window.clearInterval(refreshTimer);
    };
  }, [loadRequests, readFilter, statusFilter]);

  const handleUpdateStatus = async (id, newStatus) => {
    const token = getAccessToken();
    if (!token) {
      router.push("/auth");
      return;
    }

    const nextFilter = newStatus === "APPROVED" ? "approved" : "rejected";
    setUpdatingOrderId(id);
    setErrorMessage("");
    try {
      await api.updateRequestStatus(token, id, newStatus);
      setStatusFilter(nextFilter);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Төлөв шинэчлэх үед алдаа гарлаа.",
      );
    } finally {
      setUpdatingOrderId("");
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

  const openOrderDetail = async (id) => {
    const token = getAccessToken();
    if (!token) {
      router.push("/auth");
      return;
    }

    setDetailLoading(true);
    setErrorMessage("");
    try {
      const response = await api.getAdminRequestById(token, id);
      setSelectedOrder(response?.data || null);
      await handleMarkAsRead(id);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Дэлгэрэнгүй мэдээлэл татах үед алдаа гарлаа.",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const counts = useMemo(() => {
    const byStatus = (status) =>
      orders.filter((order) => order.status === status).length;

    return {
      all: orders.length,
      pending: byStatus("PENDING"),
      approved: byStatus("APPROVED"),
      rejected: byStatus("REJECTED"),
    };
  }, [orders]);

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

        <StatusFilterBar
          statusFilter={statusFilter}
          onChange={setStatusFilter}
          counts={counts}
        />

        <OrderList
          orders={orders}
          onOpen={(id) => void openOrderDetail(id)}
          onUpdateStatus={(id, newStatus) =>
            void handleUpdateStatus(id, newStatus)
          }
          updatingOrderId={updatingOrderId}
          formatDate={formatDate}
        />

        <OrderDetailModal
          selectedOrder={selectedOrder}
          detailLoading={detailLoading}
          onClose={() => setSelectedOrder(null)}
          formatDate={formatDate}
          getUploadedImageUrl={getUploadedImageUrl}
        />
      </div>
    </div>
  );
}
