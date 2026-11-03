"use client";

import { useEffect, useId, useState } from "react";
import { Check, ChevronDown, ImageIcon, X } from "lucide-react";
import { ApiError, api } from "@/lib/api";
import { getAccessToken } from "@/lib/session";

const durationTypeLabels = {
  DAILY: "Өдрөөр",
  HOURLY: "Цагаар",
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
  OTHER: "Бусад",
};

const getBranchLabel = (projectName) =>
  projectName === "CONTRACTION"
    ? "Хуучин ангилал"
    : branchLabels[projectName] || projectName;

const formatDateTime = (date) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("mn-MN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("mn-MN", {
    dateStyle: "medium",
  }).format(new Date(date));
};

const formatTime = (date) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("mn-MN", {
    timeStyle: "short",
  }).format(new Date(date));
};

const formatLeaveDuration = (request) =>
  request.durationType === "HOURLY"
    ? `${formatDate(request.startDate)} ${formatTime(request.startDate)} - ${formatTime(request.endDate)}`
    : `${formatDate(request.startDate)} - ${formatDate(request.endDate)}`;

/**
 * Shows project-assigned reviewers their leave requests. Only assigned
 * approvers can change a pending request's status.
 */
export default function LeaveRequestsReviewPanel({
  className = "",
  showHeader = true,
}) {
  const contentId = useId();
  const [requests, setRequests] = useState([]);
  const [hasViewAccess, setHasViewAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewComment, setReviewComment] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const loadRequests = async () => {
      const token = getAccessToken();
      if (!token) {
        setHasViewAccess(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");
      try {
        const response = await api.getLeaveRequests(token);
        setRequests(response?.data?.items || []);
        setHasViewAccess(true);
      } catch (error) {
        if (error instanceof ApiError && error.status === 403) {
          setHasViewAccess(false);
          return;
        }
        setHasViewAccess(true);
        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : "Чөлөөний хүсэлтүүдийг татах үед алдаа гарлаа.",
        );
      } finally {
        setLoading(false);
      }
    };

    const loadTimer = window.setTimeout(() => {
      void loadRequests();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, []);

  const handleReview = async (id, nextStatus) => {
    const token = getAccessToken();
    if (!token) return;

    const comment = reviewComment.trim();
    if (nextStatus === "REJECTED" && !comment) {
      setErrorMessage("Татгалзах шалтгаанаа бичнэ үү.");
      return;
    }

    setUpdatingId(id);
    setErrorMessage("");
    try {
      const response = await api.updateLeaveRequestStatus(
        token,
        id,
        nextStatus,
        comment,
      );
      const updated = response?.data;
      setRequests((previous) =>
        previous.map((item) =>
          item.id === id
            ? { ...item, ...(updated || { status: nextStatus }) }
            : item,
        ),
      );
      setSelectedRequest(null);
      setReviewComment("");
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Хүсэлтийн төлөвийг шинэчлэх үед алдаа гарлаа.",
      );
    } finally {
      setUpdatingId("");
    }
  };

  const sorted = [...requests].sort(
    (first, second) =>
      new Date(second?.createdAt || 0).getTime() -
      new Date(first?.createdAt || 0).getTime(),
  );
  const pendingCount = requests.filter(
    (item) => item.status === "PENDING",
  ).length;

  if (hasViewAccess === false) return null;

  return (
    <section
      className={`space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        {showHeader && (
          <h2 className="text-base font-bold text-slate-900">
            <button
              type="button"
              aria-expanded={isExpanded}
              aria-controls={contentId}
              aria-label={
                isExpanded
                  ? "Чөлөөний хүсэлтүүдийг нуух"
                  : "Чөлөөний хүсэлтүүдийг харуулах"
              }
              onClick={() => setIsExpanded((expanded) => !expanded)}
              className="inline-flex items-center gap-2 text-left"
            >
              Чөлөөний хүсэлтүүд
              <ChevronDown
                size={16}
                aria-hidden="true"
                className={`text-slate-400 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
          </h2>
        )}
        {pendingCount > 0 && (
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
            {pendingCount} хүлээгдэж байна
          </span>
        )}
      </div>

      <div id={contentId} hidden={!isExpanded}>
      {loading && (
        <p className="text-xs text-slate-400">Хүсэлтүүд ачаалж байна...</p>
      )}
      {errorMessage && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {errorMessage}
        </p>
      )}
      {!loading && !errorMessage && (
        <div className="space-y-2">
          {sorted.length === 0 ? (
            <p className="py-4 text-center text-xs text-slate-400">
              Хүсэлт байхгүй байна.
            </p>
          ) : (
            sorted.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedRequest(item);
                  setReviewComment("");
                }}
                className="flex w-full flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left text-xs transition hover:border-slate-300 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-800">
                    {item.lastName} {item.firstName} ·{" "}
                    {roleLabels[item.role] || item.role}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {getBranchLabel(item.ProjectName)}
                    {item.sapId ? ` · SAP: ${item.sapId}` : ""}
                    {item.phoneNumber ? ` · ${item.phoneNumber}` : ""}
                  </p>
                  {item.selectedApproverName && (
                    <p className="mt-1 text-[11px] text-slate-500">
                      Батлах менежер: {item.selectedApproverName}
                    </p>
                  )}
                  {item.selectedHrName && (
                    <p className="mt-1 text-[11px] text-slate-500">
                      ХН хариуцагч: {item.selectedHrName}
                    </p>
                  )}
                  <p className="mt-1 text-slate-600">
                    {durationTypeLabels[item.durationType] || "Өдрөөр"} ·{" "}
                    {formatLeaveDuration(item)}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Илгээсэн: {formatDateTime(item.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {item.proofImageUrl && (
                    <ImageIcon size={14} className="text-slate-400" />
                  )}
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusConfig[item.status]?.className}`}
                  >
                    {statusConfig[item.status]?.label}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {selectedRequest && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => {
            setSelectedRequest(null);
            setReviewComment("");
          }}
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
                  {getBranchLabel(selectedRequest.ProjectName)}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {selectedRequest.sapId ? `SAP: ${selectedRequest.sapId}` : ""}
                  {selectedRequest.sapId && selectedRequest.phoneNumber
                    ? " · "
                    : ""}
                  {selectedRequest.phoneNumber || ""}
                </p>
                {selectedRequest.selectedApproverName && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    Батлах менежер: {selectedRequest.selectedApproverName}
                  </p>
                )}
                {selectedRequest.selectedHrName && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    ХН хариуцагч: {selectedRequest.selectedHrName}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedRequest(null);
                  setReviewComment("");
                }}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Хаах"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  {durationTypeLabels[selectedRequest.durationType] ||
                    "Өдрөөр"}{" "}
                  · {formatLeaveDuration(selectedRequest)}
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
                    className="mt-1.5 block w-fit .max-w-[12rem]"
                  >
                    <img
                      src={selectedRequest.proofImageUrl}
                      alt="Баталгаажуулах зураг"
                      className="max-h-40 w-auto max-w-full rounded-lg border border-slate-200 object-contain"
                    />
                  </a>
                </div>
              )}
            </div>

            {selectedRequest.status === "PENDING" &&
              selectedRequest.canApprove && (
              <div className="mt-5 space-y-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="leaveRequestReviewComment"
                    className="text-xs font-bold text-slate-800"
                  >
                    Шийдвэрийн тайлбар
                  </label>
                  <textarea
                    id="leaveRequestReviewComment"
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                    maxLength={1000}
                    rows={3}
                    placeholder="Жишээ: Орлох хүн байхгүй."
                    className="w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-900 outline-none focus:border-slate-700"
                  />
                  <p className="text-[11px] text-slate-500">
                    Татгалзах үед шалтгаан заавал бичнэ. Тайлбар хүсэлт гаргасан
                    хүнд notification-оор очно.
                  </p>
                </div>
                <div className="flex items-center gap-2">
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
                    disabled={
                      updatingId === selectedRequest.id || !reviewComment.trim()
                    }
                    onClick={() => handleReview(selectedRequest.id, "REJECTED")}
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-40"
                  >
                    <X size={14} />
                    Татгалзах
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </section>
  );
}
