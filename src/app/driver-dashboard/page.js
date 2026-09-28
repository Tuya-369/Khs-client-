"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, ChevronDown, Send, X } from "lucide-react";
import { ApiError, api } from "@/lib/api";
import { clearSession, getAccessToken } from "@/lib/session";
import DashboardProfileCard from "@/components/common/DashboardProfileCard";
import VehicleCategories from "./components/VehicleCategories";
import VehicleSelector from "./components/VehicleSelector";

const MAX_DAMAGE_IMAGES = 2;
const MAX_DAMAGE_IMAGE_SIZE = 20 * 1024 * 1024;
const ALLOWED_DAMAGE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export function DriverDashboardContent({ embedded = false }) {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [activeCarId, setActiveCarId] = useState("");
  const [selectedPartIds, setSelectedPartIds] = useState([]);
  const [openCategoryIds, setOpenCategoryIds] = useState([]);
  const [damageImages, setDamageImages] = useState([]);
  const [issueDescription, setIssueDescription] = useState("");
  const [submittedOrders, setSubmittedOrders] = useState([]);
  const [submittedOrdersOpen, setSubmittedOrdersOpen] = useState(false);
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
    if (status === "SEARCHING") return "Сэлбэг хайж байгаа";
    if (status === "NOT_FOUND") return "Сэлбэг олоогүй";
    if (status === "COMPLETED") return "Гүйцэтгэсэн";
    return status;
  };

  const statusClass = (status) => {
    if (status === "APPROVED") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (status === "PENDING") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (status === "SEARCHING") {
      return "bg-sky-50 text-sky-700 border-sky-200";
    }
    if (status === "COMPLETED") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
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

    return () => {
      window.clearTimeout(loadTimer);
    };
  }, [loadDashboardData]);

  useEffect(() => {
    return () => {
      damageImages.forEach((image) => {
        URL.revokeObjectURL(image.url);
      });
    };
  }, [damageImages]);

  useEffect(() => {
    if (!successMessage) return undefined;

    const successTimer = window.setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    return () => {
      window.clearTimeout(successTimer);
    };
  }, [successMessage]);

  const handleDamageImagesUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const availableSlots = MAX_DAMAGE_IMAGES - damageImages.length;
    const validationErrors = [];

    if (availableSlots <= 0) {
      setErrorMessage(
        `Нэг хүсэлтэд хамгийн ихдээ ${MAX_DAMAGE_IMAGES} зураг оруулна.`,
      );
      event.target.value = "";
      return;
    }

    const validFiles = files.filter((file) => {
      if (!ALLOWED_DAMAGE_IMAGE_TYPES.has(file.type)) {
        validationErrors.push(
          `${file.name}: зөвшөөрөгдсөн зургийн төрөл биш байна.`,
        );
        return false;
      }

      if (file.size > MAX_DAMAGE_IMAGE_SIZE) {
        validationErrors.push(`${file.name}: 20MB-аас их хэмжээтэй байна.`);
        return false;
      }

      return true;
    });

    if (validFiles.length > availableSlots) {
      validationErrors.push(
        `Нэг хүсэлтэд хамгийн ихдээ ${MAX_DAMAGE_IMAGES} зураг оруулна.`,
      );
    }

    const newImages = validFiles.slice(0, availableSlots).map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }));

    if (newImages.length) {
      setDamageImages((prev) => [...prev, ...newImages]);
    }
    setErrorMessage(validationErrors.join(" "));
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

  const selectVehicle = (vehicleId) => {
    setActiveCarId(vehicleId);
    setVehicleSearch("");
    setSelectedPartIds([]);
    setOpenCategoryIds([]);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const changeVehicle = () => {
    setActiveCarId("");
    setVehicleSearch("");
    setSelectedPartIds([]);
    setOpenCategoryIds([]);
    setSuccessMessage("");
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
        damageImages.length
          ? `Хүсэлт илгээгдлээ. Амжилттай зураг: ${uploaded}, алгассан зураг: ${skipped}.`
          : "Хүсэлт амжилттай илгээгдлээ.",
      );

      damageImages.forEach((image) => URL.revokeObjectURL(image.url));
      setDamageImages([]);
      setIssueDescription("");
      setSelectedPartIds([]);
      setOpenCategoryIds([]);
      setActiveCarId("");
      setVehicleSearch("");
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
            subtitle="Механикч"
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
          <div
            role="status"
            className="flex min-h-40 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center text-lg font-bold text-emerald-800 shadow-xs"
          >
            {successMessage}
          </div>
        )}

        <VehicleSelector
          vehicles={vehicles}
          search={vehicleSearch}
          loading={loading}
          activeVehicle={activeCar}
          onSearchChange={setVehicleSearch}
          onSelectVehicle={selectVehicle}
          onChangeVehicle={changeVehicle}
        />

        {activeCar && (
          <VehicleCategories
            vehicle={activeCar}
            openCategoryIds={openCategoryIds}
            selectedPartIds={selectedPartIds}
            onToggleCategory={toggleCategory}
            onTogglePart={togglePart}
          />
        )}

        {activeCar && !successMessage && (
          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-md space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                Захиалга өгөх
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Сонгосон тээврийн хэрэгсэл: {activeCar.name || activeCar.model}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Эвдэрсэн хэсгийн зураг (заавал биш)
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-slate-400 bg-slate-50/50 relative active:bg-slate-100 transition-colors">
                  <label className="block cursor-pointer w-full h-full py-2">
                    <span className="text-xs font-semibold text-slate-700 block">
                      <Camera size={15} className="inline mr-1" /> Зураг нэмэх
                    </span>

                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
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
          <button
            type="button"
            onClick={() => setSubmittedOrdersOpen((isOpen) => !isOpen)}
            aria-expanded={submittedOrdersOpen}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <span>
              <span className="block text-base font-bold text-slate-900">
                Өгсөн захиалгууд
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                Нийт {submittedOrders.length} хүсэлт
              </span>
            </span>
            <ChevronDown
              size={18}
              className={`shrink-0 text-slate-400 transition-transform ${submittedOrdersOpen ? "rotate-180" : ""}`}
            />
          </button>

          {submittedOrdersOpen && (
            <div className="border-t border-slate-100 pt-4">
              {submittedOrders.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-400">
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
                            Таны захиалгыг админ амжилттай баталлаа. Тантай
                            эргэж холбогдох болно.
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
