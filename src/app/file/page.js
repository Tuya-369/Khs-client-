"use client";

import { useState } from "react";
import { Eye, Download } from "lucide-react";

// 1. Категориудын жагсаалт
const CATEGORIES = [
  "Бүгд",
  "Цалингийн журам",
  "Чөлөө олгох",
  "Ээлжийн амралт",
  "Илүү цаг",
];

// 2. Баримт бичгүүдийн дээж дата
const DOCUMENTS = [
  {
    id: 1,
    title: "Компанийн дотоод журам",
    category: "Цалингийн журам",
    // Сонгосон Google Drive эсвэл PDF-ийн холбоос
    fileUrl:
      "https://drive.google.com/drive/u/1/folders/13YGcpErcApzbwGvyu4WwXP6f4QeapPaM",
  },
  {
    id: 2,
    title: "Оюу толгой үйлдвэр - Тайлбар ном /Үр өгөөж, шалгуур сорилтууд/",
    category: "Чөлөө олгох",
    fileUrl: "/file/salary.pdf", // Энд өөрийн файлаа тавина
  },
  {
    id: 3,
    title: "Хурдасгуур сан - Ханбогд сумын боловсролын үйлчилгээний чанар",
    category: "Ээлжийн амралт",
    fileUrl: "/file/salary.pdf",
  },
  {
    id: 4,
    title: "Хурдасгуур сан - Teach for Mongolia Fellowship хөтөлбөр",
    category: "Илүү цаг",
    fileUrl: "/file/salary.pdf",
  },
];

export default function FilePage() {
  const [selectedCategory, setSelectedCategory] = useState("Бүгд");

  // Категориор шүүх логик
  const filteredDocs =
    selectedCategory === "Бүгд"
      ? DOCUMENTS
      : DOCUMENTS.filter((doc) => doc.category === selectedCategory);

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="max-w-5xl w-full flex flex-col gap-6">
        {/* --- 1. ТАБ/КАТЕГОРИ ХЭСЭГ --- */}
        <div className="flex flex-wrap gap-3 justify-start">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                selectedCategory === cat
                  ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* --- 2. БАРИМТ БИЧГИЙН ЖАГСААЛТ --- */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="text-gray-400 font-semibold mb-4 text-sm">2026</div>

          <div className="flex flex-col divide-y divide-gray-100">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="py-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
              >
                {/* Гарчиг */}
                <p className="text-gray-700 text-sm font-medium flex-1">
                  {doc.title}
                </p>

                {/* Товчлуурууд */}
                <div className="flex items-center gap-4 shrink-0">
                  {/* УНШИХ ТОВЧ - Шууд холбоос руу үсрэх (`<a>` таг ашигласан) */}
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Унших
                  </a>

                  {/* ТАТАХ ТОВЧ */}
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Татах
                  </a>
                </div>
              </div>
            ))}

            {filteredDocs.length === 0 && (
              <p className="text-center py-8 text-gray-400 text-sm">
                Баримт бичиг олдсонгүй.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
