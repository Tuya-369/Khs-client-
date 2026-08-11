"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, api } from "@/lib/api";
import { clearSession, getAccessToken, saveSession } from "@/lib/session";

import AdminDashboard from "../admin-dashboard/components/AdminDashboard";
import AdminPanel from "../admin-dashboard/components/AdminPanel";
import ProfileSidebar from "./components/ProfileSidebar";
import { DriverDashboardContent } from "../driver-dashboard/page";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [merchOrders, setMerchOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Профайл Тохиргооны State
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    lastName: "",
    firstName: "",
    phoneNumber: "",
    profileImage: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const initPage = async () => {
      const token = getAccessToken();
      if (!token) return router.replace("/auth");

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
          phoneNumber: currentUser?.phoneNumber || "",
          profileImage:
            currentUser?.profileImage || currentUser?.avatarUrl || "",
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

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Зөвхөн зургийн файл сонгоно уу." });
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "Зургийн хэмжээ 5MB-аас бага байх ёстой.",
      });
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, profileImage: reader.result }));
      setIsEditing(true);
      setMessage({ type: "", text: "" });
    };
    reader.onerror = () => {
      setMessage({ type: "error", text: "Зураг унших үед алдаа гарлаа." });
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleSave = async () => {
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
      };

      if (form.profileImage) {
        payload.profileImage = form.profileImage;
        payload.avatarUrl = form.profileImage;
      }

      const response = await api.updateProfile(token, payload);
      const updatedUser = response?.data?.user ||
        response?.data || { ...user, ...form };
      setUser(updatedUser);
      setForm({
        lastName: updatedUser?.lastName || "",
        firstName: updatedUser?.firstName || "",
        phoneNumber: updatedUser?.phoneNumber || "",
        profileImage: updatedUser?.profileImage || updatedUser?.avatarUrl || "",
      });
      saveSession(token, updatedUser);
      setIsEditing(false);
      setMessage({ type: "success", text: "Амжилттай хадгалагдлаа." });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-xs font-medium text-slate-400 animate-pulse">
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
    <div className="min-h-screen bg-[#F8FAFC] p-2 text-slate-900 antialiased sm:p-4 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-3 sm:space-y-4 lg:space-y-6">
        {errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {errorMessage}
          </div>
        )}

        {message.text && (
          <div
            className={`rounded-xl border p-3 text-xs ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid min-w-0 gap-3 lg:grid-cols-12 lg:gap-6">
          <div className="min-w-0 lg:col-span-4">
            <ProfileSidebar
              user={user}
              merchOrders={merchOrders}
              form={form}
              setForm={setForm}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              saving={saving}
              handleSave={handleSave}
              handleAvatarChange={handleAvatarChange}
            />
          </div>

          <main className="min-w-0 space-y-3 lg:col-span-8 lg:space-y-6">
            {user?.role === "DRIVER" && <DriverDashboardContent embedded />}
            {user?.role === "ADMIN_PANEL" && <AdminPanel />}
            {user?.role !== "DRIVER" &&
              hasDashboard &&
              user?.role !== "ADMIN_PANEL" && (
                <AdminDashboard currentUser={user} />
              )}
          </main>
        </div>
      </div>
    </div>
  );
}
