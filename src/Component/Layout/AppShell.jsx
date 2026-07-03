"use client";

import { usePathname } from "next/navigation";
import Header from "@/Component/Layout/Header";
import Footer from "@/Component/Layout/Footer";

const HIDDEN_CHROME_PREFIXES = ["/auth", "/login", "/register"];

export default function AppShell({ children }) {
  const pathname = usePathname() || "";
  const normalizedPathname = pathname.toLowerCase();
  const hideChrome = HIDDEN_CHROME_PREFIXES.some((prefix) =>
    normalizedPathname.startsWith(prefix),
  );

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
