"use client";
import React, { useState } from "react";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ShopyBag from "./ShopyBag";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { totalItems } = useCart();
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
          <a href="#" className="hover:text-yellow-500 transition-colors">
            Home
          </a>
          <a href="#" className="hover:text-yellow-500 transition-colors">
            About Us
          </a>
          <a href="#" className="hover:text-yellow-500 transition-colors">
            Merchandise
          </a>
          <a href="#" className="hover:text-yellow-500 transition-colors">
            Contact
          </a>
        </nav>

        <div className="flex items-center space-x-5 text-gray-700">
          <Link
            href="/auth"
            className="p-1 hover:text-black transition-colors"
            aria-label="Login"
          >
            <User size={20} />
          </Link>

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
            <a
              href="/"
              className="hover:text-black py-2 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </a>
            <a
              href="#"
              className="hover:text-black py-2 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </a>
            <a
              href="#"
              className="hover:text-black py-2 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Merchandise
            </a>
            <a
              href="#"
              className="hover:text-black py-2 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </a>
            <Link
              href="/auth"
              className="hover:text-black py-2 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
          </div>
        )}
      </header>

      <ShopyBag isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
