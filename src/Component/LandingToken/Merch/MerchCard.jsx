"use client";
import Link from "next/link";
import Image from "next/image";
import { merchItems } from "@/Component/LandingToken/Merch/merchItems";

export default function MerchCard() {
  return (
    <section className="relative w-full overflow-hidden bg-linear-to-b from-white via-orange-50/40 to-white px-4 py-12 text-neutral-800 sm:px-8 md:px-12 md:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/*header textt */}
      <div className="relative z-10 mx-auto w-full max-w-6xl mb-6 px-1 flex justify-between items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-amber-600 font-medium">
            Merch Store
          </p>
          <h3 className="text-xl font-bold tracking-tight text-neutral-900 md:text-2xl mt-1">
            Брэндийн бүтээгдэхүүнүүд
          </h3>
        </div>
        <span className="text-sm font-medium text-neutral-500 cursor-pointer hover:text-neutral-800 transition-colors">
          Бүгдийг үзэх &rarr;
        </span>
      </div>

      {/* kart*/}
      <div className="relative z-10 mx-auto mt-6 grid w-full max-w-6xl grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 px-1">
        {merchItems.map((item) => (
          <Link
            key={item.id}
            href={`/merch/${item.id}`}
            className="group relative flex flex-col justify-between rounded-2xl bg-white overflow-hidden transition-all duration-300 cursor-pointer ring-1 ring-neutral-100 hover:ring-2 hover:ring-amber-400 hover:shadow-[0_10px_30px_rgba(217,119,6,0.12)]"
          >
            <div className="flex flex-col h-full">
              {/* img*/}

              <div className="aspect-square w-full bg-white p-3 overflow-hidden relative flex items-center justify-center">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  width={320}
                  height={320}
                  sizes="(max-width: 768px) 45vw, (max-width: 1024px) 30vw, 260px"
                  className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* info section */}
              <div className="p-3 md:p-4 flex flex-1 flex-col">
                <h4 className="text-sm font-semibold text-neutral-900 group-hover:text-amber-600 transition-colors line-clamp-2 min-h-10 leading-tight">
                  {item.title}
                </h4>

                <p className="mt-1 text-xs text-neutral-500 line-clamp-2 min-h-8">
                  {item.description}
                </p>

                {/* Хэмжээ болон Өнгө */}
                <div className="mt-auto pt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-500">
                  <span className="bg-neutral-100 px-2 py-0.5 rounded-sm">
                    {item.size}
                  </span>
                  <span className="bg-neutral-100 px-2 py-0.5 rounded-sm">
                    {item.color}
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
                  {item.cost}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
