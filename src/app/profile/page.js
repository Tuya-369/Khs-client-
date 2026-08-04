"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ApiError, api } from "@/lib/api";
import { clearSession, getAccessToken, saveSession } from "@/lib/session";

import EditableField from "./components/EditableField";
import AdminDashboard from "./components/AdminDashboard";
import { getProfileInitials } from "./helpers";
import { DriverDashboardContent } from "../driver-dashboard/page";

export default function ProfilePage() {
  const router = useRouter();
  const avatarInputRef = useRef(null);

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

      // Data URL is for local preview; backend usually expects a persistent URL or separate upload API.
      if (form.profileImage && !String(form.profileImage).startsWith("data:")) {
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

  const hasDashboard = ["ADMIN", "DRIVER", "TOKEN_MANAGER"].includes(
    user?.role,
  );
  const confirmedMerchOrders = merchOrders.filter(
    (order) => order?.status === "CONFIRMED",
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 antialiased p-4 sm:p-6">
      <div
        className={`${hasDashboard ? "max-w-4xl" : "max-w-md"} mx-auto space-y-6`}
      >
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

        {/* Хэрэглэгчийн Профайл Карт */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div
            className="relative group cursor-pointer shrink-0"
            onClick={() => avatarInputRef.current?.click()}
          >
            <div className="relative w-16 h-16 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
              {form.profileImage ? (
                <Image
                  src={form.profileImage}
                  alt="Profile"
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-slate-500">
                  {getProfileInitials(user)}
                </span>
              )}
            </div>
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            className="hidden"
            onChange={handleAvatarChange}
          />

          <div className="flex-1 text-center sm:text-left space-y-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-base font-bold text-slate-900">{`${user?.lastName || ""} ${user?.firstName || ""}`}</h1>
                <p className="text-xs text-red-400 font-medium">
                  {user?.role === "ADMIN"
                    ? "Админ"
                    : user?.role === "TOKEN_MANAGER"
                      ? "Токен менежер"
                      : user?.role === "DRIVER"
                        ? "Жолооч"
                        : "Ажилтан"}
                </p>
              </div>
              <button
                onClick={() => {
                  if (isEditing) {
                    setForm({
                      lastName: user?.lastName || "",
                      firstName: user?.firstName || "",
                      phoneNumber: user?.phoneNumber || "",
                      profileImage: user?.profileImage || user?.avatarUrl || "",
                    });
                    setMessage({ type: "", text: "" });
                  }
                  setIsEditing(!isEditing);
                }}
                className="text-xs font-semibold text-slate-400 hover:text-slate-900 transition"
              >
                {isEditing ? "Болих" : "Засах"}
              </button>
            </div>

            <div className="pt-3 space-y-2">
              <EditableField
                label="Овог"
                value={form.lastName}
                onChange={(v) => setForm((p) => ({ ...p, lastName: v }))}
                isEditing={isEditing}
              />
              <EditableField
                label="Нэр"
                value={form.firstName}
                onChange={(v) => setForm((p) => ({ ...p, firstName: v }))}
                isEditing={isEditing}
              />
              <EditableField
                label="SAP ID"
                value={user?.sapId}
                isEditing={false}
              />
              <EditableField
                label="Утас"
                value={form.phoneNumber}
                onChange={(v) => setForm((p) => ({ ...p, phoneNumber: v }))}
                isEditing={isEditing}
              />
            </div>

            {isEditing && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="mt-3 w-full py-2 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition"
              >
                {saving ? "Хадгалж байна..." : "Хадгалах"}
              </button>
            )}
          </div>
        </div>

        {confirmedMerchOrders.length > 0 && (
          <section className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Таны батлагдсан бараа
              </h2>
              <p className="mt-1 text-xs text-emerald-700">
                Таны барааг баталлаа. Тантай удахгүй холбогдох болно.
              </p>
            </div>

            <div className="space-y-3">
              {confirmedMerchOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                    {order?.merchItem?.imageUrl ? (
                      <Image
                        src={order.merchItem.imageUrl}
                        alt={order.merchItem.title || "Merch"}
                        fill
                        sizes="56px"
                        unoptimized
                        className="object-contain"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-900">
                      {order?.merchItem?.title || "Бараа"}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Хэмжээ: {order?.size || "-"} | Өнгө: {order?.color || "-"}{" "}
                      | Тоо: {order?.qty ?? "-"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {user?.role === "DRIVER" && <DriverDashboardContent embedded />}
        {user?.role !== "DRIVER" && hasDashboard && (
          <AdminDashboard currentUser={user} />
        )}
      </div>
    </div>
  );
}
