"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronRight,
  FileText,
  Gauge,
  GraduationCap,
  LogOut,
  Mail,
  ShoppingBag,
  UserRound,
  Wallet,
} from "lucide-react";
import { api } from "@/lib/api";
import { clearSession, getAccessToken } from "@/lib/session";
import ProfileCalendar from "./ProfileCalendar";

const roleLabels = {
  ADMIN: "Худалдан авалтын менежер",
  ADMIN_PANEL: "Админ",
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
  },
  {
    label: "Миний мэдээлэл",
    icon: UserRound,
    tab: "profile",
  },
  {
    label: "Баримт бичиг",
    icon: Mail,
    href: "/file",
  },
  {
    label: "Санал хүсэлт",
    icon: FileText,
    tab: "feedback",
  },
  {
    label: "Цалин тооцоолох",
    icon: Wallet,
    tab: "salary",
  },
  {
    label: "Бүтээгдэхүүн",
    icon: ShoppingBag,
    href: "/merch",
  },
  {
    label: "Сургалт",
    icon: GraduationCap,
    href: "/GraduationCap",
  },
];

export default function ProfileSidebar({
  user,
  form,
  setForm,
  setActiveTab,
  activeTab,
  isMobileNavigationOpen,
  setIsMobileNavigationOpen,
}) {
  const router = useRouter();

  const displayName =
    `${form.lastName} ${form.firstName}`.trim() || "Хэрэглэгч";
  const mobileNavigationItems = navigationItems.filter(
    ({ roles }) => !roles || roles.includes(user?.role),
  );
  const mobileMenuItems = [
    ...mobileNavigationItems,
    { label: "Төлөвлөгөө", icon: CalendarDays, href: "/calendar" },
  ];

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
    setIsMobileNavigationOpen?.(false);
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
          <div
            className="flex size-10 items-center justify-center rounded-full bg-linear-to-tr from-indigo-600 to-violet-500 bg-cover bg-center text-white font-bold text-sm shadow-md shadow-indigo-100 shrink-0"
            style={
              user?.profileImage
                ? { backgroundImage: `url(${user.profileImage})` }
                : undefined
            }
          >
            {!user?.profileImage && displayName.charAt(0)}
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
            aria-label="Гарах"
            onClick={handleLogout}
            className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 active:bg-slate-100 transition"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* MOBILE CONTENT NAVIGATION */}
      <nav
        className={`mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:hidden ${
          isMobileNavigationOpen ? "block" : "hidden"
        }`}
      >
        {mobileMenuItems.map(({ label, icon: Icon, href, tab }) => {
          const isActive = tab && activeTab === tab;
          const rowClass = `flex min-h-12 w-full items-center gap-3 border-b border-slate-100 px-4 text-left text-xs font-medium last:border-b-0 ${
            isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-700"
          }`;

          if (href) {
            return (
              <Link
                key={label}
                href={href}
                onClick={() => setIsMobileNavigationOpen?.(false)}
                className={rowClass}
              >
                <Icon size={16} strokeWidth={1.8} />
                <span>{label}</span>
                <ChevronRight size={15} className="ml-auto text-slate-400" />
              </Link>
            );
          }

          return (
            <button
              key={label}
              type="button"
              onClick={() => handleNavigation(tab)}
              className={rowClass}
            >
              <Icon size={16} strokeWidth={1.8} />
              <span>{label}</span>
              <ChevronRight size={15} className="ml-auto text-slate-400" />
            </button>
          );
        })}
      </nav>

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
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-600 bg-cover bg-center text-sm font-bold text-white shadow-sm"
              style={
                user?.profileImage
                  ? { backgroundImage: `url(${user.profileImage})` }
                  : undefined
              }
              aria-label="Профайл зураг"
            >
              {!user?.profileImage && displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-sm font-bold text-slate-900">
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
    </>
  );
}
