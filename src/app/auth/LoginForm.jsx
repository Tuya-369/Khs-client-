"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { saveSession } from "@/lib/session";

function ForgotPasswordForm({ onBack }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [stage, setStage] = useState("phone");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOtpSent || secondsLeft <= 0) return;
    const timer = window.setTimeout(
      () => setSecondsLeft((value) => value - 1),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [isOtpSent, secondsLeft]);

  const getErrorMessage = (error) =>
    error instanceof ApiError
      ? error.message
      : "Алдаа гарлаа. Дахин оролдоно уу.";

  const sendOtp = async () => {
    setSubmitting(true);
    setErrorMessage("");
    try {
      await api.forgotPassword({ phoneNumber });
      setIsOtpSent(true);
      setSecondsLeft(60);
      setStage("otp");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const verifyOtp = async () => {
    setSubmitting(true);
    setErrorMessage("");
    try {
      const response = await api.verifyForgotOtp({
        phoneNumber,
        code: otpCode,
      });
      setResetToken(response?.data?.resetToken || "");
      setStage("password");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const resetPassword = async () => {
    setSubmitting(true);
    setErrorMessage("");
    try {
      await api.resetPassword({ resetToken, password, confirmPassword });
      window.alert("Нууц үг амжилттай шинэчлэгдлээ.");
      onBack();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-yellow-500">
          Нууц үг сэргээх
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          Бүртгэлтэй утасны дугаараа ашиглан баталгаажуулна.
        </p>
      </div>

      {stage === "phone" && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-700">
              Утасны дугаар
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="99******"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
            />
          </div>
          <button
            type="button"
            disabled={submitting || !phoneNumber.trim()}
            onClick={sendOtp}
            className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-yellow-400 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Илгээж байна..." : "OTP код авах"}
          </button>
        </div>
      )}

      {stage === "otp" && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-700">
              6 оронтой OTP код
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otpCode}
              onChange={(event) =>
                setOtpCode(event.target.value.replace(/\D/g, ""))
              }
              placeholder="000000"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-center text-lg tracking-[0.35em] text-neutral-900 placeholder-neutral-400 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
            />
          </div>
          <button
            type="button"
            disabled={submitting || otpCode.length !== 6}
            onClick={verifyOtp}
            className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-yellow-400 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Шалгаж байна..." : "Код баталгаажуулах"}
          </button>
          <button
            type="button"
            disabled={submitting || secondsLeft > 0}
            onClick={sendOtp}
            className="w-full text-xs font-semibold text-neutral-600 hover:text-yellow-600 disabled:cursor-not-allowed disabled:text-neutral-400"
          >
            {secondsLeft > 0
              ? `Дахин илгээх (${secondsLeft} сек)`
              : "Дахин илгээх"}
          </button>
        </div>
      )}

      {stage === "password" && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-700">
              Шинэ нууц үг
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-700">
              Нууц үг давтах
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
            />
          </div>
          <button
            type="button"
            disabled={submitting || !password || !confirmPassword}
            onClick={resetPassword}
            className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-yellow-400 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Шинэчилж байна..." : "Нууц үг шинэчлэх"}
          </button>
        </div>
      )}

      {errorMessage && (
        <p className="text-xs font-medium text-rose-600">{errorMessage}</p>
      )}
      <button
        type="button"
        onClick={onBack}
        className="text-xs font-medium text-neutral-500 hover:text-yellow-600"
      >
        Нэвтрэх рүү буцах
      </button>
    </div>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const [loginData, setLoginData] = useState({
    sapId: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    try {
      const response = await api.login(loginData);
      const accessToken = response?.data?.accessToken;
      const user = response?.data?.user;

      if (!accessToken || !user) {
        throw new Error("Нэвтрэлтийн дараах өгөгдөл буруу байна.");
      }

      saveSession(accessToken, user);
      router.push("/");
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
            {isForgotPassword ? (
              <ForgotPasswordForm onBack={() => setIsForgotPassword(false)} />
            ) : (
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
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-xs font-medium text-neutral-500 hover:text-yellow-600 transition-colors"
                    >
                      Нууц үгээ мартсан
                    </button>
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
