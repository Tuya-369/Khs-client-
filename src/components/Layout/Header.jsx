"use client";
import React, { useEffect, useRef, useState } from "react";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ShopyBag from "./ShopyBag";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import { clearSession, getAccessToken } from "@/lib/session";

export default function Header() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(getAccessToken()),
  );
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { totalItems } = useCart();

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    const token = getAccessToken();

    try {
      await api.logout(token || undefined);
    } catch {
    } finally {
      clearSession();
      setIsAuthenticated(false);
      setIsUserMenuOpen(false);
      router.push("/auth");
    }
  };

  const handleUserIconClick = () => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }

    setIsUserMenuOpen((prev) => !prev);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full h-20 bg-neutral-100/40 backdrop-blur-xl border-b border-yellow-500 flex items-center justify-between px-6 md:px-12">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Logo"
            width={120}
            height={40}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <nav className="hidden lg:flex items-center space-x-10 text-xs font-bold tracking-widest text-gray-600 uppercase">
          <Link href="/" className="hover:text-yellow-500 transition-colors">
            Home
          </Link>

          <Link
            href="/merch"
            className="hover:text-yellow-500 transition-colors"
          >
            Merchandise
          </Link>
          <Link
            href="/#contact"
            className="hover:text-yellow-500 transition-colors"
          >
            Contact
          </Link>

          <Link
            href="/file"
            className="hover:text-yellow-500 transition-colors"
          >
            File
          </Link>
        </nav>

        <div className="flex items-center space-x-5 text-gray-700 relative">
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={handleUserIconClick}
              className="p-1 hover:text-black transition-colors"
              aria-label="User menu"
            >
              <User size={20} />
            </button>

            {isUserMenuOpen && isAuthenticated && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
                <Link
                  href="/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                >
                  Logout
                </button>
              </div>
            )}
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
              Home
            </Link>

            <Link
              href="/merch"
              className="hover:text-black py-2 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Merchandise
            </Link>
            <Link
              href="/#contact"
              className="hover:text-black py-2 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/file"
              className="hover:text-black py-2 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              File
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  href="/profile"
                  className="hover:text-black py-2 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-left py-2 text-rose-600 hover:text-rose-700 transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </header>

      <ShopyBag isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
