"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, api } from "@/lib/api";
import { clearSession, getAccessToken } from "@/lib/session";

const DASHBOARD_FILTERS = [
  { key: "all", label: "Бүгд" },
  { key: "new", label: "Шинэ" },
  { key: "old", label: "Хуучин" },
];

const roleLabel = (role) => {
  if (role === "ADMIN") return "Админ";
  if (role === "DRIVER") return "Жолооч";
  if (role === "TOKEN_MANAGER") return "Токен менежер";
  return "Ажилтан";
};

const getItemDate = (item, role) => {
  return role === "TOKEN_MANAGER" ? item?.orderedAt : item?.createdAt;
};

const getRequesterName = (item, role) => {
  if (role === "TOKEN_MANAGER") {
    return `${item?.user?.lastName || ""} ${item?.user?.firstName || ""}`.trim();
  }
  if (role === "ADMIN") {
    return `${item?.driver?.lastName || ""} ${item?.driver?.firstName || ""}`.trim();
  }
  return "Өөрийн хүсэлт";
};

const getRequesterSap = (item, role, currentUser) => {
  if (role === "TOKEN_MANAGER") return item?.user?.sapId || "-";
  if (role === "ADMIN") return item?.driver?.sapId || "-";
  return currentUser?.sapId || "-";
};

const isNewItem = (item, role) => {
  if (role === "TOKEN_MANAGER") return item?.status === "NEW";
  return item?.status === "PENDING";
};

