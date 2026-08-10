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
      "Оюу Толгой төслийн талбайд үйл ажиллагаа явуулдаг ба уурхайчдад зориулсан амттай пицца, хоол, ундааг хүргэдэг.",
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

  // Автомат слайд ажиллах хэсэг
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(goToNext, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, [goToNext, isPaused]);

  // Гарны сумаар шилжүүлэх
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrevious, goToNext]);

  // Свайп хийх Touch сенсор
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
    <section className="w-full bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div
        className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Арын дэвсгэрийн зөөлөн өнгөний уусах тусгал */}
        <div className="absolute inset-0 pointer-events-none opacity-30 transition-colors duration-700 `bg-gradient-to-br` from-slate-50 via-white to-amber-50/30" />

        <div className="relative z-10 min-h-500px sm:min-h-460px flex flex-col justify-between p-6 sm:p-10 lg:p-12">
          <div className="my-8 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            {/* Текст болон товчлуур */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePartner.id}
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -15 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                >
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
                    {activePartner.title}
                  </h2>

                  <p className="max-w-xl text-base leading-relaxed text-slate-600">
                    {activePartner.description}
                  </p>

                  <div className="pt-3">
                    {/* Сошиал/Веб хуудас руу үсрэх товч */}
                    <a
                      href={activePartner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-slate-700 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95"
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

            {/* Лого зураг */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePartner.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.4 }}
                  className="relative flex h-52 w-52 sm:h-64 sm:w-64 items-center justify-center"
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
          </div>

          {/* Доод хэсэг: Гарчиг + Таб/Индикатор болон Сумнууд */}
          <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            {/* Баруун/Зүүн шилжих табын хэсэг */}
            <div className="flex flex-col gap-2">
              {/* Жижиг санамж гарчиг */}
              <p className="text-xs font-medium text-slate-500">
                Та өөрийн цуглуулсан{" "}
                <span className="font-semibold text-slate-800">KHS Token</span>
                -оор эдгээр байгууллагуудад худалдан авалт хийх боломжтой.
              </p>
            </div>

            {/* Баруун/Зүүн сумнууд */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={goToPrevious}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
                aria-label="Өмнөх"
              >
                ❮
              </button>
              <button
                onClick={goToNext}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
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
