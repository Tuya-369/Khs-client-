"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
const SLIDES = [
  {
    id: 1,
    image:
      "https://res.cloudinary.com/hfroefns/image/upload/v1782977695/Screenshot_2026-07-02_153432_zfclpa.png",
    title: "",
    subtitle: "",
  },
  {
    id: 2,
    image:
      "https://res.cloudinary.com/hfroefns/image/upload/v1782977695/Screenshot_2026-07-02_153432_zfclpa.png",
    title: "",
    subtitle: "",
  },
  {
    id: 3,
    image:
      "https://res.cloudinary.com/hfroefns/image/upload/v1782977695/Screenshot_2026-07-02_153432_zfclpa.png",
    title: "",
    subtitle: "",
  },
];

export default function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      goToNext();
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  const handleTouchStart = (event) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event) => {
    if (touchStartX === null) return;

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
    const deltaX = touchStartX - touchEndX;
    const swipeThreshold = 40;

    if (deltaX > swipeThreshold) {
      goToNext();
    } else if (deltaX < -swipeThreshold) {
      goToPrevious();
    }

    setTouchStartX(null);
  };

  return (
    <section className="relative w-full overflow-hidden px-3 py-4 sm:px-6 sm:py-6 md:px-10 md:py-8">
      <div
        className="group relative mx-auto h-112 w-full max-w-6xl overflow-hidden rounded-2xl sm:h-128 md:h-144 md:rounded-3xl"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex h-full w-full items-end"
          >
            <Image
              src={SLIDES[currentIndex].image}
              alt={SLIDES[currentIndex].title || "Merch banner"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, 1200px"
              className="absolute inset-0 h-full w-full select-none object-cover"
              priority={currentIndex === 0}
            />

            <div className="absolute inset-0 bg-linear-to-t from-neutral-900/85 via-neutral-900/45 to-transparent md:bg-linear-to-r md:from-neutral-900/75 md:via-neutral-900/35 md:to-transparent" />

            <div className="relative z-10 w-full max-w-2xl px-4 pb-14 pt-10 text-white sm:px-6 sm:pb-16 md:px-10 md:pb-20 lg:px-14">
              <motion.h1
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-2xl font-black leading-tight tracking-tight sm:text-3xl md:text-4xl lg:text-5xl"
              >
                {SLIDES[currentIndex].title}
              </motion.h1>
              <motion.p
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-2 max-w-xl text-sm font-light text-neutral-200 sm:text-base md:text-lg"
              >
                {SLIDES[currentIndex].subtitle}
              </motion.p>

              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-4 space-y-3"
              >
                <button className="rounded-xl bg-linear-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:scale-105 active:scale-95 sm:px-6 sm:py-3">
                  Дэлгэрэнгүй үзэх
                </button>
                <p className="max-w-sm text-xs leading-relaxed text-neutral-100 sm:text-sm">
                  Оюут хоолны газраас <br /> KHS-токенаар амтат хоол худалдан
                  авах боломжтой.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-6">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className="group relative p-1 focus:outline-hidden"
              aria-label={`Slide ${index + 1}`}
            >
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-orange-500"
                    : "w-2 bg-white/55 group-hover:bg-white"
                }`}
              />
            </button>
          ))}
        </div>

        <button
          onClick={goToPrevious}
          className="absolute bottom-3 left-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/20 text-white backdrop-blur-sm transition-all duration-200 hover:bg-white hover:text-neutral-900 md:bottom-auto md:left-3 md:top-1/2 md:hidden md:-translate-y-1/2"
          aria-label="Previous slide mobile"
        >
          ❮
        </button>

        <button
          onClick={goToNext}
          className="absolute bottom-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/20 text-white backdrop-blur-sm transition-all duration-200 hover:bg-white hover:text-neutral-900 md:bottom-auto md:right-3 md:top-1/2 md:hidden md:-translate-y-1/2"
          aria-label="Next slide mobile"
        >
          ❯
        </button>

        <button
          onClick={goToPrevious}
          className="absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-200 hover:bg-white hover:text-neutral-900 group-hover:opacity-100 md:flex md:opacity-70"
          aria-label="Previous slide"
        >
          ❮
        </button>
        <button
          onClick={goToNext}
          className="absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-200 hover:bg-white hover:text-neutral-900 group-hover:opacity-100 md:flex md:opacity-70"
          aria-label="Next slide"
        >
          ❯
        </button>
      </div>
    </section>
  );
}
