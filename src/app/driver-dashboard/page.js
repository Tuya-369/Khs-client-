"use client";
import { useState } from "react";

const CAR_DATA = [
  {
    id: "car1",
    name: "Toyota Prius 30",
    plate: "8888 УБА",
    parts: ["Урд амортизатор", "Тормосны наклад", "Свеч"],
  },
  {
    id: "car2",
    name: "Hyundai Porter",
    plate: "1111 УББ",
    parts: ["Рессор", "Диск муфта", "Агаарын шүүлтүүр"],
  },
];

const DRIVER_PROFILE = {
  name: "Лхамаа",
  sap: "202699",
};

export default function DriverDashboard() {
  const [activeCarId, setActiveCarId] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [damageImages, setDamageImages] = useState([]);
  const [issueDescription, setIssueDescription] = useState("");
  const [submittedOrders, setSubmittedOrders] = useState([
    {
      id: "order-demo-1",
      carName: "Toyota Prius 30",
      partName: "Тормосны наклад",
      description: "Тоормос дуугараад, үрэлт ихтэй болсон.",
      status: "approved",
      createdAt: "2026-07-08 09:20",
    },
    {
      id: "order-demo-2",
      carName: "Hyundai Porter",
      partName: "Агаарын шүүлтүүр",
      description: "Хүч сулраад байгаа тул шалгуулах шаардлагатай.",
      status: "pending",
      createdAt: "2026-07-08 11:05",
    },
  ]);

  const handleDamageImagesUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (!imageFiles.length) {
      alert("Зөвхөн зураг файл сонгоно уу.");
      event.target.value = "";
      return;
    }

    const readers = imageFiles.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              id: `${file.name}-${file.lastModified}-${Math.random()
                .toString(36)
                .slice(2, 8)}`,
              name: file.name,
              url: reader.result,
            });
          };
          reader.onerror = () => reject(new Error("read-failed"));
          reader.readAsDataURL(file);
        }),
    );

    Promise.all(readers)
      .then((newImages) => {
        setDamageImages((prev) => [...prev, ...newImages]);
      })
      .catch(() => {
        alert("Зураг уншихад алдаа гарлаа. Дахин оролдоно уу.");
      })
      .finally(() => {
        event.target.value = "";
      });
  };

  const removeDamageImage = (id) => {
    setDamageImages((prev) => prev.filter((image) => image.id !== id));
  };

  const getCurrentDateTimeLabel = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate(),
    ).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")}`;
  };

  const submitOrder = () => {
    const activeCar = CAR_DATA.find((car) => car.id === activeCarId);

    const newOrder = {
      id: `order-${Date.now()}`,
      carName: activeCar?.name || "Сонгогдоогүй машин",
      partName: selectedPart,
      description: issueDescription.trim() || "Тайлбар оруулаагүй",
      status: "pending",
      createdAt: getCurrentDateTimeLabel(),
      imageCount: damageImages.length,
    };

    setSubmittedOrders((prev) => [newOrder, ...prev]);
    alert("Захиалга илгээгдлээ.");
    setSelectedPart(null);
    setDamageImages([]);
    setIssueDescription("");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased p-4 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Жолоочийн мэдээллийн хэсэг */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-linear-to-tr from-slate-800 to-slate-950 text-white rounded-lg flex items-center justify-center font-bold text-base shadow-sm select-none shrink-0">
            <span>{DRIVER_PROFILE.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-tight text-slate-900">
              {DRIVER_PROFILE.name}
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Жолооч • SAP ID:{" "}
              <span className="font-mono text-slate-700">
                #{DRIVER_PROFILE.sap}
              </span>
            </p>
          </div>
        </div>

        {/* Машин сонгох хэсэг */}
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
            {CAR_DATA.map((car) => (
              <div
                key={car.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveCarId(activeCarId === car.id ? null : car.id);
                    setSelectedPart(null); // Өөр машин сонговол хуучин сэлбэгийг цэвэрлэнэ
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
                  <span className="text-slate-400 text-xs shrink-0">
                    {activeCarId === car.id ? "▲" : "▼"}
                  </span>
                </button>

                {activeCarId === car.id && (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50/50 border-t border-slate-100">
                    {car.parts.map((part) => (
                      <button
                        type="button"
                        key={part}
                        onClick={() => setSelectedPart(part)}
                        className={`p-3.5 text-xs rounded-xl border transition-all font-semibold text-left ${
                          selectedPart === part
                            ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 active:bg-slate-50"
                        }`}
                      >
                        {part}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Хүсэлт үүсгэх форм (Сэлбэг сонгогдсон үед гарч ирнэ) */}
        {selectedPart && (
          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-md space-y-4 animate-in fade-in duration-200">
            <div>
              <h4 className="font-bold text-sm sm:text-base text-slate-900">
                📌 Сонгосон:{" "}
                <span className="text-amber-600">{selectedPart}</span>
              </h4>
            </div>

            {/* Гар утсанд зориулж flex-col, том дэлгэцэнд grid болгов */}
            <div className="flex flex-col gap-4">
              {/* Зураг оруулах хэсэг */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Эвдэрсэн хэсгийн зураг
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-slate-400 bg-slate-50/50 relative active:bg-slate-100 transition-colors">
                  <label className="block cursor-pointer w-full h-full py-2">
                    <span className="text-xs font-semibold text-slate-700 block">
                      📷 Зураг нэмэх
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
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeDamageImage(image.id)}
                            className="absolute top-1 right-1 w-5 h-5 text-xs font-bold rounded-full bg-black/70 text-white flex items-center justify-center active:bg-black"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Тайлбар бичих талбар */}
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

            {/* Товчлуурууд - Гар утсан дээр бүтэн өргөн авах боломжтой */}
            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setSelectedPart(null);
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
                className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 active:scale-[0.99] transition shadow-sm"
              >
                Хүсэлт илгээх
              </button>
            </div>
          </div>
        )}

        {/* Илгээсэн захиалгуудын түүх */}
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
                const isApproved = order.status === "approved";
                const isPending = order.status === "pending";

                return (
                  <div
                    key={order.id}
                    className="border border-slate-200 rounded-xl p-4 bg-slate-50/40 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="text-xs sm:text-sm font-bold text-slate-900">
                          {order.carName}{" "}
                          <span className="text-slate-300 font-normal mx-1">
                            |
                          </span>{" "}
                          {order.partName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {order.createdAt}
                        </div>
                      </div>

                      {/* Төлөв илэрхийлэх Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide border shrink-0 ${
                          isApproved
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : isPending
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {isApproved
                          ? "Батлагдсан"
                          : isPending
                            ? "Хүлээгдэж буй"
                            : "Цуцлагдсан"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 leading-relaxed font-normal">
                      {order.description}
                    </p>

                    {typeof order.imageCount === "number" &&
                      order.imageCount > 0 && (
                        <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                          📎 Хавсаргасан зураг:{" "}
                          <span className="text-slate-700 font-semibold">
                            {order.imageCount}
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
