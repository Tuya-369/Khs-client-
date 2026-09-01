"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, api } from "@/lib/api";
import { getAccessToken } from "@/lib/session";

export default function FeedbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const MAX_MESSAGE_LENGTH = 1000;

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
      await api.createFeedback(token, { message });

      setStatus({
        type: "success",
        message: "Таны санал хүсэлтийг хүлээн авлаа. Баярлалаа.",
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
    <div className="max-w-xl mx-auto py-10 px-4">
      <div>
        <div className="py-4">
          <h1 className="text-xl font-bold text-slate-900">
            Санал, хүсэлт илгээх
          </h1>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            Та дотоод үйл ажиллагаа болон бусад асуудлаар санал, хүсэлт, гомдол
            илгээх боломжтой. Бид нууцлалыг чанд хадгалан шийдвэрлэх болно.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          {status.message && (
            <div
              role="status"
              className={`rounded-md px-3 py-2.5 text-xs font-medium ${
                status.type === "success"
                  ? "bg-[#729fd0]/15 text-[#1f4a88]"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {status.message}
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="message"
                className="text-xs font-semibold text-slate-900"
              >
                Агуулга
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
              rows={6}
              placeholder="Санал, хүсэлтээ бичнэ үү..."
              className="w-full rounded-lg bg-slate-50 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#729fd0]/40 resize-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !message.trim()}
            className="w-full rounded-lg bg-[#4677b9] hover:bg-[#1f4a88] active:bg-[#f7a614] py-3 text-xs font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? "Илгээж байна..." : "Илгээх"}
          </button>
        </form>
      </div>
    </div>
  );
}
