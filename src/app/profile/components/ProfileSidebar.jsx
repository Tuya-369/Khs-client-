"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronRight,
  ClipboardList,
  FileText,
  Gauge,
  GraduationCap,
  LogOut,
  Mail,
  ShoppingBag,
  UserRound,
  Wallet,
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
};

const navigationItems = [
  {
    label: "Хянах самбар",
    icon: Gauge,
    tab: "dashboard",
  },
  {
    label: "Миний мэдээлэл",
    icon: UserRound,
    tab: "profile",
  },
  {
    label: "Цалин тооцоолох",
    icon: Wallet,
    tab: "salary",
  },

  {
    label: "Санал хүсэлт",
    icon: FileText,
    href: "/",
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

  {
    label: "Баримт бичиг",
    icon: Mail,
    href: "/file",
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    if (tab === "salary") {
      window.setTimeout(() => {
        document.getElementById("salary-calculator")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 0);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Sidebar цэс нээх"
        aria-expanded={isMobileMenuOpen}
        onClick={() => setIsMobileMenuOpen(true)}
        className="fixed left-0 top-1/2 z-40 grid size-9 -translate-y-1/2 place-items-center rounded-r-xl border border-l-0 border-slate-200 bg-white text-slate-700 shadow-md transition hover:bg-slate-50 lg:hidden"
      >
        <ChevronRight size={18} />
      </button>
      <button
        type="button"
        aria-label="Sidebar цэс хаах"
        onClick={() => setIsMobileMenuOpen(false)}
        className={`fixed inset-0 z-40 bg-slate-950/30 transition-opacity lg:hidden ${
          isMobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          h-screen
          w-[min(86vw,21rem)]
          min-w-0
          -translate-x-full
          flex-col
          overflow-y-auto
          rounded-r-2xl
          border border-l-0
          border-slate-200
          bg-white
          shadow-2xl
          transition-transform
          duration-300
          ${isMobileMenuOpen ? "translate-x-0" : ""}

          lg:sticky
          lg:inset-auto
          lg:top-6
          lg:z-auto
          lg:flex
          lg:h-[calc(100vh-3rem)]
          lg:w-auto
          lg:translate-x-0
          lg:rounded-2xl
          lg:border-l
          lg:shadow-sm
          lg:transition-none
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

            <div className="flex items-center gap-1">
              {/* MOBILE CALENDAR */}
              <button
                type="button"
                aria-label="Календар нээх"
                onClick={() => setIsCalendarOpen(true)}
                className="
                  grid
                  size-8
                  place-items-center
                  rounded-lg
                  text-slate-500
                  hover:bg-slate-100
                  hover:text-slate-900
                  lg:hidden
                "
              >
                <CalendarDays size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* SIDEBAR NAVIGATION */}
        <nav
          aria-label="Профайлын үндсэн цэс"
          className="
            space-y-1
            p-3
          "
        >
          {navigationItems.map(({ label, icon: Icon, href, tab }) => {
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
                  className="
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-xs
                      font-medium
                      text-slate-600
                      transition
                      hover:bg-slate-50
                      hover:text-slate-900
                    "
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
                className={`
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-left
                    text-xs
                    font-semibold
                    transition

                    ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }
                  `}
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
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-200
              px-3
              py-2.5
              text-xs
              font-semibold
              text-slate-600
              transition
              hover:border-rose-200
              hover:bg-rose-50
              hover:text-rose-700
            "
          >
            <LogOut size={15} />
            Гарах
          </button>
        </div>

        {/* MOBILE CALENDAR DRAWER */}
        <div
          className={`
            fixed
            inset-0
            z-50
            lg:hidden
            ${isCalendarOpen ? "pointer-events-auto" : "pointer-events-none"}
          `}
        >
          <button
            type="button"
            aria-label="Календар хаах"
            onClick={() => setIsCalendarOpen(false)}
            className={`
              absolute
              inset-0
              bg-slate-950/30
              transition-opacity
              ${isCalendarOpen ? "opacity-100" : "opacity-0"}
            `}
          />

          <div
            className={`
              absolute
              inset-x-0
              bottom-0
              max-h-[85vh]
              overflow-y-auto
              rounded-t-3xl
              bg-white
              px-5
              pb-7
              pt-3
              shadow-2xl
              transition-transform
              duration-300
              ${isCalendarOpen ? "translate-y-0" : "translate-y-full"}
            `}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200" />

            <ProfileCalendar onClose={() => setIsCalendarOpen(false)} />
          </div>
        </div>
      </aside>
    </>
  );
}
