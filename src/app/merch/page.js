import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MerchCard from "@/components/LandingToken/Merch/MerchCard";

export default function MerchPage() {
  return (
    <>
      <main className="w-full px-4 py-6 sm:px-8 sm:py-8 md:px-12 md:py-10">
        <div className="mx-auto mb-5 flex w-full max-w-6xl">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          >
            <ArrowLeft size={15} />
            Буцах
          </Link>
        </div>
        <MerchCard />
      </main>
    </>
  );
}
