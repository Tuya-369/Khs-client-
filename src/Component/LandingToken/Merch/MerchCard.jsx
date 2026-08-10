"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";

let merchItemsCache = null;
let merchItemsRequest = null;

const getItemCategory = (item) => {
  const apiCategory = String(item.category || "")
    .toLowerCase()
    .trim();

  if (["giftcard", "gift-card", "gift_card"].includes(apiCategory)) {
    return "giftcard";
  }

  if (apiCategory === "merch") {
    return "merch";
  }

  const itemText =
    `${item.title || ""} ${item.description || ""} ${item.longDescription || ""}`.toLowerCase();

  return /gift\s*card|бэлгийн карт|эрхийн бичиг|ваучер|талон/.test(itemText)
    ? "giftcard"
    : "merch";
};

const loadMerchItems = async () => {
  if (merchItemsCache) {
    return merchItemsCache;
  }

  if (!merchItemsRequest) {
    merchItemsRequest = api
      .getMerchItems()
      .then((response) => {
        merchItemsCache = Array.isArray(response?.data) ? response.data : [];
        return merchItemsCache;
      })
      .finally(() => {
        merchItemsRequest = null;
      });
  }

  return merchItemsRequest;
};

export default function MerchCard({
  hideTopTexts = false,
  excludeItemId,
  embedded = false,
  itemLimit,
}) {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("all");
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    const loadItems = async () => {
      try {
        const merchItems = await loadMerchItems();
        if (!isMounted) return;
        setItems(merchItems);
      } catch {
        if (!isMounted) return;
        setItems([]);
      }
    };

    loadItems();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleItems = useMemo(() => {
    const filteredItems = items.filter((item) => {
      if (item.id === excludeItemId) return false;

      return category === "all" || getItemCategory(item) === category;
    });

    return Number.isFinite(itemLimit)
      ? filteredItems.slice(0, itemLimit)
      : filteredItems;
  }, [items, category, excludeItemId, itemLimit]);

  const sectionClassName = embedded
    ? "w-full px-0 py-0 text-neutral-800"
    : "relative w-full overflow-hidden bg-linear-to-b from-white via-orange-50/40 to-white px-4 py-12 text-neutral-800 sm:px-8 md:px-12 md:py-24";

  const headerContainerClassName = embedded
    ? "mx-auto mb-6 flex w-full max-w-6xl items-end justify-between px-1"
    : "relative z-10 mx-auto mb-6 flex w-full max-w-6xl items-end justify-between px-1";

  const gridClassName = embedded
    ? "mx-auto mt-6 grid w-full max-w-6xl grid-cols-2 gap-5 px-1 md:grid-cols-3"
    : "relative z-10 mx-auto mt-6 grid w-full max-w-6xl grid-cols-2 gap-4 px-1 md:grid-cols-3 lg:grid-cols-4";

  return (
    <section className={sectionClassName}>
      {!embedded && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      )}

      <div className={headerContainerClassName}>
        <div>
          {!hideTopTexts && (
            <p className="text-xs uppercase tracking-[0.25em] text-amber-600 font-medium">
              Merch Store
            </p>
          )}
        </div>
        <div
          className="flex items-center gap-4"
          aria-label="Бүтээгдэхүүний ангилал"
        >
          {[
            ["all", "Бүгд"],
            ["merch", "Merch"],
            ["giftcard", "Gift card"],
          ].map(([value, label]) => {
            const isActive = category === value;
            const className = `border-b-2 px-0.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
              isActive
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-400 hover:text-neutral-900"
            }`;

            if (value === "all" && pathname !== "/merch") {
              return (
                <Link key={value} href="/merch" className={className}>
                  {label}
                </Link>
              );
            }

            return (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                className={className}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* kart*/}
      <div className={gridClassName}>
        {visibleItems.map((item) => (
          <Link
            key={item.id}
            href={`/merch/${item.id}`}
            className="group relative flex flex-col justify-between rounded-2xl bg-white overflow-hidden transition-all duration-300 cursor-pointer ring-1 ring-neutral-100 hover:ring-2 hover:ring-amber-300 hover:shadow-[0_10px_30px_rgba(217,119,6,0.12)]"
          >
            <div className="flex flex-col h-full min-w-0">
              {" "}
              <div className="aspect-square w-full bg-white p-3 overflow-hidden relative flex items-center justify-center">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  width={320}
                  height={320}
                  sizes="(max-width: 768px) 45vw, (max-width: 1024px) 30vw, 260px"
                  unoptimized
                  className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-3 md:p-4 flex flex-1 flex-col min-w-0">
                <h4 className="text-sm font-semibold text-neutral-900 group-hover:text-amber-300 transition-colors line-clamp-2 min-h-10 leading-tight">
                  {item.title}
                </h4>

                <p className="mt-1 text-xs text-neutral-500 line-clamp-2 min-h-8">
                  {item.description}
                </p>

                <div className="mt-auto pt-3 flex flex-nowrap items-center gap-1.5 text-[11px] text-neutral-500 w-full overflow-hidden">
                  <span className="bg-neutral-100 px-2 py-0.5 rounded-sm whitespace-nowrap shrink-0">
                    {Array.isArray(item.sizes) && item.sizes.length > 0
                      ? item.sizes.join(", ")
                      : "Free size"}
                  </span>
                  <span className="bg-neutral-100 px-2 py-0.5 rounded-sm whitespace-nowrap truncate min-w-0">
                    {Array.isArray(item.colors) && item.colors.length > 0
                      ? item.colors.join(" / ")
                      : "-"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 md:p-4 pt-0">
              <div className="flex items-baseline justify-between border-t border-neutral-100 pt-3">
                <span className="text-[11px] text-neutral-400 font-medium">
                  Үнэ
                </span>
                <span className="text-base font-bold text-neutral-900">
                  {typeof item.price === "number"
                    ? `${item.price.toLocaleString("mn-MN")}₮`
                    : "-"}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
