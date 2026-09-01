"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  FileText,
  Gauge,
  GraduationCap,
  LogOut,
  Mail,
  MoreHorizontal,
  ShoppingBag,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import ProfileCalendar from "./ProfileCalendar";
import { api } from "@/lib/api";
import { clearSession, getAccessToken } from "@/lib/session";

const roleLabels = {
  ADMIN: "Админ",
  ADMIN_PANEL: "Admin Panel",
  TOKEN_MANAGER: "Токен менежер",
  DRIVER: "Механикч",
  HR: "Хүний нөөц",
};

const navigationItems = [
  {
    label: "Хянах самбар",
    icon: Gauge,
    tab: "dashboard",
    roles: ["ADMIN", "ADMIN_PANEL", "DRIVER", "TOKEN_MANAGER", "HR"],
    color: "text-indigo-600",
  },
  {
    label: "Миний мэдээлэл",
    icon: UserRound,
    tab: "profile",
    color: "text-blue-600",
  },
  {
    label: "Баримт бичиг",
    icon: Mail,
    href: "/file",
    color: "text-emerald-600",
  },
  {
    label: "Санал хүсэлт",
    icon: FileText,
    tab: "feedback",
    color: "text-amber-600",
  },
  {
    label: "Цалин тооцоолох",
    icon: Wallet,
    tab: "salary",
    color: "text-violet-600",
  },
  {
    label: "Бүтээгдэхүүн",
    icon: ShoppingBag,
    href: "/merch",
    color: "text-rose-600",
  },
  {
    label: "Сургалт",
    icon: GraduationCap,
    href: "/GraduationCap",
    color: "text-cyan-600",
  },
];

export default function ProfileSidebar({
  user,
  form,
  setForm,
  setActiveTab,
  activeTab,
}) {
  const router = useRouter();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const displayName =
    `${form.lastName} ${form.firstName}`.trim() || "Хэрэглэгч";

  const handleLogout = async () => {
    try {
      await api.logout(getAccessToken() || undefined);
    } catch {
    } finally {
      clearSession();
      router.push("/auth");
    }
  };

  const handleNavigation = (tab) => {
    setActiveTab?.(tab);
    setIsMenuOpen(false);
    if (tab === "salary") {
      window.setTimeout(() => {
        document.getElementById("salary-calculator")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 0);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm lg:hidden mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-sm shadow-md shadow-indigo-100 shrink-0">
            {displayName.charAt(0)}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xs font-bold text-slate-900">
              {displayName}
            </h1>
            <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-600 border border-rose-100">
              {roleLabels[user?.role] || "Ажилтан"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            aria-label="Календар нээх"
            onClick={() => setIsCalendarOpen(true)}
            className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-indigo-600 bg-indigo-50/50 active:bg-indigo-100 transition"
          >
            <CalendarDays size={18} />
          </button>
          <button
            type="button"
            aria-label="Гарах"
            onClick={handleLogout}
            className="flex size-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 active:bg-rose-100 transition"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 py-2.5 px-3 flex justify-around items-center lg:hidden z-40 shadow-2xl">
        <button
          type="button"
          onClick={() => handleNavigation("profile")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
            activeTab === "profile"
              ? "text-indigo-600 scale-105"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <UserRound
            size={22}
            className={
              activeTab === "profile" ? "text-indigo-600" : "text-slate-400"
            }
          />
          <span>Профайл</span>
        </button>

        <Link
          href="/file"
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-emerald-600 transition"
        >
          <Mail size={22} className="text-emerald-500" />
          <span>Баримт</span>
        </Link>

        <button
          type="button"
          onClick={() => handleNavigation("feedback")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
            activeTab === "feedback"
              ? "text-indigo-600 scale-105"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <FileText
            size={22}
            className={
              activeTab === "feedback" ? "text-indigo-600" : "text-amber-500"
            }
          />
          <span>Санал</span>
        </button>

        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-400 active:text-indigo-600 transition"
        >
          <MoreHorizontal size={22} className="text-violet-500" />
          <span>Бусад</span>
        </button>
      </div>

      {/* MOBILE "MORE" BOTTOM SHEET MENU */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          isMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <button
          type="button"
          aria-label="Цэс хаах"
          onClick={() => setIsMenuOpen(false)}
          className={`absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity ${
            isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          className={`absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-white px-5 pb-8 pt-4 shadow-2xl transition-transform duration-300 ${
            isMenuOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Үндсэн цэс</h3>
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {navigationItems.map(
              ({ label, icon: Icon, href, tab, roles, color }) => {
                if (roles && !roles.includes(user?.role)) return null;

                const isActive = tab && activeTab === tab;
                const style = `flex items-center gap-3.5 rounded-2xl px-3.5 py-3 text-xs font-bold transition-all active:scale-[0.98] ${
                  isActive
                    ? "bg-indigo-50/80 text-indigo-700 border border-indigo-100 shadow-sm"
                    : "text-slate-700 hover:bg-slate-50"
                }`;

                if (href) {
                  return (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setIsMenuOpen(false)}
                      className={style}
                    >
                      <div
                        className={`p-2 rounded-xl bg-slate-100/80 ${color}`}
                      >
                        <Icon size={18} />
                      </div>
                      <span>{label}</span>
                    </Link>
                  );
                }

                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleNavigation(tab)}
                    className={style}
                  >
                    <div className={`p-2 rounded-xl bg-slate-100/80 ${color}`}>
                      <Icon size={18} />
                    </div>
                    <span>{label}</span>
                  </button>
                );
              },
            )}
          </div>
        </div>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside
        className={`
          hidden
          min-w-0
          flex-col
          overflow-y-auto
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm

          lg:sticky
          lg:inset-auto
          lg:top-6
          lg:z-auto
          lg:flex
          lg:h-[calc(100vh-3rem)]
          lg:w-auto
        `}
      >
        {/* PROFILE */}
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-sm font-bold text-slate-900 sm:text-base">
                {displayName}
              </h1>

              <span className="mt-1 inline-flex rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                {roleLabels[user?.role] || "Ажилтан"}
              </span>
            </div>
          </div>
        </div>

        {/* SIDEBAR NAVIGATION */}
        <nav aria-label="Профайлын үндсэн цэс" className="space-y-1 p-3">
          {navigationItems.map(({ label, icon: Icon, href, tab, roles }) => {
            if (roles && !roles.includes(user?.role)) return null;

            const isActive = tab && activeTab === tab;

            const content = (
              <>
                <Icon size={17} strokeWidth={1.8} />
                <span>{label}</span>
              </>
            );

            if (href) {
              return (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={label}
                type="button"
                onClick={() => handleNavigation(tab)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={17} strokeWidth={1.8} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* DESKTOP CALENDAR */}
        <div className="hidden px-3 lg:block">
          <div className="border-t border-slate-100 pt-3">
            <ProfileCalendar />
          </div>
        </div>

        {/* LOGOUT */}
        <div className="mt-auto border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          >
            <LogOut size={15} />
            Гарах
          </button>
        </div>
      </aside>

      {/* MOBILE CALENDAR DRAWER */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          isCalendarOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <button
          type="button"
          aria-label="Календар хаах"
          onClick={() => setIsCalendarOpen(false)}
          className={`absolute inset-0 bg-slate-950/30 transition-opacity ${
            isCalendarOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          className={`absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white px-5 pb-7 pt-3 shadow-2xl transition-transform duration-300 ${
            isCalendarOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200" />
          <ProfileCalendar onClose={() => setIsCalendarOpen(false)} />
        </div>
      </div>
    </>
  );
}
