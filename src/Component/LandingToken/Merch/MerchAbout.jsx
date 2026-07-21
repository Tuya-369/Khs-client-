"use client";

import { useState } from "react";
import Image from "next/image";
import MerchCard from "./MerchCard";
import { useCart } from "@/context/CartContext";

export default function MerchAbout({ item, onOrder }) {
  if (!item) return null;
  const { addToCart } = useCart();

  const sizeOptions = Array.isArray(item.sizes)
    ? item.sizes
    : item.size
      ? [item.size]
      : ["M", "L", "XL"];

  const colorOptions = Array.isArray(item.colors)
    ? item.colors
    : item.color
      ? [item.color]
      : ["Cream", "Charcoal"];

  const [selectedSize, setSelectedSize] = useState(sizeOptions[0] || "");
  const [selectedColor, setSelectedColor] = useState(colorOptions[0] || "");
  const [quantity, setQuantity] = useState(1);

  const decreaseQty = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const increaseQty = () => {
    setQuantity((prev) => Math.min(20, prev + 1));
  };

  const handleOrder = () => {
    const orderData = {
      id: item.id,
      title: item.title,
      size: selectedSize,
      color: selectedColor,
      quantity,
    };

    if (onOrder) {
      onOrder(orderData);
    } else {
      alert(
        `Захиалга: ${item.title} \nХэмжээ: ${selectedSize} \nӨнгө: ${selectedColor} \nТоо: ${quantity}`,
      );
    }
  };

  const handleAddToCart = () => {
    addToCart({
      id: item.id,
      title: item.title,
      imageUrl: item.imageUrl,
      size: selectedSize,
      color: selectedColor,
      price: 59000,
    });
  };

  return (
    <>
      <section className="mx-auto mt-4 w-full max-w-4xl bg-white p-6 md:p-10">
        <div className="flex flex-col gap-10 md:flex-row md:items-start">
          <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-3xl bg-[#F8F9FA] p-8 sm:w-72 md:w-96">
            <Image
              src={item.imageUrl}
              alt={item.title}
              width={450}
              height={450}
              sizes="(max-width: 768px) 100vw, 384px"
              className="h-full w-full object-contain mix-blend-multiply transition-transform duration-700 hover:scale-103"
            />
          </div>

          <div className="flex-1 space-y-8">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 md:text-3xl">
                {item.title}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-neutral-500 font-normal antialiased">
                {item.longDescription}
              </p>
            </div>

            <div className="space-y-5 border-t border-neutral-100 pt-6">
              <div className="flex items-center gap-4 py-1">
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

              <div className="flex items-center gap-4 py-1">
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

              <div className="flex items-center gap-4 py-1">
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

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 h-12 rounded-full border border-neutral-200 bg-white text-sm font-medium text-neutral-800 transition-all duration-300 hover:bg-neutral-50 hover:border-neutral-300 active:scale-[0.99] cursor-pointer"
                aria-label="Cart"
              >
                Сагсанд хийх
              </button>
              <button
                type="button"
                onClick={handleOrder}
                className="flex-1 h-12 rounded-full bg-neutral-950 text-sm font-medium text-white transition-all duration-300 hover:bg-neutral-800 active:scale-[0.99] cursor-pointer shadow-sm"
              >
                Захиалах ({quantity})
              </button>
            </div>
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
