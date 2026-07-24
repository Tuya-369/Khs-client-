"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Header from "@/Component/Layout/Header";
import Footer from "@/Component/Layout/Footer";
import { getAccessToken, getStoredUser } from "@/lib/session";

const HIDDEN_CHROME_PREFIXES = ["/auth", "/login", "/register"];
const PUBLIC_PREFIXES = ["/auth"];

export default function AppShell({ children }) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const normalizedPathname = pathname.toLowerCase();
  const [checked, setChecked] = useState(false);
  const hideChrome = HIDDEN_CHROME_PREFIXES.some((prefix) =>
    normalizedPathname.startsWith(prefix),
  );

  const getRouteByRole = (role) => {
    if (role === "ADMIN") return "/admin-dashboard";
    if (role === "DRIVER") return "/driver-dashboard";
    if (role === "TOKEN_MANAGER") return "/token-dashboard";
    return "/";
  };

  const getRequiredRoleByPath = (path) => {
    if (path.startsWith("/admin-dashboard")) return "ADMIN";
    if (path.startsWith("/driver-dashboard")) return "DRIVER";
    if (path.startsWith("/token-dashboard")) return "TOKEN_MANAGER";
    return null;
  };

  useEffect(() => {
    const isPublic = PUBLIC_PREFIXES.some((prefix) =>
      normalizedPathname.startsWith(prefix),
    );
    const token = getAccessToken();
    const user = getStoredUser();

    if (isPublic && token) {
      router.replace("/");
      return;
    }

    if (!isPublic && !token) {
      router.replace("/auth");
      return;
    }

    if (!isPublic && token && !user?.role) {
      router.replace("/auth");
      return;
    }

    const requiredRole = getRequiredRoleByPath(normalizedPathname);
    if (requiredRole && user?.role !== requiredRole) {
      router.replace(getRouteByRole(user?.role));
      return;
    }

    const checkedTimer = window.setTimeout(() => setChecked(true), 0);
    return () => window.clearTimeout(checkedTimer);
  }, [normalizedPathname, router]);

  if (
    !checked &&
    !PUBLIC_PREFIXES.some((prefix) => normalizedPathname.startsWith(prefix))
  ) {
    return <main className="flex-1" />;
  }

  if (hideChrome) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
