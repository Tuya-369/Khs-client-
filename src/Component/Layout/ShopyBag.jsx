"use client";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

const formatPrice = (value) => `${value.toLocaleString("en-US")}₮`;

export default function ShopyBag({ isOpen, onClose }) {
  const { cartItems, totalItems, totalAmount, removeFromCart } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close cart backdrop"
        className="fixed inset-0 z-40 bg-neutral-950/40 backdrop-blur-[2px]"
      />

      <aside className="fixed right-0 top-0 z-50 h-screen w-full max-w-sm border-l border-neutral-200 bg-white shadow-2xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div>
              <h3 className="mt-1 text-lg font-bold text-neutral-900">
                Миний сагс ({totalItems})
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-neutral-300 p-2 text-neutral-700 transition-colors hover:bg-neutral-100"
              aria-label="Close cart"
            >
              <X size={18} />
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <ShoppingBag size={36} className="text-neutral-300" />
              <p className="mt-3 text-sm font-medium text-neutral-700">
                Сагс хоосон байна
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Бараа нэмээд эндээс хянах боломжтой.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-3">
                {cartItems.map((item, index) => (
                  <div
                    key={`${item.id}-${item.size}-${item.color}-${index}`}
                    className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-2"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-neutral-100 bg-white p-1">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        width={64}
                        height={64}
                        sizes="64px"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-neutral-900">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        Тоо: {item.qty}
                      </p>
                      {(item.size || item.color) && (
                        <p className="mt-0.5 text-[11px] text-neutral-500">
                          {item.size ? `Size: ${item.size}` : ""}
                          {item.size && item.color ? " • " : ""}
                          {item.color ? `Color: ${item.color}` : ""}
                        </p>
                      )}
                      <p className="mt-1 text-xs font-semibold text-neutral-800">
                        {formatPrice(item.price * item.qty)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(index)}
                      className="rounded-lg border border-neutral-300 p-2 text-neutral-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                      aria-label={`${item.title} устгах`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-neutral-200 bg-white px-5 py-4">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-neutral-500">Нийт</span>
              <span className="font-bold text-neutral-900">
                {formatPrice(totalAmount)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/"
                onClick={onClose}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-center text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-100"
              >
                Ы
              </Link>
              <button
                type="button"
                className="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-500 hover:text-neutral-900"
              >
                захиалах
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
