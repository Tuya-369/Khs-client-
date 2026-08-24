"use client";

import { useState } from "react";
import { Eye, Download } from "lucide-react";

const CATEGORIES = ["Бүгд", "Тайлан", "Журам", "Хуудас"];

const DOCUMENTS = [
  {
    id: 0,
    title: "Ажилтны дотоод журам",
    category: "Журам",
    fileUrl: "/file/Juram.pdf",
  },
  {
    id: 1,
    title: "Цалин хөлсний журам ",
    category: "Журам",
    fileUrl: "/file/salary.pdf",
  },
  {
    id: 2,
    title: "2026 оны хагас жилийн тайлан тайлан",
    category: "Тайлан",
    fileUrl: "",
  },
  {
    id: 3,
    title: "Чөлөө олгох ",
    category: "Хуудас",
    fileUrl: "/file/LeaveRequest.pdf",
  },
  {
    id: 4,
    title: "Ээлжийн амралт",
    category: "Хуудас",
    fileUrl: "/file/AnnualLeave.pdf",
  },
  {
    id: 5,
    title: "Илүү цаг",
    category: "Хуудас",
    fileUrl: "/file/Overtime.pdf",
  },
];

export default function FilePage() {
  const [selectedCategory, setSelectedCategory] = useState("Бүгд");

  const filteredDocs =
    selectedCategory === "Бүгд"
      ? DOCUMENTS
      : DOCUMENTS.filter((doc) => doc.category === selectedCategory);

  return (
    <div className="w-full min-flex-1  py-20 px-6 flex flex-col items-center justify-start">
      <div className="max-w-5xl w-full flex flex-col gap-6">
        <div className="flex flex-wrap gap-3 justify-start">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                selectedCategory === cat
                  ? "bg-gray-600 text-white border-gray-600 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="text-gray-400 font-semibold mb-4 text-sm">2026</div>

          <div className="flex flex-col divide-y divide-gray-100">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="py-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
              >
                <p className="text-gray-700 text-sm font-medium flex-1">
                  {doc.title}
                </p>

                <div className="flex items-center gap-4 shrink-0">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Унших
                  </a>

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
