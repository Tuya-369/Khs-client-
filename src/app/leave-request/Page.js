"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Calendar,
  Check,
  Heart,
  ImageIcon,
  Send,
  Upload,
  User as UserIcon,
  X,
} from "lucide-react";
import { ApiError, api } from "@/lib/api";
import { getAccessToken } from "@/lib/session";

const MAX_REASON_LENGTH = 1000;

const leaveTypes = [
  { value: "SICK", label: "Эмнэлэг", icon: Heart },
  { value: "PERSONAL", label: "Хувийн", icon: UserIcon },
  { value: "OTHER", label: "Бусад", icon: Briefcase },
];

const leaveTypeLabels = {
  SICK: "Эмнэлэг",
  PERSONAL: "Хувийн",
  OTHER: "Бусад",
};

const statusConfig = {
  PENDING: {
    label: "Хүлээгдэж байна",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  APPROVED: {
    label: "Зөвшөөрсөн",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  REJECTED: {
    label: "Татгалзсан",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
};

const roleLabels = {
  ADMIN: "Худалдан авалтын менежер",
  ADMIN_PANEL: "Админ",
  TOKEN_MANAGER: "Токен менежер",
  DRIVER: "Механикч",
  HR: "Хүний нөөц",
  SUPERADMIN: "Ахлах менежер",
  EMPLOYEE: "Ажилтан",
};

const branchLabels = {
  UG: "UG",
  UB: "UB",
  BAYAJUULAH: "Баяжуулах",
  PROJECT: "Төсөл",
  OPERATION: "Үйл ажиллагаа",
  CONTRACTION: "Гэрээт ажил",
};

const REVIEWER_ROLES = ["SUPERADMIN", "ADMIN_PANEL", "HR"];

const formatDate = (date) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("mn-MN", { dateStyle: "medium" }).format(
    new Date(date),
  );
};

const formatDateTime = (date) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("mn-MN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

export default function LeaveRequestPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [type, setType] = useState("SICK");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [proofImage, setProofImage] = useState(null);
  const [proofImagePreview, setProofImagePreview] = useState("");
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const [myRequests, setMyRequests] = useState([]);
  const [reviewRequests, setReviewRequests] = useState([]);
  const [updatingId, setUpdatingId] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const isReviewer = REVIEWER_ROLES.includes(currentUser?.role);

  const loadData = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/auth");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const meResponse = await api.me(token);
      const user = meResponse?.data?.user || null;
      setCurrentUser(user);

      const mineResponse = await api.getMyLeaveRequests(token);
      setMyRequests(mineResponse?.data?.items || []);

      if (REVIEWER_ROLES.includes(user?.role)) {
        const reviewResponse = await api.getLeaveRequests(token);
        setReviewRequests(reviewResponse?.data?.items || []);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Мэдээлэл татахад алдаа гарлаа.",
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [loadData]);

  useEffect(() => {
    return () => {
      if (proofImagePreview) URL.revokeObjectURL(proofImagePreview);
    };
  }, [proofImagePreview]);

  const handleProofImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (proofImagePreview) URL.revokeObjectURL(proofImagePreview);
    setProofImage(file);
    setProofImagePreview(file ? URL.createObjectURL(file) : "");
  };

  const resetProofImage = () => {
    if (proofImagePreview) URL.revokeObjectURL(proofImagePreview);
    setProofImage(null);
    setProofImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getAccessToken();
    if (!token) {
      router.replace("/auth");
      return;
    }

    if (!proofImage) {
      setStatus({
        type: "error",
        message: "Баталгаажуулах зураг оруулна уу.",
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: null, message: "" });

    try {
      await api.createLeaveRequest(token, {
        type,
        startDate,
        endDate,
        reason: reason.trim(),
        proofImage,
      });

      setStatus({
        type: "success",
        message: "Таны чөлөөний хүсэлтийг амжилттай илгээлээ.",
      });
      setStartDate("");
      setEndDate("");
      setReason("");
      resetProofImage();
      loadData();
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

  const handleReview = async (id, nextStatus) => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/auth");
      return;
    }

    setUpdatingId(id);
    try {
      await api.updateLeaveRequestStatus(token, id, nextStatus);
      await loadData();
      setSelectedRequest(null);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Төлөв шинэчлэхэд алдаа гарлаа.",
      );
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6 py-3 sm:py-5">
      <header className="border-b border-slate-200 pb-5">
        <h1 className="text-xl font-bold text-slate-900">Чөлөөний хүсэлт</h1>
        <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 sm:text-sm">
          Чөлөө авах огноо, шалтгаанаа бөглөж илгээнэ үү. Таны хүсэлтийг
          хариуцсан ажилтанд мэдэгдэх болно.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              Ажилтны овог, нэр
            </label>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700">
              {currentUser
                ? `${currentUser.lastName} ${currentUser.firstName}`
                : "-"}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              Албан тушаал
            </label>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700">
              {roleLabels[currentUser?.role] || "-"}
            </div>
          </div>
        </div>

        <fieldset>
          <legend className="text-xs font-bold text-slate-800">
            Чөлөөний төрөл
          </legend>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {leaveTypes.map(({ value, label, icon: Icon }) => {
              const isSelected = type === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold transition ${
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="startDate"
              className="text-xs font-bold text-slate-800"
            >
              Чөлөө эхлэх огноо <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="endDate"
              className="text-xs font-bold text-slate-800"
            >
              Чөлөө дуусах огноо <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="endDate"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
                required
              />
            </div>
          </div>
        </div>

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
              htmlFor="reason"
              className="text-xs font-bold text-slate-800"
            >
              Чөлөө хүсэх болсон шалтгаан{" "}
              <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] tabular-nums text-slate-400">
              {reason.length} / {MAX_REASON_LENGTH}
            </span>
          </div>
          <textarea
            id="reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={MAX_REASON_LENGTH}
            rows={5}
            placeholder="Шалтгаанаа энд бичнэ үү..."
            className="w-full resize-none rounded-lg border border-slate-200 bg-white p-3.5 text-sm leading-6 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800">
            Баталгаажуулах зураг <span className="text-rose-500">*</span>
          </label>
          <p className="text-[11px] text-slate-500">
            Жишээ нь: эмчийн тодорхойлолт, баталгаажуулах бичиг баримт гэх мэт
            зураг оруулна уу.
          </p>
          {proofImagePreview ? (
            <div className="relative w-fit max-w-[10rem] overflow-hidden rounded-lg border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proofImagePreview}
                alt="Баталгаажуулах зураг"
                className="max-h-28 w-auto max-w-full object-contain"
              />
              <button
                type="button"
                onClick={resetProofImage}
                className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/80 text-white transition hover:bg-slate-900"
                aria-label="Зураг хасах"
              >
                <X size={11} />
              </button>
            </div>
          ) : (
            <label
              htmlFor="proofImage"
              className="flex min-h-16 w-full max-w-xs cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-center transition hover:border-slate-400 hover:bg-slate-100"
            >
              <Upload size={16} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-600">
                Зураг оруулахын тулд энд дарна уу
              </span>
            </label>
          )}
          <input
            id="proofImage"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleProofImageChange}
            className="hidden"
          />
        </div>

        <button
          type="submit"
          disabled={
            isSubmitting ||
            !startDate ||
            !endDate ||
            !reason.trim() ||
            !proofImage
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-xs font-bold text-white transition hover:bg-slate-800 active:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={15} />
          {isSubmitting ? "Илгээж байна..." : "Илгээх"}
        </button>
      </form>

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900">Миний хүсэлтүүд</h2>
        {loading ? (
          <p className="text-xs text-slate-500">Уншиж байна...</p>
        ) : myRequests.length === 0 ? (
          <p className="text-xs text-slate-500">Хүсэлт байхгүй байна.</p>
        ) : (
          <div className="space-y-2">
            {myRequests.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {leaveTypeLabels[item.type]} · {formatDate(item.startDate)}{" "}
                    - {formatDate(item.endDate)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{item.reason}</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Илгээсэн: {formatDateTime(item.createdAt)}
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusConfig[item.status]?.className}`}
                >
                  {statusConfig[item.status]?.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {isReviewer && (
        <section className="space-y-3 border-t border-slate-200 pt-6">
          <h2 className="text-sm font-bold text-slate-900">
            Хариуцсан хүсэлтүүд
          </h2>
          {errorMessage && (
            <p className="text-xs font-medium text-rose-600">{errorMessage}</p>
          )}
          {reviewRequests.length === 0 ? (
            <p className="text-xs text-slate-500">Хүсэлт байхгүй байна.</p>
          ) : (
            <div className="space-y-2">
              {reviewRequests.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedRequest(item)}
                  className="flex w-full flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3.5 text-left transition hover:border-slate-300 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      {item.lastName} {item.firstName} ·{" "}
                      {roleLabels[item.role] || item.role}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {branchLabels[item.ProjectName] || item.ProjectName}
                      {item.sapId ? ` · SAP: ${item.sapId}` : ""}
                      {item.phoneNumber ? ` · ${item.phoneNumber}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      {leaveTypeLabels[item.type]} ·{" "}
                      {formatDate(item.startDate)} - {formatDate(item.endDate)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{item.reason}</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Илгээсэн: {formatDateTime(item.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.proofImageUrl && (
                      <ImageIcon size={14} className="text-slate-400" />
                    )}
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusConfig[item.status]?.className}`}
                    >
                      {statusConfig[item.status]?.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {selectedRequest && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedRequest.lastName} {selectedRequest.firstName}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {roleLabels[selectedRequest.role] || selectedRequest.role} ·{" "}
                  {branchLabels[selectedRequest.ProjectName] ||
                    selectedRequest.ProjectName}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {selectedRequest.sapId ? `SAP: ${selectedRequest.sapId}` : ""}
                  {selectedRequest.sapId && selectedRequest.phoneNumber
                    ? " · "
                    : ""}
                  {selectedRequest.phoneNumber || ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Хаах"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  {leaveTypeLabels[selectedRequest.type]} ·{" "}
                  {formatDate(selectedRequest.startDate)} -{" "}
                  {formatDate(selectedRequest.endDate)}
                </span>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusConfig[selectedRequest.status]?.className}`}
                >
                  {statusConfig[selectedRequest.status]?.label}
                </span>
              </div>

              <p className="text-[11px] text-slate-400">
                Илгээсэн: {formatDateTime(selectedRequest.createdAt)}
              </p>

              <div>
                <p className="text-xs font-bold text-slate-800">Шалтгаан</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {selectedRequest.reason}
                </p>
              </div>

              {selectedRequest.proofImageUrl && (
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Баталгаажуулах зураг
                  </p>
                  <a
                    href={selectedRequest.proofImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1.5 block w-fit max-w-[12rem]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedRequest.proofImageUrl}
                      alt="Баталгаажуулах зураг"
                      className="max-h-40 w-auto max-w-full rounded-lg border border-slate-200 object-contain"
                    />
                  </a>
                </div>
              )}
            </div>

            {selectedRequest.status === "PENDING" && (
              <div className="mt-5 flex items-center gap-2">
                <button
                  type="button"
                  disabled={updatingId === selectedRequest.id}
                  onClick={() => handleReview(selectedRequest.id, "APPROVED")}
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-40"
                >
                  <Check size={14} />
                  Зөвшөөрөх
                </button>
                <button
                  type="button"
                  disabled={updatingId === selectedRequest.id}
                  onClick={() => handleReview(selectedRequest.id, "REJECTED")}
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-40"
                >
                  <X size={14} />
                  Татгалзах
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
