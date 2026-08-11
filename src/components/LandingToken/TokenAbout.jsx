"use client";

import React from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import MerchCard from "./Merch/MerchCard";
import Image from "next/image";
export default function TokenAbout() {
  const x = useMotionValue(150);
  const y = useMotionValue(150);
  const rotateX = useTransform(y, [0, 300], [12, -12]);
  const rotateY = useTransform(x, [0, 300], [-12, 12]);

  function handleMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  }

  function handleMouseLeave() {
    x.set(150);
    y.set(150);
  }

  return (
    <section className="relative w-full overflow-hidden bg-linear-to-b text-neutral-800 flex items-center justify-center px-5 sm:px-8 md:px-12 md:py-24">
      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="group relative order-1 flex items-center justify-center lg:order-0"
        >
          <div className="absolute h-[65%] w-[65%] rounded-full bg-linear-to-br from-amber-400/25 to-orange-400/15 blur-3xl" />
          <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-60 sm:w-80 md:w-96 lg:w-104"
          >
            <Image
              src="/Token.png"
              alt="KHS Token"
              width={420}
              height={420}
              sizes="(max-width: 640px) 240px, (max-width: 1024px) 384px, 420px"
              className="h-auto w-full select-none object-contain drop-shadow-[0_25px_45px_rgba(217,119,6,0.35)] transition-transform duration-500 group-hover:scale-105"
              style={{ transform: "translateZ(30px)" }}
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="order-2 space-y-6 text-center lg:order-0 lg:text-left"
        >
          <div className="flex items-center justify-center gap-2 lg:justify-start"></div>

          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl md:text-5xl">
            KHS{" "}
            <span className="bg-linear-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              ТОКЕН
            </span>
          </h2>

          <div className="mx-auto max-w-xl space-y-4 text-base font-light leading-relaxed text-neutral-500 md:text-[17px] lg:mx-0">
            <p>
              Энэхүү токен нь{" "}
              <span className="font-medium text-neutral-800">
                Хаанзаа Сервис ХХК
              </span>
              -ийн хөрөнгө бөгөөд хамт олныхоо хөдөлмөр зүтгэлийг бодитоор
              үнэлж, урамшуулах зорилготой юм.
            </p>
            <p>
              Ажилчид уг токеноор Хаанзаа сервисийн{" "}
              <span className="font-medium text-amber-600">МЕРЧ</span> бараа
              бүтээгдэхүүнээс сонголтоо хийх төдийгүй, хамтрагч байгууллагуудын
              тусгай хөнгөлөлт, давуу талуудыг ашиглах бүрэн боломжтой.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
