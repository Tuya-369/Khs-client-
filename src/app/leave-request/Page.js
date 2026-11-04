"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Send, Upload, X } from "lucide-react";
import { ApiError, api } from "@/lib/api";
import { getAccessToken } from "@/lib/session";

const MAX_REASON_LENGTH = 1000;

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

const approvalLevelLabels = {
  OT: "OT",
  SENIOR_SPECIALIST: "Ахлах мэргэжилтэн",
  UNIT_MANAGER: "Үйл ажиллагааны менежер",
  HR_DIRECTOR: "Захиргаа, хүний нөөц хариуцсан захирал",
  GENERAL_DIRECTOR: "Ерөнхий захирал",
};

const approvalPeriodLabels = {
  "1_3": approvalLevelLabels.SENIOR_SPECIALIST,
  "4_7": approvalLevelLabels.UNIT_MANAGER,
  "8_14": approvalLevelLabels.HR_DIRECTOR,
  "15_PLUS": approvalLevelLabels.GENERAL_DIRECTOR,
};

const getApprovalPeriod = (workingDays) => {
  if (workingDays <= 3) return "1_3";
  if (workingDays <= 7) return "4_7";
  if (workingDays <= 14) return "8_14";
  return "15_PLUS";
};

const getWorkingDayCount = (startDate, endDate) => {
  const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
  const [endYear, endMonth, endDay] = endDate.split("-").map(Number);
  const start = Date.UTC(startYear, startMonth - 1, startDay);
  const end = Date.UTC(endYear, endMonth - 1, endDay);
  let count = 0;

  for (let timestamp = start; timestamp <= end; timestamp += 86400000) {
    const weekday = new Date(timestamp).getUTCDay();
    if (weekday !== 0 && weekday !== 6) count += 1;
  }

  return count;
};

const addCalendarMonths = (date, months) => {
  const [year, month, day] = date.split("-").map(Number);
  const monthIndex = month - 1 + months;
  const targetYear = year + Math.floor(monthIndex / 12);
  const targetMonth = monthIndex % 12;
  const lastDay = new Date(
    Date.UTC(targetYear, targetMonth + 1, 0),
  ).getUTCDate();
  const targetDay = Math.min(day, lastDay);

  return `${targetYear}-${String(targetMonth + 1).padStart(2, "0")}-${String(targetDay).padStart(2, "0")}`;
};

