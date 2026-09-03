"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
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

export default function FeedbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("WORKPLACE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

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
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <MessageSquareText size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Санал, хүсэлт</h1>
            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 sm:text-sm">
              Та өөрийн санал, хүсэлт, гомолоо тодорхой бичнэ үү. Бид таны
              хүсэлтийг түргэн хугацаанд шийдвэрлэн, зохих арга хэмжээг авах
              болно.
            </p>
          </div>
        </div>
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
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
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
            className="w-full resize-none rounded-lg border border-slate-200 bg-white p-3.5 text-sm leading-6 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !message.trim()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-xs font-bold text-white transition hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={15} />
          {isSubmitting ? "Илгээж байна..." : "Илгээх"}
        </button>

        <p className="flex items-center justify-center gap-2 text-center text-[11px] text-slate-500">
          <LockKeyhole size={13} />
          Таны мэдээллийг нууцлалын дагуу хамгаална.
        </p>
      </form>
    </section>
  );
}
