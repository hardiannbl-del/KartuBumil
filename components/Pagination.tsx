import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  searchQuery?: string;
  sortBy?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  limit,
  searchQuery,
  sortBy,
}: PaginationProps) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (sortBy && sortBy !== "terbaru") params.set("sort", sortBy);
    params.set("page", page.toString());
    return `/dashboard?${params.toString()}`;
  };

  // Generate array of page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/40">
      <div className="text-sm text-gray-500">
        Menampilkan <span className="font-semibold text-gray-800">{startItem}</span> -{" "}
        <span className="font-semibold text-gray-800">{endItem}</span> dari{" "}
        <span className="font-semibold text-gray-800">{totalItems}</span> pasien
      </div>

      <div className="flex items-center space-x-1.5">
        {/* Previous Button */}
        {currentPage > 1 ? (
          <Link
            href={getPageUrl(currentPage - 1)}
            className="inline-flex items-center px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <ChevronLeft size={16} className="mr-0.5" />
            <span>Sebelumnya</span>
          </Link>
        ) : (
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg border border-gray-100 bg-gray-100/60 text-gray-400 text-sm font-medium cursor-not-allowed">
            <ChevronLeft size={16} className="mr-0.5" />
            <span>Sebelumnya</span>
          </span>
        )}

        {/* Page Numbers */}
        <div className="hidden sm:flex items-center space-x-1">
          {getPageNumbers().map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`dots-${idx}`} className="px-2 text-gray-400 text-sm">
                  ...
                </span>
              );
            }
            const isCurrent = p === currentPage;
            return (
              <Link
                key={`page-${p}`}
                href={getPageUrl(Number(p))}
                className={`min-w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  isCurrent
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>

        {/* Next Button */}
        {currentPage < totalPages ? (
          <Link
            href={getPageUrl(currentPage + 1)}
            className="inline-flex items-center px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <span>Selanjutnya</span>
            <ChevronRight size={16} className="ml-0.5" />
          </Link>
        ) : (
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg border border-gray-100 bg-gray-100/60 text-gray-400 text-sm font-medium cursor-not-allowed">
            <span>Selanjutnya</span>
            <ChevronRight size={16} className="ml-0.5" />
          </span>
        )}
      </div>
    </div>
  );
}
