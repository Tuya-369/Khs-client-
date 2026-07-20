"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { merchItems } from "@/Component/LandingToken/Merch/merchItems";

const MOCK_MERCH_ORDERS = [
  {
    id: "M-2401",
    merchId: 2,
    employee: "Б. Саран",
    sap: "202699",
    department: "Борлуулалтын баг",
    item: "Token Hoodie / XL",
    qty: 1,
    orderedAt: "2026-07-18 09:12",
    confirmed: false,
    read: false,
  },
  {
    id: "M-2402",
    merchId: 1,
    employee: "Э. Төгс",
    sap: "203011",
    department: "Ложистик",
    item: "Token Cap / Black",
    qty: 2,
    orderedAt: "2026-07-17 14:41",
    confirmed: true,
    read: true,
  },
  {
    id: "M-2403",
    merchId: 1,
    employee: "Г. Одхүү",
    sap: "203145",
    department: "Санхүү",
    item: "Token T-shirt / M",
    qty: 3,
    orderedAt: "2026-07-19 08:22",
    confirmed: false,
    read: true,
  },
  {
    id: "M-2404",
    merchId: 3,
    employee: "Н. Энхмаа",
    sap: "203208",
    department: "Хүний нөөц",
    item: "Token Mug",
    qty: 4,
    orderedAt: "2026-07-20 09:05",
    confirmed: true,
    read: false,
  },
];

const FILTERS = [
  { key: "all", label: "Бүгд" },
  { key: "new", label: "Шинэ" },
  { key: "old", label: "Хуучин" },
];

const PROFILE = {
  badge: "Түв",
  name: "Түвшинболор",
  role: "Худалдан авалтын менежер",
  sap: "202699",
};

export default function TokenDashboard() {
  const orders = MOCK_MERCH_ORDERS;
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "new") return !order.read && !order.confirmed;
      if (activeFilter === "old") return order.read || order.confirmed;
      if (activeFilter === "approve") return !order.confirmed;
      if (activeFilter === "confirmed") return order.confirmed;
      if (activeFilter === "unread") return !order.read;
      return true;
    });
  }, [activeFilter]);

  const getOrderImage = (order) => {
    const matchedMerch = merchItems.find((item) => item.id === order.merchId);
    return matchedMerch?.imageUrl || null;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 font-sans p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between p-6 bg-white border border-gray-200/60 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-linear-to-tr from-slate-700 to-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
              {PROFILE.badge}
            </div>
            <div>
              <h2 className="font-semibold text-xl tracking-tight text-gray-900">
                Token Dashboard
              </h2>
              <p className="text-xs font-medium text-gray-500 mt-0.5">
                {PROFILE.name} • {PROFILE.role}
              </p>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                SAP ID: {PROFILE.sap}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-mono">
              Нийт: {orders.length}
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-200/60 rounded-2xl shadow-sm p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-gray-200 pb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-950 tracking-tight">
                Захиалгын хяналтын хэсэг
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md">
              Нийт: {filteredOrders.length}
            </span>
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
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
                      {getOrderImage(order) ? (
                        <Image
                          src={getOrderImage(order)}
                          alt={order.item}
                          fill
                          sizes="64px"
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
                        {order.item}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {order.employee} • SAP {order.sap} • {order.department}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600">
                    Захиалсан:{" "}
                    <span className="font-semibold">{order.orderedAt}</span>
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600">
                    Тоо: <span className="font-semibold">{order.qty}ш</span>
                  </div>
                </div>
              </div>
            ))}

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
