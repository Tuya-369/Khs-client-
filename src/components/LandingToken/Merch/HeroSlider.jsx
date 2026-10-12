"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Check, Pencil, X } from "lucide-react";
import { api } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import { useProfile } from "@/context/ProfileContext";

const PARTNERS = [
  {
    id: "Bluefin-Catering",
    title: "Bluefin-Catering",
    description:
      "Bluefin Catering-ийн хоол, үйлчилгээний тооцоог бэлэн мөнгө шаардахгүйгээр байгууллагын токеноороо  шууд хийх боломжийг бүрдүүллээ.",
    logo: "https://res.cloudinary.com/hfroefns/image/upload/v1786354835/547afbda-79c6-481f-9a14-9937da2d2d02_fitg1z.png",
    url: "https://www.facebook.com/Bluefincatering",
    ctaLabel: "Дэлгэрэнгүй",
  },
  {
    id: "we-are-miners",
    title: "We Are Miners",
    description:
      "Уурхайчдын аюулгүй байдал, өдөр тутмын тусгай хувцас, каскны бүс болон мерч бүтээгдэхүүнийг залуустаа шууд нийлүүлэх замаар We Are Miners брендтэй хамтран ажиллаж байна.",
    logo: "https://res.cloudinary.com/hfroefns/image/upload/v1786350688/500763936_122134973504759573_7525755744609605248_n-removebg-preview_gjuj1r.png",
    url: "https://www.facebook.com/profile.php?id=61572787193323",
    ctaLabel: "Дэлгэрэнгүй",
  },
  {
    id: "OYUT PIZZA UHG LLC",
    title: "Oyut Pizza",
    description:
      "Оюу Толгойн талбайн уурхайчдад зориулсан амтат пицца үйлчилгээг цуглуулсан токеноороо бэлэн мөнгөний оронд суутгуулан авах боломжийг бүрдүүллээ.",
    logo: "https://res.cloudinary.com/hfroefns/image/upload/v1786350937/528039625_1293939149185084_471515427446860816_n-removebg-preview_vv3tbb.png",
    url: "https://www.facebook.com/uhgllc",
    ctaLabel: "Дэлгэрэнгүй",
  },
];

const SLIDE_DURATION = 9000;

const DEFAULT_FOOTER_TEXT =
  "Та өөрийн цуглуулсан KHS Token-оор эдгээр байгууллагуудад худалдан авалт хийх боломжтой.";

const normalizePartner = (partner, fallback = {}) => ({
  ...fallback,
  ...partner,
  id: partner?.id || fallback.id,
  title: partner?.title || fallback.title,
  description: partner?.description || fallback.description,
  url: partner?.url || fallback.url,
  logo: partner?.logo || partner?.logoUrl || fallback.logo || "",
  ctaLabel: partner?.ctaLabel || fallback.ctaLabel || "Дэлгэрэнгүй",
});

