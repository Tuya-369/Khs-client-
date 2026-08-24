"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";

const PARTNERS = [
  {
    id: "Bluefin-Catering",
    title: "Bluefin-Catering",
    description:
      "Оюу Толгой төслийн талбайд үйл ажиллагаа явуулдаг ба 500 гаруй чадварлаг хамт олноор багаа бүрдүүлэн өдөр бүр ойролцоогоор 15,000 орчим уурхайчдад эрүүл, амт чанартай, халуун хоолоор ханган ажилладаг.",
    logo: "https://res.cloudinary.com/hfroefns/image/upload/v1786354835/547afbda-79c6-481f-9a14-9937da2d2d02_fitg1z.png",
    url: "https://www.facebook.com/Bluefincatering",
  },
  {
    id: "we-are-miners",
    title: "We Are Miners",
    description:
      "Уурхайчдын өдөр тутмын хэрэгцээт бүтээгдэхүүн, хувцас, куртка, хамгаалах хэрэгсэл, Фосфортдог каскны бүснүүд мерчантарыг худалдаг.",
    logo: "https://res.cloudinary.com/hfroefns/image/upload/v1786350688/500763936_122134973504759573_7525755744609605248_n-removebg-preview_gjuj1r.png",
    url: "https://www.facebook.com/profile.php?id=61572787193323",
  },
  {
    id: "OYUT PIZZA UHG LLC",
    title: "Oyut Pizza",
    description:
      "Оюу Толгой төслийн талбайд үйл ажиллагаа явуулдаг ба уурхайчдад зориулсан амттай пицца, хоол хүргэдэг.",
    logo: "https://res.cloudinary.com/hfroefns/image/upload/v1786350937/528039625_1293939149185084_471515427446860816_n-removebg-preview_vv3tbb.png",
    url: "https://www.facebook.com/uhgllc",
  },
];

const SLIDE_DURATION = 9000;

export default function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const activePartner = PARTNERS[currentIndex];

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % PARTNERS.length);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? PARTNERS.length - 1 : prev - 1));
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(goToNext, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, [goToNext, isPaused]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrevious, goToNext]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const deltaX = touchStartX.current - touchEndX;

    if (deltaX > 40) goToNext();
    else if (deltaX < -40) goToPrevious();

    touchStartX.current = null;
  };

  return (
    <section className="w-full bg-slate-50/50 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div
        className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 pointer-events-none opacity-30 transition-colors duration-700 `bg-gradient-to-br` from-slate-50 via-white to-amber-50/30" />

        <div className="relative z-10 flex flex-col justify-between p-5 sm:p-10 lg:min-h-460px lg:p-12">
          <div className="my-4 grid grid-cols-1 items-center gap-6 sm:my-8 lg:grid-cols-12 lg:gap-8">
            <div className="order-1 flex items-center justify-center lg:order-2 lg:col-span-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePartner.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.4 }}
                  className="relative flex h-32 w-32 items-center justify-center sm:h-52 sm:w-52 lg:h-64 lg:w-64"
                >
                  <div className="relative h-full w-full">
                    <Image
                      src={activePartner.logo}
                      alt={`${activePartner.title} лого`}
                      fill
                      unoptimized
                      sizes="256px"
                      className="object-contain"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="order-2 flex flex-col items-center text-center lg:order-1 lg:col-span-7 lg:items-start lg:text-left">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePartner.id}
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -15 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-3 sm:space-y-4"
                >
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                    {activePartner.title}
                  </h2>

                  <p className="max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                    {activePartner.description}
                  </p>

                  <div className="pt-2 sm:pt-3">
                    <a
                      href={activePartner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-slate-700 px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95 sm:px-6 sm:py-3 sm:text-sm"
                    >
                      <span>Дэлгэрэнгүй</span>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 border-t border-slate-100 pt-4 text-center sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pt-6 sm:text-left">
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-medium text-slate-500 sm:text-xs">
                Та өөрийн цуглуулсан{" "}
                <span className="font-semibold text-slate-800">KHS Token</span>
                -оор эдгээр байгууллагуудад худалдан авалт хийх боломжтой.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevious}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 sm:h-10 sm:w-10"
                aria-label="Өмнөх"
              >
                ❮
              </button>
              <button
                onClick={goToNext}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 sm:h-10 sm:w-10"
                aria-label="Дараах"
              >
                ❯
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
