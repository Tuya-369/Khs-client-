"use client";

import { useState } from "react";
import Image from "next/image";
import MerchCard from "./MerchCard";
import { useCart } from "@/context/CartContext";
import { ApiError, api } from "@/lib/api";
import { getAccessToken } from "@/lib/session";

export default function MerchAbout({ item, onOrder }) {
  const { addToCart } = useCart();

  const sizeOptions = Array.isArray(item?.sizes)
    ? item.sizes
    : item?.size
      ? [item.size]
      : [];

  const colorOptions = Array.isArray(item?.colors)
    ? item.colors
    : item?.color
      ? [item.color]
      : [];

  const [selectedSize, setSelectedSize] = useState(sizeOptions[0] || "");
  const [selectedColor, setSelectedColor] = useState(colorOptions[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");

  if (!item) return null;

  const decreaseQty = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const increaseQty = () => {
    setQuantity((prev) => Math.min(20, prev + 1));
  };

  const handleOrder = async () => {
    const orderData = {
      id: item.id,
      title: item.title,
      size: selectedSize,
      color: selectedColor,
      quantity,
    };

    if (onOrder) {
      onOrder(orderData);
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setOrderMessage("Захиалга хийхийн тулд эхлээд нэвтэрнэ үү.");
      return;
    }

    setIsOrdering(true);
    setOrderMessage("");

    try {
      await api.createMerchOrder(token, {
        merchItemId: item.id,
        size: selectedSize,
        color: selectedColor,
        qty: quantity,
      });
      setOrderMessage("Захиалга амжилттай илгээгдлээ.");
    } catch (error) {
      setOrderMessage(
        error instanceof ApiError
          ? error.message
          : "Захиалга илгээх үед алдаа гарлаа.",
      );
    } finally {
      setIsOrdering(false);
    }
  };

  const handleAddToCart = () => {
    addToCart({
      id: item.id,
      title: item.title,
      imageUrl: item.imageUrl,
      size: selectedSize,
      color: selectedColor,
      price: item.price,
    });
  };

  return (
    <>
      <section className="mx-auto mt-4 w-full max-w-4xl bg-white p-4 sm:p-6 md:p-10">
        <div className="flex flex-col gap-6 sm:gap-8 md:flex-row md:items-start md:gap-10">
          <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl bg-[#F8F9FA] p-5 sm:w-72 sm:p-6 md:w-96 md:p-8">
            <Image
              src={item.imageUrl}
              alt={item.title}
              width={450}
              height={450}
              sizes="(max-width: 768px) 100vw, 384px"
              unoptimized
              className="h-full w-full object-contain mix-blend-multiply transition-transform duration-700 hover:scale-103"
            />
          </div>

          <div className="flex-1 space-y-5 sm:space-y-6 md:space-y-8">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl md:text-3xl">
                {item.title}
              </h1>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500 sm:mt-3 sm:text-sm font-normal antialiased">
                {item.longDescription}
              </p>
            </div>

            <div className="space-y-3 border-t border-neutral-100 pt-4 sm:space-y-5 sm:pt-6">
              <div className="flex items-center gap-3 py-1 sm:gap-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 w-20 shrink-0">
                  Хэмжээ:
                </span>
                <div className="flex flex-wrap gap-2 items-center">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-12 rounded-full border py-1.5 px-3 text-xs font-medium transition-all duration-300 ${
                        selectedSize === size
                          ? "border-black bg-black text-white shadow-sm"
                          : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 py-1 sm:gap-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 w-20 shrink-0">
                  Өнгө:
                </span>
                <div className="flex flex-wrap gap-2 items-center">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-300 ${
                        selectedColor === color
                          ? "border-black bg-black text-white shadow-sm"
                          : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 py-1 sm:gap-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 w-20 shrink-0">
                  Тоо:
                </span>
                <div className="flex items-center rounded-full border border-neutral-200 bg-white overflow-hidden p-0.5">
                  <button
                    type="button"
                    onClick={decreaseQty}
                    className="h-7 w-7 rounded-full text-xs text-neutral-500 transition-colors hover:bg-neutral-50"
                    aria-label="Тоо цөөрүүлэх"
                  >
                    —
                  </button>
                  <span className="min-w-8 text-center text-xs font-medium text-neutral-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={increaseQty}
                    className="h-7 w-7 rounded-full text-xs text-neutral-500 transition-colors hover:bg-neutral-50"
                    aria-label="Тоо нэмэх"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 sm:gap-3 sm:pt-4">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 h-10 rounded-full border border-neutral-200 bg-white text-xs font-medium text-neutral-800 transition-all duration-300 hover:bg-neutral-50 hover:border-neutral-300 active:scale-[0.99] cursor-pointer sm:h-12 sm:text-sm"
                aria-label="Cart"
              >
                Сагсанд хийх
              </button>
              <button
                type="button"
                onClick={handleOrder}
                disabled={isOrdering}
                className="flex-1 h-10 rounded-full bg-neutral-950 text-xs font-medium text-white transition-all duration-300 hover:bg-neutral-800 active:scale-[0.99] cursor-pointer shadow-sm disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:text-sm"
              >
                {isOrdering ? "Илгээж байна..." : `Захиалах (${quantity})`}
              </button>
            </div>
            {orderMessage && (
              <p className="text-sm text-neutral-600">{orderMessage}</p>
            )}
          </div>
        </div>
      </section>

      <div className="mt-10 w-full">
        <MerchCard
          sectionTitle="Бусад merch"
          hideTopTexts={true}
          excludeItemId={item.id}
          embedded={true}
        />
      </div>
    </>
  );
}
