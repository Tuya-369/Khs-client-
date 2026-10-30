"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError, api } from "@/lib/api";
import { clearSession, getAccessToken, saveSession } from "@/lib/session";
import { useProfile } from "@/context/ProfileContext";
import {
  Check,
  ArrowLeft,
  BriefcaseBusiness,
  ChevronRight,
  Hash,
  KeyRound,
  Lock,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import SalaryCalc from "./components/SalaryCalc";
import AdminDashboard from "../admin-dashboard/components/AdminDashboard";
import AdminPanel from "../admin-dashboard/components/AdminPanel";
import ProfileSidebar from "./components/ProfileSidebar";
import { DriverDashboardContent } from "../driver-dashboard/page";
import FeedbackPage from "../feedback/Page";
import LeaveRequestPage from "../leave-request/Page";
import HrDashboardPage from "../hr-dashboard/page";
import LeaveRequestsReviewPanel from "../leave-request/components/LeaveRequestsReviewPanel";

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState(null);
  const [merchOrders, setMerchOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [canReviewLeaveRequests, setCanReviewLeaveRequests] = useState(false);

  const [activeEditSection, setActiveEditSection] = useState(null);
  const [saving, setSaving] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState("");

  const [passwordOtp, setPasswordOtp] = useState("");
  const [passwordResetToken, setPasswordResetToken] = useState("");
  const [isPasswordOtpSent, setIsPasswordOtpSent] = useState(false);

  const [form, setForm] = useState({
    lastName: "",
    firstName: "",
    email: "",
    phoneNumber: "",
    additionalPhoneNumber: "",
    profileImage: null,
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });
  const { updateProfileUser } = useProfile();

  const profileTabs = [
    "dashboard",
    "profile",
    "salary",
    "feedback",
    "leave-request",
  ];
  const requestedTab = searchParams.get("tab");
  const activeTab = profileTabs.includes(requestedTab)
    ? requestedTab
    : "profile";

  const setActiveTab = (tab) => {
    router.push(`/profile?tab=${tab}`, { scroll: false });
  };

  useEffect(() => {
    const initPage = async () => {
      const token = getAccessToken();

      if (!token) {
        router.replace("/auth");
        return;
      }

      try {
        const [response, ordersResult, leaveReviewAccessResult] =
          await Promise.allSettled([
          api.me(token),
          api.getMyMerchOrders(token),
          api.getLeaveRequestReviewAccess(token),
        ]);

        if (response.status === "rejected") {
          throw response.reason;
        }

        const currentUser = response.value?.data?.user || null;

        setUser(currentUser);
        updateProfileUser(currentUser);
        setMerchOrders(
          ordersResult.status === "fulfilled"
            ? ordersResult.value?.data || []
            : [],
        );
        setCanReviewLeaveRequests(
          leaveReviewAccessResult.status === "fulfilled" &&
            leaveReviewAccessResult.value?.data?.canReview === true,
        );

        setForm({
          lastName: currentUser?.lastName || "",
          firstName: currentUser?.firstName || "",
          email: currentUser?.email || "",
          phoneNumber: currentUser?.phoneNumber || "",
          additionalPhoneNumber:
            currentUser?.additionalPhoneNumber ||
            currentUser?.secondaryPhoneNumber ||
            "",
          profileImage: null,
          newPassword: "",
          confirmPassword: "",
        });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearSession();
          router.replace("/auth");
        } else {
          setErrorMessage("Мэдээлэл татахад алдаа гарлаа.");
        }
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [router, updateProfileUser]);

  const handleCancelEdit = () => {
    setForm({
      lastName: user?.lastName || "",
      firstName: user?.firstName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      additionalPhoneNumber:
        user?.additionalPhoneNumber || user?.secondaryPhoneNumber || "",
      profileImage: null,
      newPassword: "",
      confirmPassword: "",
    });
    setActiveEditSection(null);
    setProfileImagePreview("");
    setPasswordOtp("");
    setPasswordResetToken("");
    setIsPasswordOtpSent(false);
    setMessage({ type: "", text: "" });
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setForm((prev) => ({ ...prev, profileImage: null }));
      setProfileImagePreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Зөвхөн зураг сонгоно уу." });
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "Зургийн хэмжээ 5 MB-аас ихгүй байна.",
      });
      event.target.value = "";
      return;
    }

    setForm((prev) => ({ ...prev, profileImage: file }));

    const reader = new FileReader();
    reader.onload = () => setProfileImagePreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const handleSaveInfo = async () => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/auth");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        lastName: form.lastName?.trim() || "",
        firstName: form.firstName?.trim() || "",
        phoneNumber: form.phoneNumber?.trim() || "",
        profileImage: form.profileImage,
      };

      const response = await api.updateProfile(token, payload);
      const responseUser = response?.data?.user || response?.data || {};

      const updatedUser = {
        ...user,
        ...responseUser,
      };

      setUser(updatedUser);
      saveSession(token, updatedUser);
      updateProfileUser(updatedUser);
      setActiveEditSection(null);
      setProfileImagePreview("");
      setMessage({
        type: "success",
        text: "Хувийн мэдээлэл амжилттай шинэчлэгдлээ.",
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSession();
        router.replace("/auth");
        return;
      }
      setMessage({
        type: "error",
        text:
          error instanceof ApiError
            ? error.message
            : "Мэдээлэл хадгалахад алдаа гарлаа.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRequestPasswordReset = async () => {
    if (!form.newPassword || !form.confirmPassword) {
      setMessage({
        type: "error",
        text: "Шинэ нууц үгээ бүрэн оруулна уу.",
      });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setMessage({
        type: "error",
        text: "Шинэ нууц үг хоорондоо таарахгүй байна.",
      });
      return;
    }

    if (!user?.phoneNumber) {
      setMessage({
        type: "error",
        text: "Бүртгэлтэй утасны дугаар олдсонгүй.",
      });
      return;
    }

    setSaving(true);
    try {
      await api.forgotPassword({ phoneNumber: user.phoneNumber });
      setMessage({
        type: "success",
        text: `${user.phoneNumber} дугаар руу баталгаажуулах код илгээлээ.`,
      });
      setIsPasswordOtpSent(true);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof ApiError
            ? error.message
            : "Баталгаажуулах код илгээж чадсангүй.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyPasswordOtp = async () => {
    if (!/^\d{4}$/.test(passwordOtp)) {
      setMessage({ type: "error", text: "OTP код 4 оронтой байна." });
      return;
    }

    setSaving(true);
    try {
      const response = await api.verifyForgotOtp({
        phoneNumber: user?.phoneNumber,
        code: passwordOtp,
      });
      setPasswordResetToken(response?.data?.resetToken || "");
      setMessage({
        type: "success",
        text: "Код баталгаажлаа. Одоо шинэчлэх товчийг дарж нууц үгээ хадгална уу.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof ApiError
            ? error.message
            : "Баталгаажуулах код буруу байна.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (!passwordResetToken) {
      setMessage({
        type: "error",
        text: "Эхлээд OTP кодоо баталгаажуулна уу.",
      });
      return;
    }

    setSaving(true);
    try {
      await api.resetPassword({
        resetToken: passwordResetToken,
        password: form.newPassword.trim(),
        confirmPassword: form.confirmPassword.trim(),
      });

      setForm((prev) => ({ ...prev, newPassword: "", confirmPassword: "" }));
      setPasswordOtp("");
      setPasswordResetToken("");
      setIsPasswordOtpSent(false);
      setActiveEditSection(null);
      setMessage({
        type: "success",
        text: "Нууц үг амжилттай шинэчлэгдлээ.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof ApiError
            ? error.message
            : "Нууц үг шинэчлэхэд алдаа гарлаа.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-xs font-semibold text-slate-400">
          Уншиж байна...
        </div>
      </div>
    );
  }

  const hasDashboard = [
    "ADMIN",
    "ADMIN_PANEL",
    "DRIVER",
    "TOKEN_MANAGER",
    "HR",
    "SUPERADMIN",
  ].includes(user?.role) || canReviewLeaveRequests;

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 font-sans text-slate-900 antialiased sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* error msg */}
        {errorMessage && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
            {errorMessage}
          </div>
        )}

        {/* info popup / alert */}
        {message.text && (
          <div
            className={`mb-4 flex items-center justify-between rounded-lg border p-3.5 text-xs transition-all ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <span>{message.text}</span>
            <button
              onClick={() => setMessage({ type: "", text: "" })}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Main content */}
        <div className="grid min-w-0 gap-6 lg:grid-cols-12">
          {/* Sidebar */}
          <div
            className={`min-w-0 ${
              hasDashboard ? "lg:col-span-4" : "lg:col-span-3"
            }`}
          >
            <ProfileSidebar
              user={user}
              merchOrders={merchOrders}
              form={form}
              setForm={setForm}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              canReviewLeaveRequests={canReviewLeaveRequests}
              isMobileNavigationOpen={isMobileNavigationOpen}
              setIsMobileNavigationOpen={setIsMobileNavigationOpen}
            />
          </div>

          {/* Right content  */}
          <main
            className={`${
              isMobileNavigationOpen ? "hidden lg:block" : "block"
            } min-w-0 ${hasDashboard ? "lg:col-span-8" : "lg:col-span-9"}`}
          >
            <button
              type="button"
              onClick={() => setIsMobileNavigationOpen(true)}
              className="mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm lg:hidden"
            >
              <ArrowLeft size={14} />
              Буцах
            </button>
            {activeTab === "profile" && (
              <div className="space-y-0 mt-0.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                {/* huwiin medeele */}
                <section className="overflow-hidden">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-slate-900">
                      Миний мэдээлэл
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Хувийн мэдээлэл, ажилын байр, холбоо барих мэдээлэл
                    </p>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {/* FULL NAME */}
                    <div className="px-1 py-4 transition hover:bg-slate-50/50">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <div className="flex min-w-0 items-center gap-3.5">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                            <UserRound size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                              Овог нэр
                            </p>
                            <p className="`break-words text-sm font-medium text-slate-900">
                              {user?.lastName} {user?.firstName}
                            </p>
                          </div>
                        </div>
                        {activeEditSection !== "info" && (
                          <button
                            type="button"
                            onClick={() => setActiveEditSection("info")}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                          >
                            <Pencil size={13} />
                            Засах
                          </button>
                        )}
                      </div>

                      {/* edit mode*/}
                      {activeEditSection === "info" && (
                        <div className="mt-4 space-y-3.5 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <label className="text-xs font-medium text-slate-600">
                                Овог
                              </label>
                              <input
                                type="text"
                                value={form.lastName}
                                onChange={(e) =>
                                  setForm((prev) => ({
                                    ...prev,
                                    lastName: e.target.value,
                                  }))
                                }
                                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-normal text-slate-900 outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-slate-600">
                                Нэр
                              </label>
                              <input
                                type="text"
                                value={form.firstName}
                                onChange={(e) =>
                                  setForm((prev) => ({
                                    ...prev,
                                    firstName: e.target.value,
                                  }))
                                }
                                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-normal text-slate-900 outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                              />
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2">
                            <div>
                              <label className="text-xs font-medium text-slate-600">
                                Утасны дугаар
                              </label>
                              <input
                                type="text"
                                value={form.phoneNumber}
                                onChange={(e) =>
                                  setForm((prev) => ({
                                    ...prev,
                                    phoneNumber: e.target.value,
                                  }))
                                }
                                className="mt-1 w-full rounded-md  bg-white px-3 py-1.5 text-sm font-normal text-slate-900 outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                              />
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="profile-image-input"
                              className="group mt-2 flex w-fit cursor-pointer flex-col items-center gap-2"
                            >
                              {profileImagePreview || user?.profileImage ? (
                                <img
                                  src={profileImagePreview || user.profileImage}
                                  alt="Профайл зургийн урьдчилан харах"
                                  className="size-24 rounded-full border-2 border-slate-200 object-cover transition group-hover:border-blue-500"
                                />
                              ) : (
                                <span className="flex size-24 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white transition group-hover:bg-blue-700">
                                  {(form.firstName || form.lastName || "Х")
                                    .trim()
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              )}
                              <span className="text-xs font-medium text-blue-600 group-hover:text-blue-700">
                                Зураг солих
                              </span>
                            </label>
                            <input
                              id="profile-image-input"
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                              onChange={handleProfileImageChange}
                              className="sr-only"
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="rounded-md border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                              Цуцлах
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveInfo}
                              disabled={saving}
                              className="rounded-md bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                            >
                              {saving ? "Хадгалж байна..." : "Хадгалах"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Number*/}
                    <div className="flex min-w-0 items-center gap-4 px-1 py-4 transition hover:bg-slate-50/50">
                      <div className="flex min-w-0 items-center gap-3.5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                          <Phone size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                            Утасны дугаар
                          </p>
                          <p className="`break-words` text-sm font-medium text-slate-900">
                            {user?.phoneNumber || "Бүртгэгдээгүй"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex min-w-0 items-center gap-4 px-1 py-4 transition hover:bg-slate-50/50">
                      <div className="flex min-w-0 items-center gap-3.5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                          <Hash size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                            SAP дугаар
                          </p>
                          <p className="`break-words` text-sm font-medium text-slate-900">
                            {user?.sapId || "Бүртгэгдээгүй"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex min-w-0 items-center gap-4 px-1 py-4 transition hover:bg-slate-50/50">
                      <div className="flex min-w-0 items-center gap-3.5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                          <BriefcaseBusiness size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                            Төслийн нэр
                          </p>
                          <p className="`break-words` text-sm font-medium text-slate-900">
                            {user?.ProjectName ||
                              user?.projectName ||
                              "Бүртгэгдээгүй"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white">
                  <div className="px-1 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                          <KeyRound size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            Нууц үг
                          </p>
                          <p className="text-xs text-slate-500">
                            Бүртгэлтэй нууц үгээ шинэчлэх
                          </p>
                        </div>
                      </div>

                      {activeEditSection !== "password" && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveEditSection("password");
                            setMessage({ type: "", text: "" });
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                          Солих
                        </button>
                      )}
                    </div>

                    {activeEditSection === "password" && (
                      <div className="mt-4 space-y-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="text-xs font-medium text-slate-700">
                              Шинэ нууц үг
                            </label>
                            <input
                              type="password"
                              placeholder="••••••••"
                              value={form.newPassword}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  newPassword: e.target.value,
                                }))
                              }
                              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-700">
                              Шинэ нууц үг давтах
                            </label>
                            <input
                              type="password"
                              placeholder="••••••••"
                              value={form.confirmPassword}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  confirmPassword: e.target.value,
                                }))
                              }
                              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                            />
                          </div>
                        </div>

                        {/* OTP Verification */}
                        {isPasswordOtpSent && !passwordResetToken && (
                          <div className="rounded-md border border-slate-200 bg-white p-3.5 shadow-sm">
                            <p className="text-xs font-medium text-slate-700">
                              {user?.phoneNumber} дугаарт очсон 4 оронтой кодыг
                              оруулна уу:
                            </p>
                            <div className="mt-2.5 flex items-center gap-2">
                              <input
                                type="text"
                                maxLength={4}
                                value={passwordOtp}
                                onChange={(e) =>
                                  setPasswordOtp(
                                    e.target.value
                                      .replace(/\D/g, "")
                                      .slice(0, 4),
                                  )
                                }
                                placeholder="0000"
                                className="w-28 rounded-md border border-slate-300 bg-slate-50 px-3 py-1 text-center text-sm font-bold tracking-widest text-slate-900 outline-none focus:border-slate-800"
                              />
                              <button
                                type="button"
                                onClick={handleVerifyPasswordOtp}
                                disabled={saving || passwordOtp.length !== 4}
                                className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                              >
                                {saving ? "Шалгаж байна..." : "Баталгаажуулах"}
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="rounded-md border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Цуцлах
                          </button>

                          {!isPasswordOtpSent && (
                            <button
                              type="button"
                              onClick={handleRequestPasswordReset}
                              disabled={saving}
                              className="rounded-md bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                            >
                              {saving
                                ? "Код илгээж байна..."
                                : "Код авч үргэлжлүүлэх"}
                            </button>
                          )}

                          {passwordResetToken && (
                            <button
                              type="button"
                              onClick={handleSavePassword}
                              disabled={saving}
                              className="rounded-md bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                            >
                              {saving
                                ? "Шинэчилж байна..."
                                : "Шинэ нууц үг хадгалах"}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}

            {/* DASHBOARD TAB */}
            {activeTab === "dashboard" && (
              <div className="space-y-4">
                {canReviewLeaveRequests && <LeaveRequestsReviewPanel />}
                {user?.role === "DRIVER" && <DriverDashboardContent embedded />}
                {user?.role === "ADMIN_PANEL" && <AdminPanel />}
                {user?.role === "HR" && <HrDashboardPage embedded />}
                {user?.role === "ADMIN" && (
                  <AdminDashboard currentUser={user} />
                )}
              </div>
            )}

            {/* SALARY TAB */}
            {activeTab === "salary" && <SalaryCalc />}

            {/* FEEDBACK TAB */}
            {activeTab === "feedback" && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <FeedbackPage />
              </div>
            )}

            {/* LEAVE REQUEST TAB */}
            {activeTab === "leave-request" && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <LeaveRequestPage />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
