"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    sapId: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Нууц үг зөрүүтэй байна.");
      return;
    }

    setSubmitting(true);
    try {
      await api.register({
        sapId: formData.sapId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      });

      setSuccessMessage(
        "Бүртгэл амжилттай үүслээ. Нэвтрэх хуудас руу шилжиж байна...",
      );
      setTimeout(() => {
        router.push("/auth");
      }, 1200);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message || "Бүртгүүлэх үед алдаа гарлаа.");
      } else {
        setErrorMessage("Бүртгүүлэх үед алдаа гарлаа. Дахин оролдоно уу.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl md:grid-cols-2">
        <div className="relative hidden bg-neutral-900 md:block">
          <Image
            src="/Login.png"
            className="absolute inset-0 h-full w-full object-cover opacity-85"
            alt="Бүртгэл"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-neutral-950/90 via-neutral-950/20 to-transparent flex flex-col justify-end p-8">
            <p className="mt-2 text-xs text-neutral-300 leading-relaxed">
              <span className="font-semibold text-yellow-500 text-lg">
                Хаанзаа Сервис ХХК
              </span>
              -ийн системд тавтай морил.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-10 md:p-12 bg-white">
          <div className="w-full max-w-sm mx-auto space-y-5">
            <div className="text-center md:text-left">
              <Image
                src="/logo.png"
                alt="Khaanzaa Service"
                width={120}
                height={36}
                className="mx-auto mb-4 h-9 w-auto"
              />
            </div>

            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Овог
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Овог"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Нэр
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Нэр"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  SAP Дугаар
                </label>
                <input
                  type="text"
                  name="sapId"
                  required
                  value={formData.sapId}
                  onChange={handleChange}
                  placeholder="SAP-0000"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Утасны дугаар
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="99******"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Нууц үг
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Баталгаажуулах
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-yellow-400 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all mt-3"
              >
                {submitting ? "Түр хүлээнэ үү..." : "Бүртгүүлэх"}
              </button>

              {errorMessage && (
                <p className="text-xs text-rose-600 font-medium">
                  {errorMessage}
                </p>
              )}

              {successMessage && (
                <p className="text-xs text-emerald-600 font-medium">
                  {successMessage}
                </p>
              )}
            </form>

            <div className="text-center md:text-left text-xs text-neutral-500 pt-2 border-t border-neutral-100">
              Хэрэглэгчийн бүртгэл байгаа юу?{" "}
              <Link
                href="/auth"
                className="font-semibold text-neutral-950 hover:text-yellow-600 transition-colors"
              >
                Нэвтрэх
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