const getApprovalPolicy = (approvers, durationType, startDate, endDate) => {
  if (durationType === "HOURLY") {
    if (!startDate) {
      return { workingDays: null, approvalLabel: "", approvers: [], error: "" };
    }

    const otApprovers = approvers.filter(
      ({ approvalLevel }) => approvalLevel === "OT",
    );
    return {
      workingDays: null,
      approvalLabel: otApprovers.length ? "OT" : "Батлах менежер",
      approvers: otApprovers.length
        ? otApprovers
        : approvers.filter(
            ({ approvalLevel }) => approvalLevel !== "GENERAL_DIRECTOR",
          ),
      error: "",
    };
  }

  if (!startDate || !endDate) {
    return { workingDays: null, approvalLabel: "", approvers: [], error: "" };
  }

  if (endDate < startDate) {
    return {
      workingDays: null,
      approvalLabel: "",
      approvers: [],
      error: "Эхлэх огноо дуусах огнооноос хойш байж болохгүй.",
    };
  }

  const workingDays = getWorkingDayCount(startDate, endDate);
  if (endDate > addCalendarMonths(startDate, 3)) {
    return {
      workingDays,
      approvalLabel: "",
      approvers: [],
      error: "Цалингүй чөлөөний хугацаа 3 сараас хэтэрч болохгүй.",
    };
  }
  if (workingDays === 0) {
    return {
      workingDays,
      approvalLabel: "",
      approvers: [],
      error: "Чөлөөний хугацаанд ажлын өдөр байх шаардлагатай.",
    };
  }

  const otApprovers = approvers.filter(
    ({ approvalLevel }) => approvalLevel === "OT",
  );
  if (otApprovers.length > 0) {
    return {
      workingDays,
      approvalLabel: "OT",
      approvers: otApprovers,
      error: "",
    };
  }

  const unitManagers = approvers.filter(
    ({ approvalLevel }) => approvalLevel === "UNIT_MANAGER",
  );
  const hasConfiguredApprovalPeriods = approvers.some(({ approvalPeriods }) =>
    Array.isArray(approvalPeriods),
  );
  let eligibleApprovers;
  let approvalLabel;

  if (hasConfiguredApprovalPeriods) {
    const approvalPeriod = getApprovalPeriod(workingDays);
    eligibleApprovers = approvers.filter(({ approvalPeriods }) =>
      approvalPeriods?.includes(approvalPeriod),
    );
    approvalLabel = approvalPeriodLabels[approvalPeriod];
  } else if (workingDays <= 3) {
    const seniorSpecialists = approvers.filter(
      ({ approvalLevel }) => approvalLevel === "SENIOR_SPECIALIST",
    );
    eligibleApprovers =
      seniorSpecialists.length > 0 ? seniorSpecialists : unitManagers;
    approvalLabel =
      seniorSpecialists.length > 0
        ? approvalLevelLabels.SENIOR_SPECIALIST
        : "Үйл ажиллагаа хариуцсан менежер";
  } else if (workingDays <= 7) {
    eligibleApprovers = unitManagers;
    approvalLabel = approvalLevelLabels.UNIT_MANAGER;
  } else if (workingDays <= 14) {
    const hrDirectors = approvers.filter(
      ({ approvalLevel }) => approvalLevel === "HR_DIRECTOR",
    );
    const responsibleHr = approvers.filter(
      ({ isResponsibleHr }) => isResponsibleHr,
    );
    eligibleApprovers = hrDirectors.length > 0 ? hrDirectors : responsibleHr;
    approvalLabel =
      hrDirectors.length > 0
        ? approvalLevelLabels.HR_DIRECTOR
        : "Төслийн хүний нөөц хариуцагч";
  } else {
    eligibleApprovers = approvers.filter(
      ({ approvalLevel }) => approvalLevel === "GENERAL_DIRECTOR",
    );
    approvalLabel = approvalLevelLabels.GENERAL_DIRECTOR;
  }

  if (eligibleApprovers.length === 0) {
    return {
      workingDays,
      approvalLabel,
      approvers: [],
      error: `${approvalLabel} бүртгэгдээгүй байна. Хүний нөөцтэй холбогдоно уу.`,
    };
  }

  return {
    workingDays,
    approvalLabel,
    approvers: eligibleApprovers,
    error: "",
  };
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

export default function LeaveRequestPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [durationType, setDurationType] = useState("DAILY");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("18:00");
  const [reason, setReason] = useState("");
  const [proofImage, setProofImage] = useState(null);
  const [proofImagePreview, setProofImagePreview] = useState("");
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const [myRequests, setMyRequests] = useState([]);
  const [approvers, setApprovers] = useState([]);
  const [hrApprovers, setHrApprovers] = useState([]);
  const [requiresHrSelection, setRequiresHrSelection] = useState(false);
  const [selectedApproverPhoneNumber, setSelectedApproverPhoneNumber] =
    useState("");
  const [selectedHrPhoneNumber, setSelectedHrPhoneNumber] = useState("");

  const approvalPolicy = useMemo(
    () => getApprovalPolicy(approvers, durationType, startDate, endDate),
    [approvers, durationType, startDate, endDate],
  );
  const effectiveSelectedApproverPhoneNumber = approvalPolicy.approvers.some(
    (approver) => approver.phoneNumber === selectedApproverPhoneNumber,
  )
    ? selectedApproverPhoneNumber
    : approvalPolicy.approvers.length === 1
      ? approvalPolicy.approvers[0].phoneNumber
      : "";
  const effectiveSelectedHrPhoneNumber = hrApprovers.some(
    (approver) => approver.phoneNumber === selectedHrPhoneNumber,
  )
    ? selectedHrPhoneNumber
    : hrApprovers.length === 1
      ? hrApprovers[0].phoneNumber
      : "";

  const loadData = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/auth");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const [mineResponse, approversResponse] = await Promise.all([
        api.getMyLeaveRequests(token),
        api.getLeaveRequestApprovers(token),
      ]);
      setMyRequests(mineResponse?.data?.items || []);
      const nextApprovers = approversResponse?.data?.items || [];
      const nextHrApprovers = approversResponse?.data?.hrItems || [];
      setApprovers(nextApprovers);
      setHrApprovers(nextHrApprovers);
      setRequiresHrSelection(
        approversResponse?.data?.requiresHrSelection ??
          nextHrApprovers.length > 1,
      );
      setSelectedApproverPhoneNumber((current) =>
        nextApprovers.some((approver) => approver.phoneNumber === current)
          ? current
          : "",
      );
      setSelectedHrPhoneNumber((current) =>
        nextHrApprovers.some((approver) => approver.phoneNumber === current)
          ? current
          : "",
      );
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
    if (approvalPolicy.error) {
      setStatus({
        type: "error",
        message: approvalPolicy.error,
      });
      return;
    }
    if (!effectiveSelectedApproverPhoneNumber) {
      setStatus({
        type: "error",
        message: "Батлах ажилтнаа сонгоно уу.",
      });
      return;
    }
    if (requiresHrSelection && !effectiveSelectedHrPhoneNumber) {
      setStatus({
        type: "error",
        message: "ХН ажилтан сонгоно уу.",
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: null, message: "" });

    try {
      const startDateTime =
        durationType === "HOURLY"
          ? `${startDate}T${startTime}:00`
          : `${startDate}T00:00:00`;
      const endDateTime =
        durationType === "HOURLY"
          ? `${startDate}T${endTime}:00`
          : `${endDate}T23:59:59`;

      await api.createLeaveRequest(token, {
        type: "OTHER",
        durationType,
        startDate: startDateTime,
        endDate: endDateTime,
        reason: reason.trim(),
        proofImage,
        selectedApproverPhoneNumber: effectiveSelectedApproverPhoneNumber,
        selectedHrPhoneNumber: effectiveSelectedHrPhoneNumber,
      });

      setStatus({
        type: "success",
        message: "Таны хүсэлтийг амжилттай илгээлээ.",
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

  return (
    <section className="mx-auto max-w-3xl px-4 space-y-6 py-4 sm:py-6">
      <header className="border-b border-slate-200 pb-4">
        <h1 className="text-lg sm:text-xl font-bold text-slate-900">
          Чөлөөний хүсэлт
        </h1>
      </header>

      {errorMessage && (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"
        >
          {errorMessage}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="startDate"
              className="text-xs font-bold text-slate-800"
            >
              {durationType === "HOURLY" ? "Огноо" : "Эхлэх огноо"}{" "}
              <span className="text-rose-500">*</span>
            </label>
            <div
              className={`grid gap-2 ${
                durationType === "HOURLY" ? "grid-cols-2" : "grid-cols-1"
              }`}
            >
              <div className="relative">
                <Calendar
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (durationType === "HOURLY") setEndDate(e.target.value);
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-2 text-xs sm:text-sm text-slate-900 outline-none focus:border-slate-700"
                  required
                />
              </div>
              {durationType === "HOURLY" && (
                <div className="relative">
                  <Clock
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-2 text-xs sm:text-sm text-slate-900 outline-none focus:border-slate-700"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="endDate"
              className="text-xs font-bold text-slate-800"
            >
              {durationType === "HOURLY" ? "Дуусах цаг" : "Дуусах огноо"}{" "}
              <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {durationType === "DAILY" && (
                <div className="relative">
                  <Calendar
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-2 text-xs sm:text-sm text-slate-900 outline-none focus:border-slate-700"
                    required
                  />
                </div>
              )}
              {durationType === "HOURLY" && (
                <div className="relative">
                  <Clock
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-2 text-xs sm:text-sm text-slate-900 outline-none focus:border-slate-700"
                    required
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="selectedApproverPhoneNumber"
            className="text-xs font-bold text-slate-800"
          >
            Батлах ажилтан
            {approvalPolicy.approvalLabel
              ? ` · ${approvalPolicy.approvalLabel}`
              : ""}{" "}
            <span className="text-rose-500">*</span>
          </label>
          <select
            id="selectedApproverPhoneNumber"
            value={effectiveSelectedApproverPhoneNumber}
            onChange={(event) =>
              setSelectedApproverPhoneNumber(event.target.value)
            }
            disabled={loading || approvalPolicy.approvers.length === 0}
            required
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-700 disabled:bg-slate-100"
          >
            <option value="" disabled>
              {loading
                ? "Батлах ажилтны жагсаалт ачаалж байна..."
                : approvalPolicy.approvers.length === 0
                  ? "Ажлын огноогоо сонгоно уу"
                  : "Батлах ажилтнаа сонгоно уу"}
            </option>
            {approvalPolicy.approvers.map((approver) => (
              <option key={approver.phoneNumber} value={approver.phoneNumber}>
                {approver.displayName || approver.phoneNumber}
              </option>
            ))}
          </select>
          {approvalPolicy.workingDays !== null && !approvalPolicy.error && (
            <p className="text-xs text-slate-500">
              Ажлын {approvalPolicy.workingDays} өдөр. Амралтын өдрүүдийг
              тооцохгүй.
            </p>
          )}
          {approvalPolicy.error && (
            <p role="alert" className="text-xs text-rose-600">
              {approvalPolicy.error}
            </p>
          )}
        </div>

        {hrApprovers.length > 0 && (
          <div className="space-y-1.5">
            <label
              htmlFor="selectedHrPhoneNumber"
              className="text-xs font-bold text-slate-800"
            >
              Хүний нөөц{" "}
              {requiresHrSelection && <span className="text-rose-500">*</span>}
            </label>
            {requiresHrSelection ? (
              <select
                id="selectedHrPhoneNumber"
                value={effectiveSelectedHrPhoneNumber}
                onChange={(event) =>
                  setSelectedHrPhoneNumber(event.target.value)
                }
                disabled={loading}
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-700 disabled:bg-slate-100"
              >
                <option value="" disabled>
                  ХН ажилтан сонгоно уу
                </option>
                {hrApprovers.map((approver) => (
                  <option
                    key={approver.phoneNumber}
                    value={approver.phoneNumber}
                  >
                    {approver.displayName || approver.phoneNumber}
                  </option>
                ))}
              </select>
            ) : (
              <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                {hrApprovers[0].displayName || hrApprovers[0].phoneNumber}
              </p>
            )}
          </div>
        )}

        {status.message && (
          <div
            role="status"
            className={`rounded-lg border px-3 py-2 text-xs font-medium ${
              status.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {status.message}
          </div>
        )}

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="reason"
              className="text-xs font-bold text-slate-800"
            >
              Шалтгаан <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">
              {reason.length} / {MAX_REASON_LENGTH}
            </span>
          </div>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={MAX_REASON_LENGTH}
            rows={4}
            placeholder="Шалтгаанаа тодорхой бичнэ үү..."
            className="w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-slate-700"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800">
            Баталгаажуулах зураг / бичиг баримт{" "}
            <span className="text-rose-500">*</span>
          </label>
          {proofImagePreview ? (
            <div className="relative w-fit .max-w-[10rem] overflow-hidden rounded-lg border border-slate-200">
              <img
                src={proofImagePreview}
                alt="Баталгаажуулах зураг"
                className="max-h-28 w-auto object-contain"
              />
              <button
                type="button"
                onClick={resetProofImage}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white"
              >
                <X size={11} />
              </button>
            </div>
          ) : (
            <label
              htmlFor="proofImage"
              className="flex min-h-16 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-center transition hover:bg-slate-100"
            >
              <Upload size={16} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-600">
                Эмчийн магадлан эсвэл холбогдох зураг оруулна уу.
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
            !proofImage ||
            !effectiveSelectedApproverPhoneNumber ||
            (requiresHrSelection && !effectiveSelectedHrPhoneNumber) ||
            approvalPolicy.approvers.length === 0 ||
            Boolean(approvalPolicy.error)
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-40"
        >
          <Send size={15} />
          {isSubmitting ? "Илгээж байна..." : "Хүсэлт илгээх"}
        </button>
      </form>

      <section className="space-y-3">
        <h2 className="text-xs sm:text-sm font-bold text-slate-900">
          Миний хүсэлтүүд
        </h2>
        {loading ? (
          <p className="text-xs text-slate-500">Уншиж байна...</p>
        ) : myRequests.length === 0 ? (
          <p className="text-xs text-slate-500">Хүсэлт байхгүй байна.</p>
        ) : (
          <div className="space-y-2">
            {myRequests.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between text-xs"
              >
                <span
                  className={`inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusConfig[item.status]?.className}`}
                >
                  {statusConfig[item.status]?.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
