"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError, api } from "@/lib/api";
import { clearSession, getAccessToken, saveSession } from "@/lib/session";
import {
  BriefcaseBusiness,
  KeyRound,
  Mail,
  Pencil,
  Phone,
  UserRound,
} from "lucide-react";

import SalaryCalc from "./components/SalaryCalc";
import AdminDashboard from "../admin-dashboard/components/AdminDashboard";
import AdminPanel from "../admin-dashboard/components/AdminPanel";
import ProfileSidebar from "./components/ProfileSidebar";
import { DriverDashboardContent } from "../driver-dashboard/page";
import FeedbackPage from "../feedback/Page";
import HrDashboardPage from "../hr-dashboard/page";

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState(null);
  const [merchOrders, setMerchOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordOtp, setPasswordOtp] = useState("");
  const [passwordResetToken, setPasswordResetToken] = useState("");
  const [isPasswordOtpSent, setIsPasswordOtpSent] = useState(false);

  const [form, setForm] = useState({
    lastName: "",
    firstName: "",
    email: "",
    phoneNumber: "",
    additionalPhoneNumber: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const profileTabs = ["dashboard", "profile", "salary", "feedback"];
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
        const response = await api.me(token);
        const currentUser = response?.data?.user || null;

        setUser(currentUser);

        try {
          const ordersResponse = await api.getMyMerchOrders(token);

          setMerchOrders(ordersResponse?.data || []);
        } catch {
          setMerchOrders([]);
        }

        setForm({
          lastName: currentUser?.lastName || "",
          firstName: currentUser?.firstName || "",
          email: currentUser?.email || "",
          phoneNumber: currentUser?.phoneNumber || "",
          additionalPhoneNumber:
            currentUser?.additionalPhoneNumber ||
            currentUser?.secondaryPhoneNumber ||
            "",
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
  }, [router]);

  const handleSave = async () => {
    const token = getAccessToken();

    if (!token) {
      router.replace("/auth");
      return;
    }

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setMessage({
        type: "error",
        text: "Шинэ нууц үг хоорондоо таарахгүй байна.",
      });
      return;
    }

    if (form.newPassword && !passwordResetToken && !isPasswordOtpSent) {
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
      return;
    }

    if (form.newPassword && !passwordResetToken) {
      setMessage({
        type: "error",
        text: "Эхлээд OTP кодоо баталгаажуулна уу.",
      });
      return;
    }

    setSaving(true);

    try {
      const payload = {
        lastName: form.lastName?.trim() || "",
        firstName: form.firstName?.trim() || "",
        email: form.email?.trim() || "",
        phoneNumber: form.phoneNumber?.trim() || "",
        additionalPhoneNumber: form.additionalPhoneNumber?.trim() || "",
      };

      if (form.newPassword?.trim() && passwordResetToken) {
        await api.resetPassword({
          resetToken: passwordResetToken,
          password: form.newPassword.trim(),
          confirmPassword: form.confirmPassword.trim(),
        });
      }

      const response = await api.updateProfile(token, payload);

      const responseUser = response?.data?.user || response?.data || {};

      const updatedUser = {
        ...user,
        ...responseUser,

        profileImage:
          responseUser?.profileImage ||
          responseUser?.avatarUrl ||
          payload.profileImage ||
          user?.profileImage ||
          user?.avatarUrl ||
          "",

        avatarUrl:
          responseUser?.avatarUrl ||
          responseUser?.profileImage ||
          payload.avatarUrl ||
          user?.avatarUrl ||
          user?.profileImage ||
          "",
      };

      setUser(updatedUser);

      setForm({
        lastName: updatedUser?.lastName || "",
        firstName: updatedUser?.firstName || "",
        email: updatedUser?.email || "",
        phoneNumber: updatedUser?.phoneNumber || "",
        additionalPhoneNumber:
          updatedUser?.additionalPhoneNumber ||
          updatedUser?.secondaryPhoneNumber ||
          "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordOtp("");
      setPasswordResetToken("");
      setIsPasswordOtpSent(false);

      saveSession(token, updatedUser);

      setIsEditing(false);

      setMessage({
        type: "success",
        text: "Амжилттай хадгалагдлаа.",
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
            : "Профайл хадгалах үед алдаа гарлаа.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setForm({
      lastName: user?.lastName || "",
      firstName: user?.firstName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      additionalPhoneNumber:
        user?.additionalPhoneNumber || user?.secondaryPhoneNumber || "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsEditing(false);
    setPasswordOtp("");
    setPasswordResetToken("");
    setIsPasswordOtpSent(false);
  };

  const handleVerifyPasswordOtp = async () => {
    if (!/^\d{4}$/.test(passwordOtp)) {
      setMessage({ type: "error", text: "OTP 4 оронтой байна." });
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
        text: "Код баталгаажлаа. Одоо хадгалах товчийг дарна уу.",
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="animate-pulse text-xs font-medium text-slate-400">
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
  ].includes(user?.role);

  return (
    <div className="bg-[#F8FAFC] p-3 text-slate-900 antialiased sm:p-5 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* ERROR */}
        {errorMessage && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {errorMessage}
          </div>
        )}

        {/* SUCCESS / ERROR MESSAGE */}
        {message.text && (
          <div
            className={`mb-4 rounded-xl border p-3 text-xs ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* MAIN LAYOUT */}
        <div className="grid min-w-0 gap-4 lg:grid-cols-12 lg:gap-6">
          {/* =========================================
              SIDEBAR
              Desktop дээр байрандаа тогтмол байна.
             ========================================= */}
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
            />
          </div>

          {/* =========================================
              RIGHT CONTENT
              Sidebar дээр дарсан зүйлээс хамаарч
              ЗӨВХӨН энэ хэсэг өөрчлөгдөнө.
             ========================================= */}
          <main
            className={`min-w-0 ${
              hasDashboard ? "lg:col-span-8" : "lg:col-span-9"
            }`}
          >
            {/* =====================================
                PROFILE
               ===================================== */}
            {activeTab === "profile" && (
              <div className="space-y-4">
                {/* Profile intro */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
                    <div>
                      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                        Хувийн мэдээлэл
                      </h2>
                    </div>

                    <button
                      type="button"
                      aria-label="Хувийн мэдээлэл засах"
                      onClick={() => setIsEditing((current) => !current)}
                      className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <Pencil size={16} />
                    </button>
                  </div>

                  <div className="grid border-t border-slate-100 sm:grid-cols-2">
                    {[
                      {
                        label: "Овог нэр",
                        field: "fullName",
                        value:
                          `${user?.lastName || ""} ${user?.firstName || ""}`.trim() ||
                          "-",
                        icon: UserRound,
                      },
                      {
                        label: "И-мэйл",
                        field: "email",
                        value: user?.email || "-",
                        icon: Mail,
                        type: "email",
                      },
                      {
                        label: "Утасны дугаар",
                        field: "phoneNumber",
                        value: user?.phoneNumber || "-",
                        icon: Phone,
                      },

                      {
                        label: "Шинэ нууц үг",
                        field: "newPassword",
                        value: "••••••••",
                        icon: KeyRound,
                        type: "password",
                        placeholder: "Шинэ нууц үг оруулах",
                      },
                      {
                        label: "Нууц үг баталгаажуулах",
                        field: "confirmPassword",
                        value: "••••••••",
                        icon: KeyRound,
                        type: "password",
                        placeholder: "Нууц үгээ давтан оруулах",
                      },
                    ].map(
                      (
                        { label, field, value, icon: Icon, type, placeholder },
                        index,
                      ) => (
                        <div
                          key={label}
                          className={`flex items-center gap-3 px-5 py-4 sm:px-6 ${
                            index > 0 ? "border-t border-slate-100" : ""
                          } ${index === 1 ? "sm:border-t" : ""} ${
                            index === 2 ? "sm:col-span-2 sm:border-t" : ""
                          }`}
                        >
                          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-500">
                            <Icon size={15} strokeWidth={1.8} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                              {label}
                            </p>
                            {isEditing &&
                            field !== "fullName" &&
                            field !== "role" ? (
                              <input
                                type={type || "text"}
                                value={form[field] || ""}
                                placeholder={placeholder || "Оруулах"}
                                onChange={(event) =>
                                  setForm((current) => ({
                                    ...current,
                                    [field]: event.target.value,
                                  }))
                                }
                                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                              />
                            ) : (
                              <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                                {value}
                              </p>
                            )}
                          </div>
                        </div>
                      ),
                    )}
                  </div>

                  {isEditing &&
                    form.newPassword &&
                    isPasswordOtpSent &&
                    !passwordResetToken && (
                      <div className="flex flex-col gap-3 border-t border-amber-100 bg-amber-50/50 px-5 py-4 sm:flex-row sm:items-end sm:px-6">
                        <label className="min-w-0 flex-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-700">
                          Бүртгэлтэй утасны дугаарлуу баталгаажуулах код
                          явууллаа.
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            value={passwordOtp}
                            onChange={(event) =>
                              setPasswordOtp(
                                event.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 4),
                              )
                            }
                            placeholder="0000"
                            className="mt-1 w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm font-semibold tracking-[0.3em] text-slate-800 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleVerifyPasswordOtp}
                          disabled={saving || passwordOtp.length !== 4}
                          className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {saving ? "Шалгаж байна..." : "Код баталгаажуулах"}
                        </button>
                      </div>
                    )}

                  {isEditing && (
                    <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 sm:px-6">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        Болих
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
                      >
                        {saving ? "Хадгалж байна..." : "Хадгалах"}
                      </button>
                    </div>
                  )}
                </section>

                {/* Orders */}
                {/* <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Миний захиалсан бараа
                    </h3>
                  </div>

                  {merchOrders.length === 0 ? (
                    <div className="mt-5 rounded-xl border border-dashed border-slate-200 p-8 text-center">
                      <p className="text-sm font-medium text-slate-500">
                        Одоогоор захиалга байхгүй байна.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-5 space-y-3">
                      {merchOrders.map((order, index) => (
                        <div
                          key={order?.id || order?._id || index}
                          className="rounded-xl border border-slate-100 p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold text-slate-900">
                              Захиалга #{index + 1}
                            </span>

                            <span className="text-xs text-slate-500">
                              {order?.status || "Хүлээгдэж буй"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section> */}
              </div>
            )}

            {/* =====================================
                DASHBOARD
               ===================================== */}
            {activeTab === "dashboard" && (
              <div className="space-y-4">
                {user?.role === "DRIVER" && <DriverDashboardContent embedded />}

                {user?.role === "ADMIN_PANEL" && <AdminPanel />}

                {user?.role === "HR" && <HrDashboardPage embedded />}

                {user?.role !== "DRIVER" &&
                  hasDashboard &&
                  user?.role !== "HR" &&
                  user?.role !== "ADMIN_PANEL" && (
                    <AdminDashboard currentUser={user} />
                  )}
              </div>
            )}

            {activeTab === "salary" && (
              <section className="space-y-5">
                <div className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-start gap-3">
                    <div>
                      <h2 className="mt-1 text-xl font-bold text-slate-900">
                        Цалин тооцоолох
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Ажилласан өдөр, ээлж болон бусад мэдээллээ оруулж
                        цалингаа тооцоолно уу.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <SalaryCalc />
                </div>
              </section>
            )}

            {activeTab === "feedback" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <FeedbackPage />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
