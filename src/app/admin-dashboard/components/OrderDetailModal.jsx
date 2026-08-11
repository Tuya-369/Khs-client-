"use client";

import Image from "next/image";
import { X } from "lucide-react";

export default function OrderDetailModal({
  selectedOrder,
  detailLoading,
  onClose,
  formatDate,
  getUploadedImageUrl,
}) {
  if (!selectedOrder && !detailLoading) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/40 p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white sm:rounded-lg shadow-xl">
        {detailLoading ? (
          <div className="p-8 text-sm text-slate-500">
            Дэлгэрэнгүй мэдээлэл ачаалж байна...
          </div>
        ) : (
          <>
            <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Хүсэлтийн дэлгэрэнгүй
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {selectedOrder?.driver?.lastName}{" "}
                  {selectedOrder?.driver?.firstName} ·{" "}
                  {formatDate(selectedOrder?.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Хаах"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-5 p-5">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800">
                {selectedOrder?.vehicle?.name} · {selectedOrder?.vehicle?.plate}
              </div>
              <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Сонгосон сэлбэгүүд
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedOrder?.requestParts?.map((item) => (
                    <span
                      key={item.partId}
                      className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800"
                    >
                      {item.part?.name}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Тайлбар
                </h3>
                <p className="rounded-md border border-slate-200 p-3 text-sm leading-6 text-slate-700">
                  {selectedOrder?.description}
                </p>
              </div>
              {selectedOrder?.images?.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Эвдрэлийн зургууд
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {selectedOrder.images.map((image) => {
                      const imageUrl = getUploadedImageUrl(image.url);

                      return (
                        <a
                          key={image.id}
                          href={imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="relative aspect-square overflow-hidden rounded-md border border-slate-200"
                        >
                          <Image
                            src={imageUrl}
                            alt="Эвдрэлийн зураг"
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
