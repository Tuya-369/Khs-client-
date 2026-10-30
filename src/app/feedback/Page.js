"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Ellipsis,
  LockKeyhole,
  MessageSquareText,
  Send,
  UserRound,
  WalletCards,
} from "lucide-react";
import { ApiError, api } from "@/lib/api";
import { getAccessToken } from "@/lib/session";

const MAX_MESSAGE_LENGTH = 1000;

const feedbackCategories = [
  { value: "WORKPLACE", label: "Ажлын орчин", icon: MessageSquareText },
  { value: "OPERATIONS", label: "Үйл ажиллагаа", icon: Building2 },
  { value: "MANAGEMENT", label: "Удирдлага", icon: UserRound },
  { value: "COMPENSATION", label: "Цалин, хангамж", icon: WalletCards },
  { value: "OTHER", label: "Бусад", icon: Ellipsis },
];

const feedbackStatusConfig = {
  PENDING: {
    label: "Хүлээгдэж байна",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  RESOLVED: {
    label: "Шийдвэрлэсэн",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  SUSPENDED: {
    label: "Түдгэлзүүлсэн",
    className: "border-slate-200 bg-slate-100 text-slate-700",
  },
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("mn-MN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

export default function FeedbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("WORKPLACE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);

  const loadMyFeedback = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      setLoadingFeedbacks(true);
      const res = await api.getMyFeedback(token);
      setMyFeedbacks(res?.data?.items || []);
    } catch {
      // ignore
    } finally {
      setLoadingFeedbacks(false);
    }
  }, []);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadMyFeedback();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [loadMyFeedback]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getAccessToken();
    if (!token) {
      router.replace("/auth");
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: null, message: "" });

    try {
      await api.createFeedback(token, { message: message.trim(), category });

      setStatus({
        type: "success",
        message:
          "Таны санал хүсэлтийг хүлээн авлаа. Бид тантай эргэн холбогдох болно. Баярлалаа.",
      });
      setMessage("");
      void loadMyFeedback();
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof ApiError
            ? error.message
            : "Сүлжээний алдаа гарлаа. Та дахин оролдоно уу.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-5xl py-3 sm:py-5">
      <header className="border-b border-slate-200 pb-6">
        <h1 className="text-xl font-bold text-slate-900">Санал, хүсэлт</h1>
        <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 sm:text-sm">
          Та өөрийн санал, хүсэлт, гомолоо тодорхой бичнэ үү. Бид таны хүсэлтийг
          түргэн хугацаанд шийдвэрлэн, зохих арга хэмжээг авах болно.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-7 pt-7">
        <fieldset>
          <legend className="text-xs font-bold text-slate-800">
            Саналын төрөл{" "}
            <span className="font-normal text-slate-400">(сонголттой)</span>
          </legend>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {feedbackCategories.map(({ value, label, icon: Icon }) => {
              const isSelected = category === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCategory(value)}
                  className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold transition sm:min-w-32 ${
                    isSelected
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {status.message && (
          <div
            role="status"
            className={`rounded-lg border px-3 py-2.5 text-xs font-medium ${
              status.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {status.message}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="message"
              className="text-xs font-bold text-slate-800"
            >
              Таны санал, хүсэлт <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] tabular-nums text-slate-400">
              {message.length} / {MAX_MESSAGE_LENGTH}
            </span>
          </div>

          <textarea
            id="message"
            name="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={MAX_MESSAGE_LENGTH}
            rows={7}
            placeholder="Санал, хүсэлтээ энд бичнэ үү..."
            className="w-full resize-none rounded-lg border border-slate-200 bg-white p-3.5 text-sm leading-6 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !message.trim()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-xs font-bold text-white transition hover:bg-slate-800 active:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={15} />
          {isSubmitting ? "Илгээж байна..." : "Илгээх"}
        </button>

        <p className="flex items-center justify-center gap-2 text-center text-[11px] text-slate-500">
          <LockKeyhole size={13} />
          Таны мэдээллийг нууцлалын дагуу хамгаална.
        </p>
      </form>

      {/* Миний илгээсэн санал хүсэлтүүд */}
      <section className="mt-10 border-t border-slate-200 pt-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-900">
          Миний илгээсэн санал хүсэлтүүд
        </h2>

        {loadingFeedbacks ? (
          <p className="text-xs text-slate-400">Уншиж байна...</p>
        ) : myFeedbacks.length === 0 ? (
          <p className="text-xs text-slate-400">
            Та одоогоор санал хүсэлт илгээгээгүй байна.
          </p>
        ) : (
          <div className="space-y-3">
            {myFeedbacks.map((item) => {
              const cat =
                feedbackCategories.find((c) => c.value === item.category) ||
                feedbackCategories[4];
              const CatIcon = cat.icon;
              const currentStatus =
                feedbackStatusConfig[item.status] || feedbackStatusConfig.PENDING;

              return (
                <article
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 text-xs shadow-xs space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                      <CatIcon size={14} className="text-slate-400" />
                      {cat.label}
                    </span>
                    <span
                      className={`rounded-md border px-2.5 py-0.5 text-[11px] font-semibold ${currentStatus.className}`}
                    >
                      {currentStatus.label}
                    </span>
                  </div>

                  <p className="whitespace-pre-wrap leading-5 text-slate-800">
                    {item.message}
                  </p>

                  {item.response ? (
                    <div className="rounded-lg border border-indigo-100 bg-indigo-50/70 p-3">
                      <div className="flex items-center justify-between font-semibold text-indigo-950">
                        <span className="flex items-center gap-1.5">
                          <MessageSquareText size={13} className="text-indigo-600" />
                          HR-ийн хариулт, шийдвэр:
                        </span>
                        {item.respondedAt && (
                          <span className="text-[10px] font-normal text-indigo-500">
                            {formatDate(item.respondedAt)}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-slate-700 leading-5">
                        {item.response}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">
                      Хариу, шийдвэр хүлээгдэж байна...
                    </p>
                  )}

                  <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
                    <span>Илгээсэн: {formatDate(item.createdAt)}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}
