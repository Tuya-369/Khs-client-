"use client";
import React, { useEffect, useState } from "react";
import { Bell, CheckCheck, ShoppingBag, User, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ShopyBag from "./ShopyBag";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import { clearSession, getAccessToken } from "@/lib/session";
import { useProfile } from "@/context/ProfileContext";

export default function Header() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(getAccessToken()),
  );
  const { totalItems } = useCart();
  const { profileUser, updateProfileUser } = useProfile();
  const profileInitial = (
    profileUser?.firstName ||
    profileUser?.lastName ||
    "Х"
  )
    .trim()
    .charAt(0)
    .toUpperCase();

  const handleLogout = async () => {
    const token = getAccessToken();

    try {
      await api.logout(token || undefined);
    } catch {
    } finally {
      clearSession();
      updateProfileUser(null);
      setIsAuthenticated(false);
      router.push("/auth");
    }
  };

  const handleUserIconClick = () => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }

    router.push("/profile");
  };

  const loadNotifications = async () => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const response = await api.getNotifications(token);
      setNotifications(response?.data?.notifications || []);
      setUnreadCount(response?.data?.unreadCount || 0);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const initialRefreshTimer = window.setTimeout(loadNotifications, 0);
    const refreshTimer = window.setInterval(loadNotifications, 30000);
    return () => {
      window.clearTimeout(initialRefreshTimer);
      window.clearInterval(refreshTimer);
    };
  }, [isAuthenticated]);

  const handleNotificationClick = async (notification) => {
    const token = getAccessToken();
    if (token && !notification.isRead) {
      try {
        await api.markNotificationRead(token, notification.id);
        setNotifications((items) =>
          items.map((item) =>
            item.id === notification.id ? { ...item, isRead: true } : item,
          ),
        );
        setUnreadCount((count) => Math.max(0, count - 1));
      } catch {
        return;
      }
    }

    setIsNotificationOpen(false);
    if (notification.href) router.push(notification.href);
  };

  const markAllNotificationsRead = async () => {
    const token = getAccessToken();
    if (!token || unreadCount === 0) return;

    try {
      await api.markAllNotificationsRead(token);
      setNotifications((items) =>
        items.map((item) => ({ ...item, isRead: true })),
      );
      setUnreadCount(0);
    } catch {
      // Keep the current UI state when the server update fails.
    }
  };

  const formatNotificationTime = (createdAt) => {
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("mn-MN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full h-20 bg-neutral-100/40 backdrop-blur-xl border-b border-yellow-500 flex items-center justify-between px-6 md:px-12">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Logo"
            width={101}
            height={40}
            priority
          />
        </Link>

        <nav className="hidden lg:flex items-center space-x-10 text-xs font-bold tracking-widest text-gray-600 uppercase">
          <Link href="/" className="hover:text-yellow-500 transition-colors">
            Буцах
          </Link>

          <Link
            href="/merch"
            className="hover:text-yellow-500 transition-colors"
          >
            Бүтээгдэхүүн
          </Link>

          <Link
            href="/file"
            className="hover:text-yellow-500 transition-colors"
          >
            Баримт бичиг
          </Link>
          <Link
            href="/GraduationCap"
            className="hover:text-yellow-500 transition-colors"
          >
            Сургалт
          </Link>
        </nav>

        <div className="flex items-center space-x-5 text-gray-700 relative">
          {isAuthenticated && (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsNotificationOpen((isOpen) => !isOpen);
                  if (!isNotificationOpen) loadNotifications();
                }}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white hover:text-black"
                aria-label="Мэдэгдэл"
                aria-expanded={isNotificationOpen}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-bold text-slate-900">Мэдэгдэл</p>
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      disabled={unreadCount === 0}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <CheckCheck size={15} />
                      Бүгдийг унших
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length ? (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50 ${
                            notification.isRead ? "bg-white" : "bg-amber-50/70"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {!notification.isRead && (
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                            )}
                            <div className={notification.isRead ? "pl-4" : ""}>
                              <p className="text-xs font-bold text-slate-800">
                                {notification.title}
                              </p>
                              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                                {notification.message}
                              </p>
                              <p className="mt-1.5 text-[10px] font-medium text-slate-400">
                                {formatNotificationTime(notification.createdAt)}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="px-4 py-8 text-center text-xs text-slate-500">
                        Одоогоор мэдэгдэл байхгүй байна.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={handleUserIconClick}
              className="p-1 hover:text-black transition-colors"
              aria-label="User menu"
            >
              {isAuthenticated ? (
                profileUser?.profileImage ? (
                  <img
                    src={profileUser.profileImage}
                    alt="Профайл зураг"
                    className="size-8 rounded-full border border-yellow-500 object-cover"
                  />
                ) : (
                  <span className="flex size-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    {profileInitial}
                  </span>
                )
              ) : (
                <User size={20} />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="p-1 hover:text-black transition-colors relative"
            aria-label="Cart"
          >
            <ShoppingBag size={20} />
            <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          </button>

          <button
            className="lg:hidden p-1 hover:text-black transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="absolute top-20 left-0 w-full bg-neutral-100/80 backdrop-blur-xl border-b border-yellow-500 flex flex-col p-6 space-y-4 font-bold text-sm tracking-wide text-gray-700 lg:hidden shadow-lg animate-fade-in">
            <Link
              href="/"
              className="hover:text-black py-2 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Буцах
            </Link>

            <Link
              href="/merch"
              className="hover:text-black py-2 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Бүтээгдэхүүн
            </Link>
            <Link
              href="/GraduationCap"
              className="hover:text-black py-2 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Сургалт
            </Link>
            <Link
              href="/file"
              className="hover:text-black py-2 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Баримт бичиг
            </Link>
          </div>
        )}
      </header>

      <ShopyBag isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
