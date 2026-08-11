"use client";

import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  X,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { getAccessToken } from "@/lib/session";

const weekDays = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];

// Local timezone-оор YYYY-MM-DD форматыг авагч
const dateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function ProfileCalendar({ onClose }) {
  const today = new Date();
  const [month, setMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [notes, setNotes] = useState({});
  const [draft, setDraft] = useState("");
  const [noteError, setNoteError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Тэмдэглэл татах функц
  const loadNotes = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;

    setIsLoading(true);
    setNoteError("");
    try {
      const response = await api.getCalendarNotes(token);
      const savedNotes = Array.isArray(response?.data) ? response.data : [];

      const grouped = savedNotes.reduce((groupedNotes, note) => {
        if (!note.noteDate) return groupedNotes;
        const key = note.noteDate.slice(0, 10); // YYYY-MM-DD
        const dateNotes = groupedNotes[key] || [];
        groupedNotes[key] = [...dateNotes, note];
        return groupedNotes;
      }, {});

      setNotes(grouped);
    } catch (err) {
      console.error("Calendar notes fetch error:", err);
      setNoteError(
        err?.response?.data?.message || "Тэмдэглэл татаж чадсангүй.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadNotes();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadNotes]);

  const selectedKey = dateKey(selectedDate);
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const startDay = (month.getDay() + 6) % 7;
  const calendarDays = [
    ...Array(startDay).fill(null),
    ...Array.from(
      { length: daysInMonth },
      (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1),
    ),
  ];

  const handleMonthChange = (offset) => {
    const newMonth = new Date(
      month.getFullYear(),
      month.getMonth() + offset,
      1,
    );
    setMonth(newMonth);
  };

  const handleGoToToday = () => {
    const now = new Date();
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  };

  const addNote = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || isSubmitting) return;

    const token = getAccessToken();
    if (!token) return;

    setNoteError("");
    setIsSubmitting(true);
    try {
      const response = await api.createCalendarNote(token, {
        noteDate: selectedKey,
        text,
      });
      const note = response?.data;
      if (!note) throw new Error("Missing calendar note response");

      setNotes((current) => ({
        ...current,
        [selectedKey]: [...(current[selectedKey] || []), note],
      }));
      setDraft("");
    } catch (err) {
      console.error("Add note error:", err);
      setNoteError(
        err?.response?.data?.message || "Тэмдэглэл хадгалах үед алдаа гарлаа.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateNote = async (note, done) => {
    const token = getAccessToken();
    if (!token) return;

    setNoteError("");
    try {
      const response = await api.updateCalendarNote(token, note.id, done);
      const updatedNote = response?.data || { ...note, done };
      setNotes((current) => ({
        ...current,
        [selectedKey]: (current[selectedKey] || []).map((currentNote) =>
          currentNote.id === note.id ? updatedNote : currentNote,
        ),
      }));
    } catch (err) {
      console.error("Update note error:", err);
      setNoteError("Тэмдэглэл шинэчлэх үед алдаа гарлаа.");
    }
  };

  const deleteNote = async (noteId) => {
    const token = getAccessToken();
    if (!token) return;

    setNoteError("");
    try {
      await api.deleteCalendarNote(token, noteId);
      setNotes((current) => ({
        ...current,
        [selectedKey]: (current[selectedKey] || []).filter(
          (note) => note.id !== noteId,
        ),
      }));
    } catch (err) {
      console.error("Delete note error:", err);
      setNoteError("Тэмдэглэл устгах үед алдаа гарлаа.");
    }
  };

  return (
    <section className="border-t border-slate-200 pt-5">
      {/* HEADER */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900">Төлөвлөгөө</h2>
          {isLoading && (
            <Loader2 size={13} className="animate-spin text-slate-400" />
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Өнөөдөр рүү очих"
            onClick={handleGoToToday}
            className="grid size-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <RotateCcw size={14} />
          </button>
          <button
            type="button"
            aria-label="Өмнөх сар"
            onClick={() => handleMonthChange(-1)}
            className="grid size-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="Дараагийн сар"
            onClick={() => handleMonthChange(1)}
            className="grid size-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <ChevronRight size={16} />
          </button>
          {onClose && (
            <button
              type="button"
              aria-label="Календар хаах"
              onClick={onClose}
              className="ml-1 grid size-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* CURRENT MONTH */}
      <p className="mb-2 text-center text-xs font-semibold text-slate-700 capitalize">
        {month.toLocaleDateString("mn-MN", { month: "long", year: "numeric" })}
      </p>

      {/* CALENDAR GRID */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDays.map((day) => (
          <span
            key={day}
            className="py-1 text-[10px] font-medium text-slate-400"
          >
            {day}
          </span>
        ))}
        {calendarDays.map((date, index) => {
          if (!date) return <span key={`empty-${index}`} />;

          const key = dateKey(date);
          const isSelected = key === selectedKey;
          const isToday = key === dateKey(today);
          const dayNotes = notes[key] || [];
          const hasNotes = dayNotes.length > 0;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedDate(date)}
              className={`relative aspect-square rounded-md text-[11px] font-medium transition-all ${
                isSelected
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              } ${isToday && !isSelected ? "ring-1 ring-slate-400 font-bold" : ""}`}
            >
              {date.getDate()}
              {hasNotes && (
                <span
                  className={`absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full ${
                    isSelected ? "bg-white" : "bg-rose-500"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* NOTES SECTION */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold text-slate-600">
            {selectedDate.toLocaleDateString("mn-MN", {
              month: "long",
              day: "numeric",
              weekday: "short",
            })}
          </p>
          <span className="text-[10px] text-slate-400">
            {(notes[selectedKey] || []).length} тэмдэглэл
          </span>
        </div>

        {/* INPUT FORM */}
        <form onSubmit={addNote} className="mt-2 flex gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Шинэ тэмдэглэл бичих..."
            disabled={isSubmitting}
            className="min-w-0 flex-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs outline-none placeholder:text-slate-400 focus:border-slate-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!draft.trim() || isSubmitting}
            aria-label="Тэмдэглэл нэмэх"
            className="grid size-7 shrink-0 place-items-center rounded-md bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-40 transition"
          >
            {isSubmitting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Plus size={15} />
            )}
          </button>
        </form>

        {noteError && (
          <p className="mt-2 text-[11px] text-rose-600 bg-rose-50 p-1.5 rounded border border-rose-100">
            {noteError}
          </p>
        )}

        {/* NOTES LIST */}
        <ul className="mt-2 max-h-48 overflow-y-auto space-y-1.5 pr-1">
          {(notes[selectedKey] || []).length === 0 ? (
            <li className="text-[11px] text-slate-400 text-center py-2 italic">
              Төлөвлөгөө байхгүй байна.
            </li>
          ) : (
            (notes[selectedKey] || []).map((note) => (
              <li
                key={note.id}
                className="group flex items-center gap-2 text-xs text-slate-600 bg-slate-50/50 p-1.5 rounded-md hover:bg-slate-100/80 transition"
              >
                <input
                  type="checkbox"
                  checked={Boolean(note.done)}
                  onChange={() => updateNote(note, !note.done)}
                  className="size-3.5 accent-slate-900 cursor-pointer"
                />
                <span
                  className={`min-w-0 flex-1 truncate ${
                    note.done ? "line-through text-slate-400" : "text-slate-700"
                  }`}
                >
                  {note.text}
                </span>
                <button
                  type="button"
                  aria-label="Тэмдэглэл устгах"
                  onClick={() => deleteNote(note.id)}
                  className="text-slate-300 opacity-0 group-hover:opacity-100 hover:text-rose-600 transition"
                >
                  <Trash2 size={13} />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
