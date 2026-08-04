"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Check, ChevronDown, Send, X } from "lucide-react";
import { ApiError, api } from "@/lib/api";
import { clearSession, getAccessToken } from "@/lib/session";
import DashboardProfileCard from "@/Component/common/DashboardProfileCard";

export function DriverDashboardContent({ embedded = false }) {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [activeCarId, setActiveCarId] = useState("");
  const [selectedPartIds, setSelectedPartIds] = useState([]);
  const [openCategoryIds, setOpenCategoryIds] = useState([]);
  const [damageImages, setDamageImages] = useState([]);
  const [issueDescription, setIssueDescription] = useState("");
  const [submittedOrders, setSubmittedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const activeCar = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === activeCarId),
    [vehicles, activeCarId],
  );

  const statusLabel = (status) => {
    if (status === "APPROVED") return "Батлагдсан";
    if (status === "PENDING") return "Хүлээгдэж буй";
    if (status === "REJECTED") return "Цуцлагдсан";
    return status;
  };

  const statusClass = (status) => {
    if (status === "APPROVED") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (status === "PENDING") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  const formatDate = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleString("mn-MN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const loadDashboardData = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      router.push("/auth");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const [meResponse, optionsResponse, myRequestsResponse] =
        await Promise.all([
          api.me(token),
          api.getDriverOptions(token),
          api.getMyRequests(token),
        ]);

      setProfile(meResponse?.data?.user || null);
      const loadedVehicles = optionsResponse?.data || [];
      setVehicles(loadedVehicles);
      setSubmittedOrders(myRequestsResponse?.data || []);

      if (loadedVehicles.length > 0) {
        setActiveCarId((prev) => prev || loadedVehicles[0].id);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSession();
        router.push("/auth");
        return;
      }

      setErrorMessage("Өгөгдөл татах үед алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadDashboardData();
    }, 0);
    const refreshTimer = window.setInterval(() => {
      void loadDashboardData();
    }, 15_000);

    return () => {
      window.clearTimeout(loadTimer);
      window.clearInterval(refreshTimer);
    };
  }, [loadDashboardData]);

  useEffect(() => {
    return () => {
      damageImages.forEach((image) => {
        URL.revokeObjectURL(image.url);
      });
    };
  }, [damageImages]);

  const handleDamageImagesUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (!imageFiles.length) {
      alert("Зөвхөн зураг файл сонгоно уу.");
      event.target.value = "";
      return;
    }

    const newImages = imageFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }));

    setDamageImages((prev) => [...prev, ...newImages]);
    event.target.value = "";
  };

  const removeDamageImage = (id) => {
    setDamageImages((prev) => {
      const found = prev.find((image) => image.id === id);
      if (found) {
        URL.revokeObjectURL(found.url);
      }

      return prev.filter((image) => image.id !== id);
    });
  };

  const togglePart = (partId) => {
    setSelectedPartIds((current) =>
      current.includes(partId)
        ? current.filter((id) => id !== partId)
        : [...current, partId],
    );
  };

  const toggleCategory = (categoryId) => {
    setOpenCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  };

  const submitOrder = async () => {
    if (!activeCarId) {
      setErrorMessage("Эхлээд тээврийн хэрэгслээ сонгоно уу.");
      return;
    }

    if (selectedPartIds.length === 0) {
      setErrorMessage("Дор хаяж нэг сэлбэг сонгоно уу.");
      return;
    }

    if (damageImages.length === 0) {
      setErrorMessage("Эвдэрсэн хэсгийн дор хаяж нэг зураг оруулна уу.");
      return;
    }

    if (issueDescription.trim().length < 5) {
      setErrorMessage("Тайлбар хамгийн багадаа 5 тэмдэгт байх ёстой.");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      router.push("/auth");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await api.createRequest(token, {
        vehicleId: activeCarId,
        partIds: selectedPartIds,
        description: issueDescription.trim(),
        images: damageImages.map((image) => image.file),
      });

      const meta = response?.meta;
      const uploaded = meta?.uploadedImages ?? 0;
      const skipped =
        (meta?.failedUploads ?? 0) + (meta?.oversizedSkipped ?? 0);

      setSuccessMessage(
        `Хүсэлт илгээгдлээ. Амжилттай зураг: ${uploaded}, алгассан зураг: ${skipped}.`,
      );

      damageImages.forEach((image) => URL.revokeObjectURL(image.url));
      setDamageImages([]);
      setIssueDescription("");
      setSelectedPartIds([]);
      setOpenCategoryIds([]);
      await loadDashboardData();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSession();
        router.push("/auth");
        return;
      }

      if (error instanceof ApiError) {
        setErrorMessage(error.message || "Хүсэлт илгээх үед алдаа гарлаа.");
      } else {
        setErrorMessage("Хүсэлт илгээх үед алдаа гарлаа.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={
        embedded
          ? "text-slate-800 antialiased"
          : "min-h-screen bg-[#f8fafc] text-slate-800 antialiased p-4 sm:p-8"
      }
    >
      <div className="max-w-3xl mx-auto space-y-5">
        {!embedded && (
          <DashboardProfileCard
            badge={profile?.firstName?.charAt(0)?.toUpperCase() || "D"}
            name={profile ? `${profile.lastName} ${profile.firstName}` : "..."}
            subtitle="Жолооч"
            sapId={profile?.sapId || "-"}
            totalLabel="Нийт хүсэлт"
            totalValue={submittedOrders.length}
          />
        )}

        {loading && (
          <div className="p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-500">
            Өгөгдөл ачаалж байна...
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Тээврийн хэрэгсэл болон сэлбэг
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Хуваарилагдсан машинаа сонгож, эвдрэлтэй сэлбэгийг тэмдэглэнэ үү.
            </p>
          </div>

          <div className="space-y-2.5">
            {vehicles.map((car) => (
              <div
                key={car.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveCarId(activeCarId === car.id ? "" : car.id);
                    setSelectedPartIds([]);
                    setOpenCategoryIds([]);
                  }}
                  className="w-full text-left p-4 sm:p-5 font-medium flex justify-between items-center hover:bg-slate-50/50 active:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-900 font-bold text-sm sm:text-base">
                      {car.name}
                    </span>
                    <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono font-semibold">
                      {car.plate}
                    </span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-slate-400 transition-transform ${activeCarId === car.id ? "rotate-180" : ""}`}
                  />
                </button>

                {activeCarId === car.id && (
                  <div className="p-4 space-y-2 bg-slate-50/50 border-t border-slate-100">
                    {car.partCategories?.map((category) => {
                      const isOpen = openCategoryIds.includes(category.id);

                      return (
                        <div
                          key={category.id}
                          className="rounded-lg border border-slate-200 bg-white overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() => toggleCategory(category.id)}
                            className="w-full flex items-center justify-between gap-3 px-3.5 py-3 text-left text-xs font-bold text-slate-800 hover:bg-slate-50"
                          >
                            <span>{category.name}</span>
                            <ChevronDown
                              size={16}
                              className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                            />
                          </button>
                          {isOpen && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-slate-100 p-3">
                              {category.parts.map((part) => {
                                const isSelected = selectedPartIds.includes(
                                  part.id,
                                );
                                return (
                                  <label
                                    key={part.id}
                                    className={`flex items-center gap-2.5 rounded-md border px-3 py-2.5 text-xs font-medium cursor-pointer transition ${isSelected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-700 hover:border-slate-400"}`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => togglePart(part.id)}
                                      className="sr-only"
                                    />
                                    <span
                                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${isSelected ? "border-white bg-white text-slate-900" : "border-slate-300"}`}
                                    >
                                      {isSelected && (
                                        <Check size={12} strokeWidth={3} />
                                      )}
                                    </span>
                                    {part.name}
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {!loading && vehicles.length === 0 && (
              <div className="p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-500">
                Танд оноогдсон тээврийн хэрэгсэл алга.
              </div>
            )}
          </div>
        </div>

        {activeCar && (
          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-md space-y-4 animate-in fade-in duration-200">
            <div>
              <h4 className="font-bold text-sm sm:text-base text-slate-900">
                Сонгосон:{" "}
                <span className="text-amber-600">{activeCar.name}</span>
              </h4>
            </div>

            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Эвдэрсэн хэсгийн зураг
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-slate-400 bg-slate-50/50 relative active:bg-slate-100 transition-colors">
                  <label className="block cursor-pointer w-full h-full py-2">
                    <span className="text-xs font-semibold text-slate-700 block">
                      <Camera size={15} className="inline mr-1" /> Зураг нэмэх
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Камер болон галерейгаас олон зураг боломжтой
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleDamageImagesUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {damageImages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-medium text-slate-500">
                      Сонгосон зураг ({damageImages.length})
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {damageImages.map((image) => (
                        <div
                          key={image.id}
                          className="relative rounded-lg overflow-hidden border border-slate-200 bg-white aspect-square"
                        >
                          <Image
                            src={image.url}
                            alt={image.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeDamageImage(image.id)}
                            className="absolute top-1 right-1 w-5 h-5 text-xs font-bold rounded-full bg-black/70 text-white flex items-center justify-center active:bg-black"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Эвдрэлийн тайлбар
                </label>
                <textarea
                  placeholder="Эвдрэл гарсан шалтгааныг энд тодорхой бичнэ үү..."
                  value={issueDescription}
                  onChange={(event) => setIssueDescription(event.target.value)}
                  className="w-full p-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 bg-slate-50/30 resize-none font-normal"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setSelectedPartIds([]);
                  setOpenCategoryIds([]);
                  setDamageImages([]);
                  setIssueDescription("");
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition"
              >
                Цуцлах
              </button>
              <button
                type="button"
                onClick={submitOrder}
                disabled={submitting}
                className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 active:scale-[0.99] transition shadow-sm"
              >
                {submitting ? (
                  "Илгээж байна..."
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <Send size={14} /> Хүсэлт илгээх
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2.5">
            <h3 className="text-base font-bold text-slate-900">
              Өгсөн захиалгууд
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Таны илгээсэн хүсэлтүүд болон тэдгээрийн шийдвэрлэлтийн төлөв.
            </p>
          </div>

          {submittedOrders.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              Одоогоор илгээсэн захиалга байхгүй байна.
            </p>
          ) : (
            <div className="space-y-2.5">
              {submittedOrders.map((order) => {
                return (
                  <div
                    key={order.id}
                    className="border border-slate-200 rounded-xl p-4 bg-slate-50/40 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="text-xs sm:text-sm font-bold text-slate-900">
                          {order.vehicle?.name || "-"}{" "}
                          <span className="text-slate-300 font-normal mx-1">
                            |
                          </span>{" "}
                          {order.requestParts
                            ?.map((item) => item.part?.name)
                            .filter(Boolean)
                            .join(", ") ||
                            order.part?.name ||
                            "Ерөнхий хүсэлт"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {formatDate(order.createdAt)}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide border shrink-0 ${statusClass(order.status)}`}
                      >
                        {statusLabel(order.status)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 leading-relaxed font-normal">
                      {order.description}
                    </p>

                    {order.status === "APPROVED" && (
                      <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-xs font-medium text-emerald-800">
                        Таны захиалгыг админ амжилттай баталлаа. Тантай эргэж
                        холбогдох болно.
                      </p>
                    )}

                    {order.images?.length > 0 && (
                      <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        📎 Хавсаргасан зураг:{" "}
                        <span className="text-slate-700 font-semibold">
                          {order.images?.length}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DriverDashboard() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile");
  }, [router]);

  return null;
}
