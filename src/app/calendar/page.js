import Link from "next/link";
import { ArrowLeft, CalendarDays, CheckCircle2, ListTodo } from "lucide-react";
import ProfileCalendar from "@/app/profile/components/ProfileCalendar";

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
            >
              <ArrowLeft size={14} />
              Буцах
            </Link>
          </div>
        </header>

        <main className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
          <ProfileCalendar />
        </main>
      </div>
    </div>
  );
}