const statusLabel = (status) => {
  if (status === "NEW") return "Шинэ";
  if (status === "CONFIRMED") return "Батлагдсан";
  if (status === "PENDING") return "Шинэ";
  if (status === "APPROVED") return "Батлагдсан";
  if (status === "REJECTED") return "Цуцлагдсан";
  return status || "-";
};

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

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [dashboardItems, setDashboardItems] = useState([]);
  const [dashboardFilter, setDashboardFilter] = useState("all");
  const [sapQuery, setSapQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const hasDashboard =
    user?.role === "ADMIN" ||
    user?.role === "DRIVER" ||
    user?.role === "TOKEN_MANAGER";

  const loadDashboardItems = async (role, token) => {
    setDashboardLoading(true);
    setDashboardError("");

    try {
      if (role === "TOKEN_MANAGER") {
        const response = await api.getManagerOrders(token, "all");
        setDashboardItems(response?.data || []);
        return;
      }

      if (role === "ADMIN") {
        const response = await api.getAdminRequests(token, {
          page: 1,
          limit: 100,
        });
        setDashboardItems(response?.data?.items || []);
        return;
      }

      const response = await api.getMyRequests(token);
      setDashboardItems(response?.data || []);
    } catch {
      setDashboardError("Dashboard мэдээлэл татах үед алдаа гарлаа.");
      setDashboardItems([]);
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    const loadMe = async () => {
      const token = getAccessToken();
      if (!token) {
        router.replace("/auth");
        return;
      }

      setLoading(true);
      setDashboardLoading(false);
      setErrorMessage("");

      try {
        const response = await api.me(token);
        const currentUser = response?.data?.user || null;
        setUser(currentUser);

        if (
          currentUser?.role === "ADMIN" ||
          currentUser?.role === "DRIVER" ||
          currentUser?.role === "TOKEN_MANAGER"
        ) {
          await loadDashboardItems(currentUser.role, token);
        } else {
          setDashboardItems([]);
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearSession();
          router.replace("/auth");
          return;
        }

        setErrorMessage("Профайл татах үед алдаа гарлаа.");
        setDashboardItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadMe();
  }, [router]);

  const yearOptions = useMemo(() => {
    const years = new Set();
    dashboardItems.forEach((item) => {
      const dateValue = getItemDate(item, user?.role);
      if (dateValue) {
        years.add(new Date(dateValue).getFullYear());
      }
    });

    return Array.from(years).sort((a, b) => b - a);
  }, [dashboardItems, user?.role]);

  const filteredDashboardItems = useMemo(() => {
    let rows = [...dashboardItems];

    if (dashboardFilter === "new") {
      rows = rows.filter((item) => isNewItem(item, user?.role));
    } else if (dashboardFilter === "old") {
      rows = rows.filter((item) => !isNewItem(item, user?.role));
    }

    if (selectedYear !== "all") {
      rows = rows.filter((item) => {
        const dateValue = getItemDate(item, user?.role);
        if (!dateValue) return false;
        return String(new Date(dateValue).getFullYear()) === selectedYear;
      });
    }

    if (selectedMonth !== "all") {
      rows = rows.filter((item) => {
        const dateValue = getItemDate(item, user?.role);
        if (!dateValue) return false;
        return String(new Date(dateValue).getMonth() + 1) === selectedMonth;
      });
    }

    const query = sapQuery.trim().toLowerCase();
    if (query) {
      rows = rows.filter((item) =>
        String(getRequesterSap(item, user?.role, user))
          .toLowerCase()
          .includes(query),
      );
    }

    rows.sort((a, b) => {
      const aDate = new Date(getItemDate(a, user?.role) || 0).getTime();
      const bDate = new Date(getItemDate(b, user?.role) || 0).getTime();
      return bDate - aDate;
    });

    return rows;
  }, [
    dashboardItems,
    dashboardFilter,
    selectedYear,
    selectedMonth,
    sapQuery,
    user,
  ]);

  const handleLogout = async () => {
    const token = getAccessToken();
    try {
      await api.logout(token || undefined);
    } catch {
      // Continue logout on client even if backend logout fails.
    } finally {
      clearSession();
      router.replace("/auth");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 p-6">
        <div className="max-w-xl mx-auto p-6 bg-white rounded-xl border border-slate-200">
          Профайл ачаалж байна...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
            {errorMessage}
          </div>
        )}

        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="pt-2 space-y-2 text-sm">
            <p>
              <span className="font-semibold">Овог нэр:</span>{" "}
              {user ? `${user.lastName} ${user.firstName}` : "-"}
            </p>
            <p>
              <span className="font-semibold">SAP ID:</span>{" "}
              {user?.sapId || "-"}
            </p>
            <p>
              <span className="font-semibold">Утас:</span>{" "}
              {user?.phoneNumber || "-"}
            </p>
          </div>
        </div>

        {hasDashboard && (
          <div className="w-full mt-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                захиалгын хяналтын хэсэг
              </h2>
              <input
                type="text"
                value={sapQuery}
                onChange={(event) => setSapQuery(event.target.value)}
                placeholder="SAP дугаараар хайх..."
                className="w-full sm:w-64 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {DASHBOARD_FILTERS.map((filter) => {
                const active = dashboardFilter === filter.key;
                return (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setDashboardFilter(filter.key)}
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

              <select
                value={selectedYear}
                onChange={(event) => setSelectedYear(event.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              >
                <option value="all">Бүх он</option>
                {yearOptions.map((year) => (
                  <option key={year} value={String(year)}>
                    {year} он
                  </option>
                ))}
              </select>

              <select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              >
                <option value="all">Бүх сар</option>
                {Array.from({ length: 12 }).map((_, index) => {
                  const month = index + 1;
                  return (
                    <option key={month} value={String(month)}>
                      {month} сар
                    </option>
                  );
                })}
              </select>
            </div>

            {dashboardError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
                {dashboardError}
              </div>
            )}

            {dashboardLoading ? (
              <div className="text-sm text-slate-500">
                Dashboard ачаалж байна...
              </div>
            ) : (
              <>
                <div className="hidden md:block rounded-xl border border-slate-200">
                  <table className="w-full text-sm table-fixed">
                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                      <tr>
                        <th className="px-4 py-3 text-left w-[14%]">ID</th>
                        <th className="px-4 py-3 text-left w-[16%]">SAP</th>
                        <th className="px-4 py-3 text-left w-[28%]">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left w-[26%]">Date</th>
                        <th className="px-4 py-3 text-left w-[16%]">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDashboardItems.map((item) => (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer"
                        >
                          <td className="px-4 py-3 font-mono text-xs text-slate-600 truncate">
                            {item.id?.slice(0, 8)}
                          </td>
                          <td className="px-4 py-3 text-slate-700 truncate">
                            {getRequesterSap(item, user?.role, user)}
                          </td>
                          <td className="px-4 py-3 text-slate-900 font-medium truncate">
                            {getRequesterName(item, user?.role) || "-"}
                          </td>
                          <td className="px-4 py-3 text-slate-600 truncate">
                            {formatDate(getItemDate(item, user?.role))}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs px-2 py-1 rounded-md border border-slate-200 bg-white">
                              {statusLabel(item?.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden space-y-2">
                  {filteredDashboardItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className="w-full text-left rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {getRequesterName(item, user?.role) || "-"}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        SAP: {getRequesterSap(item, user?.role, user)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatDate(getItemDate(item, user?.role))}
                      </p>
                    </button>
                  ))}
                </div>

                {filteredDashboardItems.length === 0 && (
                  <div className="text-center text-sm text-slate-500 py-8 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                    Шүүлтүүрт тохирох захиалга алга.
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[1px] p-4 flex items-center justify-center">
          <div className="w-full max-w-xl bg-white rounded-xl border border-slate-200 shadow-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Захиалгын дэлгэрэнгүй
              </h3>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-2.5 py-1 text-xs rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Хаах
              </button>
            </div>

            <div className="text-sm space-y-2">
              <p>
                <span className="font-semibold">ID:</span> {selectedItem.id}
              </p>
              <p>
                <span className="font-semibold">Захиалагч:</span>{" "}
                {getRequesterName(selectedItem, user?.role) || "-"}
              </p>
              <p>
                <span className="font-semibold">SAP:</span>{" "}
                {getRequesterSap(selectedItem, user?.role, user)}
              </p>
              <p>
                <span className="font-semibold">Огноо:</span>{" "}
                {formatDate(getItemDate(selectedItem, user?.role))}
              </p>
              <p>
                <span className="font-semibold">Төлөв:</span>{" "}
                {statusLabel(selectedItem?.status)}
              </p>

              {user?.role === "TOKEN_MANAGER" && (
                <>
                  <p>
                    <span className="font-semibold">Бараа:</span>{" "}
                    {selectedItem?.merchItem?.title || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Хэмжээ / Өнгө:</span>{" "}
                    {selectedItem?.size || "-"} / {selectedItem?.color || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Тоо:</span>{" "}
                    {selectedItem?.qty ?? "-"}
                  </p>
                </>
              )}

              {user?.role !== "TOKEN_MANAGER" && (
                <>
                  <p>
                    <span className="font-semibold">Машин:</span>{" "}
                    {selectedItem?.vehicle?.name || "-"} •{" "}
                    {selectedItem?.vehicle?.plate || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Тайлбар:</span>{" "}
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
