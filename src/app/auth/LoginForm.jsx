"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { saveSession } from "@/lib/session";

export default function LoginForm() {
  const router = useRouter();
  const [loginData, setLoginData] = useState({
    sapId: "",
    password: "",
  });
  const [otpData, setOtpData] = useState({
    code: "",
    otpToken: "",
    phone: "",
  });
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOtpChange = (e) => {
    const numbersOnly = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtpData((prev) => ({ ...prev, code: numbersOnly }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    try {
      const response = await api.login(loginData);
      const requiresOtp = response?.data?.requiresOtp;
      const otpToken = response?.data?.otpToken;

      if (requiresOtp && otpToken) {
        setAwaitingOtp(true);
        setOtpData({
          code: "",
          otpToken,
          phone: response?.data?.phone || "",
        });
        setInfoMessage(response?.data?.message || "OTP код утсанд илгээгдлээ.");
        return;
      }

      throw new Error("OTP баталгаажуулалт эхлүүлэхэд алдаа гарлаа.");
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Нэвтрэх үед алдаа гарлаа. Дахин оролдоно уу.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    try {
      const response = await api.verifyOtp({
        otpToken: otpData.otpToken,
        code: otpData.code,
      });

      const accessToken = response?.data?.accessToken;
      const user = response?.data?.user;

      if (!accessToken || !user) {
        throw new Error("OTP баталгаажуулалтын дараах өгөгдөл буруу байна.");
      }

      saveSession(accessToken, user);
      router.push("/");
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "OTP баталгаажуулах үед алдаа гарлаа. Дахин оролдоно уу.",
        );
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
            alt="Нэвтрэх"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="absolute inset-0 h-full w-full object-cover opacity-85"
          />

          <div className="absolute inset-0 flex flex-col justify-end p-8 bg-linear-to-t from-neutral-950/90 via-neutral-950/20 to-transparent">
            <h3 className="text-xl font-bold text-white">Дахин тавтай морил</h3>
            <p className="mt-2 text-xs text-neutral-300 leading-relaxed"></p>
          </div>
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-10 md:p-12 bg-white">
          <div className="w-full max-w-sm mx-auto space-y-6">
            <div className="text-center md:text-left">
              <Image
                src="/logo.png"
                alt="Khaanzaa Service"
                width={120}
                height={36}
                className="mx-auto mb-4 h-9 w-auto"
              />
              <h2 className="text-2xl font-bold tracking-tight text-yellow-500">
                Нэвтрэх
              </h2>
            </div>
            {!awaitingOtp ? (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    SAP Дугаар эсвэл Утас
                  </label>
                  <input
                    type="text"
                    name="sapId"
                    required
                    value={loginData.sapId}
                    onChange={handleChange}
                    placeholder="SAP-0000 эсвэл 99******"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-neutral-700">
                      Нууц үг
                    </label>
                    <a
                      href="#"
                      className="text-xs font-medium text-neutral-500 hover:text-yellow-600 transition-colors"
                    >
                      Нууц үгээ мартсан
                    </a>
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    value={loginData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-yellow-400 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all mt-2"
                >
                  {submitting ? "Түр хүлээнэ үү..." : "Нэвтрэх"}
                </button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleVerifyOtp}>
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-800">
                  {infoMessage || "OTP код илгээгдлээ."}
                  {otpData.phone ? ` (${otpData.phone})` : ""}
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    OTP код
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    value={otpData.code}
                    onChange={handleOtpChange}
                    placeholder="6 оронтой код"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || otpData.code.length !== 6}
                  className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-yellow-400 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all mt-2 disabled:opacity-60"
                >
                  {submitting ? "Шалгаж байна..." : "Код баталгаажуулах"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAwaitingOtp(false);
                    setOtpData({ code: "", otpToken: "", phone: "" });
                    setInfoMessage("");
                  }}
                  className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-all"
                >
                  Буцах
                </button>
              </form>
            )}

            {errorMessage && (
              <p className="text-xs text-rose-600 font-medium">
                {errorMessage}
              </p>
            )}

            <div className="text-center md:text-left text-xs text-neutral-500 pt-2 border-t border-neutral-100">
              Бүртгэл байхгүй юу?{" "}
              <Link
                href="/auth/register"
                className="font-semibold text-neutral-950 hover:text-yellow-600 transition-colors"
              >
                Шинэ бүртгэл үүсгэх
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
