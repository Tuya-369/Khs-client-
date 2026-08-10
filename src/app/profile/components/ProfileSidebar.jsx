"use client";

import { CalendarDays, Camera, Pencil } from "lucide-react";
import { useRef, useState } from "react";
import ProfileCalendar from "./ProfileCalendar";
import { getProfileInitials } from "../helpers";

const roleLabels = {
  ADMIN: "Админ",
  ADMIN_PANEL: "Admin Panel",
  TOKEN_MANAGER: "Токен менежер",
  DRIVER: "Механикч",
};

export default function ProfileSidebar({
  user,
  form,
  setForm,
  isEditing,
  setIsEditing,
  saving,
  handleSave,
  handleAvatarChange,
}) {
  const avatarInputRef = useRef(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const displayName =
    `${form.lastName} ${form.firstName}`.trim() || "Хэрэглэгч";

  const cancelEditing = () => {
    setForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phoneNumber: user?.phoneNumber || "",
      profileImage: user?.profileImage || user?.avatarUrl || "",
    });
    setIsEditing(false);
  };

  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:p-5">
      <div className="flex items-start gap-2.5 sm:gap-3">
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
        <button
          type="button"
          aria-label="Профайл зураг солих"
          onClick={() => avatarInputRef.current?.click()}
          className="group relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-slate-100 text-sm font-bold text-slate-600"
        >
          {form.profileImage || user?.profileImage || user?.avatarUrl ? (
            <img
              src={form.profileImage || user?.profileImage || user?.avatarUrl}
              alt={displayName}
              className="size-full object-cover"
            />
          ) : (
            getProfileInitials({ ...user, ...form })
          )}
          <span className="absolute inset-0 hidden place-items-center bg-slate-900/50 text-white group-hover:grid">
            <Camera size={16} />
          </span>
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-bold text-slate-900 sm:text-base">
            {displayName}
          </h1>
          <span className="mt-1 inline-flex rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
            {roleLabels[user?.role] || "Ажилтан"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Календар нээх"
            aria-expanded={isCalendarOpen}
            onClick={() => setIsCalendarOpen(true)}
            className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          >
            <CalendarDays size={16} />
          </button>
          <button
            type="button"
            aria-label="Профайл засах"
            onClick={() => (isEditing ? cancelEditing() : setIsEditing(true))}
            className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <Pencil size={15} />
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="space-y-3 border-b border-slate-200 py-4 sm:py-5">
          {[
            ["lastName", "Овог"],
            ["firstName", "Нэр"],
            ["phoneNumber", "Утас"],
          ].map(([field, label]) => (
            <label
              key={field}
              className="block text-xs font-medium text-slate-600"
            >
              {label}
              <input
                value={form[field]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [field]: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
              />
            </label>
          ))}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-md bg-slate-900 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {saving ? "Хадгалж байна..." : "Хадгалах"}
          </button>
        </div>
      )}

      <div className="mt-4 hidden lg:mt-5 lg:block">
        <ProfileCalendar />
      </div>

      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          isCalendarOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!isCalendarOpen}
      >
        <button
          type="button"
          aria-label="Календар хаах"
          onClick={() => setIsCalendarOpen(false)}
          className={`absolute inset-0 bg-slate-950/30 transition-opacity duration-300 ${
            isCalendarOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Төлөвлөгөөний календар"
          className={`absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-xl bg-white px-5 pb-7 pt-3 shadow-2xl transition-transform duration-300 ease-out ${
            isCalendarOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-slate-200" />
          <ProfileCalendar onClose={() => setIsCalendarOpen(false)} />
        </div>
      </div>
    </aside>
  );
}
