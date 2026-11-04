"use client";

import { Lottie } from "lottie-react";

export default function Loader({
  src = "/animations/loader.json",
  fullScreen = true,
  className = "",
}) {
  const wrapperClass = fullScreen
    ? "fixed inset-0 z-[9999] flex items-center justify-center bg-slate-50"
    : "flex w-full items-center justify-center py-10";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Ачаалж байна"
      className={`${wrapperClass} ${className}`}
    >
      <Lottie src={src} loop autoplay className="h-[48px] w-[48px]" />
    </div>
  );
}
