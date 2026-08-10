"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Cloudinary болон гадны URL-уудыг энд шууд байршуулна
const SLIDES = [
  {
    id: 1,
    image:
      "https://res.cloudinary.com/hfroefns/image/upload/v1786070347/bluefin_t61cw2.png",
    title: "Bluefin",
  },
  {
    id: 2,
    image:
      "https://res.cloudinary.com/hfroefns/image/upload/v1786070347/oyut_brhpie.jpg",
    title: "oyut",
  },
  {
    id: 3,
    image:
      "https://res.cloudinary.com/hfroefns/image/upload/v1786070346/we_are_miners_mmlj8t.jpg",
    title: "Miners",
  },
];

export default function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  // 5 секунд тутамд автоматаар солигдох
  useEffect(() => {
    const timer = setInterval(() => {
      goToNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [goToNext]);

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

  const currentSlide = SLIDES[currentIndex];

  return (
    <section className="relative w-full overflow-hidden">
      <div
        className="group relative mx-auto h-112 w-full max-w-6xl overflow-hidden rounded-2xl sm:h-128 md:h-144 md:rounded-3xl"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-full w-full"
          >
            <Image
              src={currentSlide.image}
              alt={currentSlide.title}
              fill
              unoptimized
              sizes="(max-width: fi) 100vw, (max-width: 1024px) 92vw, 1200px"
              className="select-none object-cover"
              priority={currentIndex === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Доод талын цэгүүд (Pagination dots) */}
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
                    : "w-2 bg-white/60 group-hover:bg-white"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Мобайл сумнууд */}
        <button
          onClick={goToPrevious}
          className="absolute bottom-3 left-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all duration-200 hover:bg-white hover:text-black md:hidden"
          aria-label="Previous slide mobile"
        >
          ❮
        </button>

        <button
          onClick={goToNext}
          className="absolute bottom-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all duration-200 hover:bg-white hover:text-black md:hidden"
          aria-label="Next slide mobile"
        >
          ❯
        </button>

        {/* Десктоп сумнууд */}
        <button
          onClick={goToPrevious}
          className="absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md transition-all duration-200 hover:bg-white hover:text-black group-hover:opacity-100 md:flex md:opacity-70"
          aria-label="Previous slide"
        >
          ❮
        </button>

        <button
          onClick={goToNext}
          className="absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md transition-all duration-200 hover:bg-white hover:text-black group-hover:opacity-100 md:flex md:opacity-70"
          aria-label="Next slide"
        >
          ❯
        </button>
      </div>
    </section>
  );
}
