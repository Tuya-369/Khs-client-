"use client";
import { useState } from "react";

const INITIAL_ORDERS = [
  {
    id: "order-1",
    driverName: "Лхамаа",
    sapId: "202699",
    carName: "Toyota Prius 30",
    plate: "8888 УБА",
    partName: "Тормосны наклад",
    description: "Тоормос дуугараад, үрэлт ихтэй болсон.",
    status: "approved",
    isRead: true,
    createdAt: "2026-07-19 14:20",
  },
  {
    id: "order-2",
    driverName: "Батаа",
    sapId: "202611",
    carName: "Hyundai Porter",
    plate: "1111 УББ",
    partName: "Агаарын шүүлтүүр",
    description: "Хүч сулраад байгаа тул солих шаардлагатай.",
    status: "pending", // Шинэ
    isRead: false,
    createdAt: "2026-07-20 09:15",
  },
  {
    id: "order-3",
    driverName: "Болд",
    sapId: "202645",
    carName: "Toyota Prius 30",
    plate: "5555 УБХ",
    partName: "Урд амортизатор",
    description: "Баруун урд тал руугаа дуу ороод байна.",
    status: "rejected", // Батлагдаагүй
    isRead: true,
    createdAt: "2026-07-20 10:30",
  },
];

export default function AdminDashboard() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [statusFilter, setStatusFilter] = useState("all");
  const [readFilter, setReadFilter] = useState("all");

  const handleUpdateStatus = (id, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, status: newStatus, isRead: true } : order,
      ),
    );
  };

  const handleMarkAsRead = (id) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, isRead: true } : order,
      ),
    );
  };

  const getCount = (type, value) => {
    if (type === "status") {
      if (value === "all") return orders.length;
      return orders.filter((o) => o.status === value).length;
    }
    if (type === "read") {
      if (value === "read") return orders.filter((o) => o.isRead).length;
      if (value === "unread") return orders.filter((o) => !o.isRead).length;
    }
    return 0;
  };

  const filteredOrders = orders.filter((order) => {
    const matchStatus = statusFilter === "all" || order.status === statusFilter;
    const matchRead =
      readFilter === "all" ||
      (readFilter === "read" && order.isRead) ||
      (readFilter === "unread" && !order.isRead);
    return matchStatus && matchRead;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased p-4 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-5">
        {/* ХЭРЭГЛЭГЧИЙН ПРОФАЙЛ ЗУРАГ БҮХИЙ ТОЛГОЙ ХЭСЭГ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 bg-white border border-slate-200 rounded-xl shadow-xs gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-linear-to-tr from-amber-500 to-amber-600 text-white rounded-xl flex items-center justify-center font-bold text-base tracking-wider shadow-sm shrink-0 select-none">
              ADM
            </div>
            <div>
              <h2 className="font-bold text-lg sm:text-xl tracking-tight text-slate-900">
                Удирдлагын хэсэг
              </h2>
              <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500 mt-0.5">
                <span className="font-medium text-slate-700">
                  Ерөнхий Админ
                </span>
                <span className="text-slate-300">•</span>
                <span>Систем Хянагч</span>
              </div>
            </div>
          </div>
          <div className="flex items-center pt-2 sm:pt-0 border-t border-slate-100 sm:border-none">
            <span className="text-xs font-semibold px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg w-full text-center sm:w-auto">
              Нийт хүсэлт:{" "}
              <span className="text-slate-900 font-bold">{orders.length}</span>
            </span>
          </div>
        </div>

        {/* ШҮҮЛТҮҮРИЙН ХЭСЭГ (Бүгд, Шинэ, Батлагдсан, Батлагдаагүй, Уншсан, Unread) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
          {/* 1. Захиалгын төлөв шүүлтүүр */}
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

          {/* 2. Харагдсан эсэхээр шүүх */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Харагдац
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setReadFilter("all")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  readFilter === "all"
                    ? "bg-slate-100 border-slate-300 text-slate-800 font-bold"
                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                Бүх харагдац
              </button>

              <button
                type="button"
                onClick={() => setReadFilter("read")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
                  readFilter === "read"
                    ? "border-slate-400 bg-slate-50 text-slate-700 font-bold"
                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                Уншсан
                <span className="text-[10px] font-mono bg-slate-200/60 text-slate-600 px-1.5 py-0.2 rounded-md">
                  {getCount("read", "read")}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setReadFilter("unread")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
                  readFilter === "unread"
                    ? "border-amber-500 bg-amber-50 text-amber-700 font-bold"
                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                Уншаагүй
                <span className="text-[10px] font-mono bg-amber-100 text-amber-600 px-1.5 py-0.2 rounded-md">
                  {getCount("read", "unread")}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ХҮСЭЛТҮҮДИЙН ЖАГСААЛТ */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-slate-500">
              Илэрц: {filteredOrders.length} хүсэлт
            </span>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400 shadow-xs">
              Шүүлтүүрт тохирох захиалга олдсонгүй.
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isPending = order.status === "pending";
              const isApproved = order.status === "approved";
              const isRejected = order.status === "rejected";

              return (
                <div
                  key={order.id}
                  onClick={() => handleMarkAsRead(order.id)}
                  className={`bg-white border rounded-xl p-4 sm:p-5 shadow-xs space-y-4 transition-all relative cursor-pointer ${
                    !order.isRead
                      ? "border-amber-400 ring-1 ring-amber-50/50"
                      : "border-slate-200"
                  }`}
                >
                  {/* Уншаагүй үед харагдах жижиг цэг */}
                  {!order.isRead && (
                    <span className="absolute top-4 left-4 w-2 h-2 bg-amber-500 rounded-full" />
                  )}

                  <div
                    className={`flex justify-between items-start gap-4 ${!order.isRead ? "pl-4" : ""}`}
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                          {order.driverName}
                        </h3>
                        <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                          #{order.sapId}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-medium">
                        {order.carName} •{" "}
                        <span className="font-mono">{order.plate}</span>
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border shrink-0 ${
                        isApproved
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : isPending
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {isApproved
                        ? "Батлагдсан"
                        : isPending
                          ? "Шинэ"
                          : "Батлагдаагүй"}
                    </span>
                  </div>

                  <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-100 space-y-2">
                    <div className="text-xs font-bold text-slate-900">
                      Сэлбэг:{" "}
                      <span className="text-blue-600">{order.partName}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {order.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center gap-4 pt-2 border-t border-slate-100 flex-wrap">
                    <span className="text-[10px] font-mono text-slate-400">
                      Илгээсэн: {order.createdAt}
                    </span>

                    {isPending && (
                      <div className="flex gap-1.5 ml-auto w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(order.id, "rejected");
                          }}
                          className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold border border-rose-200 bg-rose-50/30 text-rose-600 rounded-lg hover:bg-rose-50 active:bg-rose-100 transition"
                        >
                          Цуцлах
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(order.id, "approved");
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
