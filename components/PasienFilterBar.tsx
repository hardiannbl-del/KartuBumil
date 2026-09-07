"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useTransition } from "react";

export default function PasienFilterBar({
  currentSearch = "",
  currentSort = "terbaru",
}: {
  currentSearch?: string;
  currentSort?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilters = (newSearch?: string, newSort?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newSearch !== undefined) {
      if (newSearch.trim()) {
        params.set("q", newSearch.trim());
      } else {
        params.delete("q");
      }
    }

    if (newSort !== undefined) {
      if (newSort && newSort !== "terbaru") {
        params.set("sort", newSort);
      } else {
        params.delete("sort");
      }
    }

    // Reset ke halaman 1 saat pencarian atau sort diubah
    params.set("page", "1");

    startTransition(() => {
      router.push(`/dashboard?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = (formData.get("q") as string) || "";
    updateFilters(q, currentSort);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters(currentSearch, e.target.value);
  };

  const handleClear = () => {
    startTransition(() => {
      router.push("/dashboard");
    });
  };

  const isFiltered = Boolean(currentSearch || (currentSort && currentSort !== "terbaru"));

  return (
    <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-gray-50/50">
      {/* Form Pencarian */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex-1 flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all shadow-2xs"
      >
        <Search className="text-gray-400 mr-2 shrink-0" size={18} />
        <input
          type="text"
          name="q"
          key={currentSearch}
          defaultValue={currentSearch}
          placeholder="Cari nama pasien..."
          className="w-full bg-transparent border-none p-0 text-sm focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-400"
        />
        {currentSearch && (
          <button
            type="button"
            onClick={() => updateFilters("", currentSort)}
            className="text-gray-400 hover:text-gray-600 ml-1 p-0.5"
            title="Hapus pencarian"
          >
            <X size={15} />
          </button>
        )}
      </form>

      {/* Filter Pengurutan */}
      <div className="flex items-center space-x-2 shrink-0">
        <div className="flex items-center space-x-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-2xs">
          <SlidersHorizontal size={15} className="text-gray-500 shrink-0" />
          <span className="text-xs font-medium text-gray-500 hidden md:inline">Urutkan:</span>
          <select
            value={currentSort}
            onChange={handleSortChange}
            className="bg-transparent border-none p-0 text-sm text-gray-700 font-medium focus:outline-none focus:ring-0 cursor-pointer pr-2"
          >
            <option value="terbaru">Terbaru Dibuat</option>
            <option value="terlama">Terlama Dibuat</option>
            <option value="nama_asc">Nama (A &rarr; Z)</option>
            <option value="nama_desc">Nama (Z &rarr; A)</option>
            <option value="hpht_asc">HPHT (Terlama / HPL Dekat)</option>
            <option value="hpht_desc">HPHT (Terbaru / HPL Jauh)</option>
          </select>
        </div>

        {isFiltered && (
          <button
            onClick={handleClear}
            className="text-xs text-gray-500 hover:text-red-600 px-2.5 py-2 rounded-lg hover:bg-red-50 border border-gray-200 bg-white transition-colors font-medium shadow-2xs"
            title="Reset filter & pencarian"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
