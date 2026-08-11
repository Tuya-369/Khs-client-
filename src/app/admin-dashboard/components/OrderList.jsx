"use client";

import OrderCard from "./OrderCard";

export default function OrderList({
  orders,
  onOpen,
  onUpdateStatus,
  updatingOrderId,
  formatDate,
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-bold text-blue-500">
          {orders.length} хүсэлт
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400 shadow-xs">
          Шүүлтүүрт тохирох захиалга олдсонгүй.
        </div>
      ) : (
        orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onOpen={onOpen}
            onUpdateStatus={onUpdateStatus}
            updatingOrderId={updatingOrderId}
            formatDate={formatDate}
          />
        ))
      )}
    </div>
  );
}
