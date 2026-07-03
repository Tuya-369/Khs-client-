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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % SLIDES.length);
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-115 md:h-130 overflow-hidden px-4 pt-6 pb-2 sm:px-8 md:px-12">
      <div className="relative w-full h-full max-w-6xl mx-auto ">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full h-full flex items-center"
          >
            <Image
              src={SLIDES[currentIndex].image}
              alt={SLIDES[currentIndex].title || "Merch banner"}
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className="absolute inset-0 h-full w-full select-none object-cover"
              priority={currentIndex === 0}
            />

            <div className="absolute inset-0 bg-linear-to-r from-neutral-900/70 via-neutral-900/40 to-transparent" />

            <div className="relative z-10 w-full max-w-xl pl-8 pr-4 pt-70 sm:pl-12 md:pl-16 text-white space-y-4">
              <motion.h1
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight"
              >
                {SLIDES[currentIndex].title}
              </motion.h1>
              <motion.p
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-sm sm:text-base md:text-lg text-neutral-200 font-light"
              >
                {SLIDES[currentIndex].subtitle}
              </motion.p>

              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="pt-2"
              >
                <button className="bg-linear-to-r from-amber-500 to-orange-500 text-white font-medium text-sm px-6 py-3 rounded-xl shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all duration-200">
                  Дэлгэрэнгүй үзэх
                </button>
                <p>
                  Оюут хоолны газраас <br /> KHS-токенаар амтат хоол худалдан
                  авах боломжтой.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className="group relative p-1 focus:outline-hidden"
            >
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-orange-500"
                    : "w-2 bg-white/50 group-hover:bg-white"
                }`}
              />
            </button>
          ))}
        </div>

        <button
          onClick={() =>
            setCurrentIndex((prev) =>
              prev === 0 ? SLIDES.length - 1 : prev - 1,
            )
          }
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 lg:opacity-100 hover:bg-white hover:text-neutral-900 transition-all duration-200"
        >
          ❮
        </button>
        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % SLIDES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 lg:opacity-100 hover:bg-white hover:text-neutral-900 transition-all duration-200"
        >
          ❯
        </button>
      </div>
    </section>
  );
}
