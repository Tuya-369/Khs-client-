"use client";

export default function OrderCard({
  order,
  onOpen,
  onUpdateStatus,
  updatingOrderId,
  formatDate,
}) {
  const isApproved = order.status === "APPROVED";
  const isPendingNow = order.status === "PENDING";

  return (
    <div
      onClick={() => onOpen(order.id)}
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
            <span className="font-mono">{order.vehicle?.plate}</span>
          </p>
        </div>

        {isPendingNow ? (
          <div className="flex shrink-0 gap-1.5">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onUpdateStatus(order.id, "APPROVED");
              }}
              disabled={updatingOrderId === order.id}
              className="rounded-md bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updatingOrderId === order.id ? "Шинэчилж байна..." : "Баталсан"}
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onUpdateStatus(order.id, "REJECTED");
              }}
              disabled={updatingOrderId === order.id}
              className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Батлаагүй
            </button>
          </div>
        ) : (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border shrink-0 ${
              isApproved
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            {isApproved ? "Баталсан" : "Батлаагүй"}
          </span>
        )}
      </div>

      <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-100 space-y-2">
        <div className="text-xs font-bold text-slate-900">
          Сэлбэг:{" "}
          <span className="text-blue-600">
            {order.requestParts
              ?.map((item) => item.part?.name)
              .filter(Boolean)
              .join(", ") ||
              order.part?.name ||
              "Ерөнхий"}
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
      </div>
    </div>
  );
}