export default function HeroSlider() {
  const { profileUser } = useProfile();
  const [partners, setPartners] = useState(PARTNERS);
  const [footerText, setFooterText] = useState(DEFAULT_FOOTER_TEXT);
  const [hasLoadedPartners, setHasLoadedPartners] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [draft, setDraft] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editorError, setEditorError] = useState("");
  const touchStartX = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const activePartner = partners[currentIndex] || PARTNERS[0];
  const isSuperAdmin = profileUser?.role === "SUPERADMIN";

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % partners.length);
  }, [partners.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? partners.length - 1 : prev - 1));
  }, [partners.length]);

  useEffect(() => {
    let isMounted = true;

    api
      .getMerchPartners()
      .then((response) => {
        const content = response?.data;
        if (
          !isMounted ||
          !Array.isArray(content?.partners) ||
          !content.partners.length
        ) {
          return;
        }

        setPartners(
          content.partners.map((partner, index) =>
            normalizePartner(partner, PARTNERS[index]),
          ),
        );
        setCurrentIndex(0);
        setFooterText(content.footerText || DEFAULT_FOOTER_TEXT);
        setHasLoadedPartners(true);
      })
      .catch(() => {
        // Static content remains available until the API is deployed.
      });

    return () => {
      isMounted = false;
    };
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

  const openEditor = () => {
    setDraft({ ...activePartner, footerText });
    setImageFile(null);
    setEditorError("");
    setIsEditorOpen(true);
  };

  const updateDraft = (field, value) => {
    setDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
  };

  const saveChanges = async (event) => {
    event.preventDefault();
    if (!draft) return;

    const formData = new FormData();
    formData.append("title", draft.title.trim());
    formData.append("description", draft.description.trim());
    formData.append("url", draft.url.trim());
    formData.append("ctaLabel", draft.ctaLabel.trim());
    formData.append("footerText", draft.footerText.trim());
    if (imageFile) formData.append("logo", imageFile);

    setIsSaving(true);
    setEditorError("");
    try {
      const response = await api.updateMerchPartner(
        getAccessToken(),
        draft.id,
        formData,
      );
      const savedContent = response?.data;
      const savedPartner = normalizePartner(
        savedContent?.partner || savedContent,
        activePartner,
      );

      setPartners((currentPartners) =>
        currentPartners.map((partner) =>
          partner.id === draft.id ? { ...partner, ...savedPartner } : partner,
        ),
      );
      setFooterText(savedContent?.footerText || draft.footerText.trim());
      setIsEditorOpen(false);
    } catch (error) {
      setEditorError(error?.message || "Өөрчлөлтийг хадгалж чадсангүй.");
    } finally {
      setIsSaving(false);
    }
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

        {isSuperAdmin && hasLoadedPartners && (
          <button
            type="button"
            onClick={openEditor}
            className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
            aria-label="Хамтрагчийн мэдээлэл засах"
            title="Засах"
          >
            <Pencil size={17} />
          </button>
        )}

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
                  className="relative flex h-60 w-full items-center justify-center sm:h-72 lg:h-80"
                >
                  {activePartner.logo ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={activePartner.logo}
                        alt={`${activePartner.title} зураг`}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, 40vw"
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <span className="text-center text-sm font-semibold text-slate-500">
                      Лого байхгүй
                    </span>
                  )}
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
                      <span>{activePartner.ctaLabel || "Дэлгэрэнгүй"}</span>
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
                {footerText}
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

      <AnimatePresence>
        {isEditorOpen && draft && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.form
              onSubmit={saveChanges}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-5 shadow-2xl sm:p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">
                  Хамтрагч засах
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
                  aria-label="Хаах"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Гарчиг
                  <input
                    value={draft.title}
                    onChange={(event) =>
                      updateDraft("title", event.target.value)
                    }
                    required
                    className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-700"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Тайлбар
                  <textarea
                    value={draft.description}
                    onChange={(event) =>
                      updateDraft("description", event.target.value)
                    }
                    required
                    rows={4}
                    className="mt-1.5 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-700"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Холбоос
                  <input
                    type="url"
                    value={draft.url}
                    onChange={(event) => updateDraft("url", event.target.value)}
                    required
                    className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-700"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Товчны текст
                  <input
                    value={draft.ctaLabel || ""}
                    onChange={(event) =>
                      updateDraft("ctaLabel", event.target.value)
                    }
                    required
                    className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-700"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Зураг
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) =>
                      setImageFile(event.target.files?.[0] || null)
                    }
                    className="mt-1.5 block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Доод тайлбар
                  <textarea
                    value={draft.footerText}
                    onChange={(event) =>
                      updateDraft("footerText", event.target.value)
                    }
                    required
                    rows={3}
                    className="mt-1.5 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-700"
                  />
                </label>
              </div>

              {editorError && (
                <p className="mt-4 text-sm text-red-600">{editorError}</p>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="rounded-md px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Check size={16} />
                  {isSaving ? "Хадгалж байна..." : "Хадгалах"}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
