import { auth } from "@/lib/auth";
import { getPasiens } from "@/app/actions/pasien";
import Navbar from "@/components/Navbar";
import ImportExcelButton from "@/components/ImportExcelButton";
import DeletePasienButton from "@/components/DeletePasienButton";
import DeleteAllPasiensButton from "@/components/DeleteAllPasiensButton";
import PasienFilterBar from "@/components/PasienFilterBar";
import Pagination from "@/components/Pagination";
import Link from "next/link";
import {
  Plus,
  User,
  ArrowUpDown,
  ArrowUpAZ,
  ArrowDownAZ,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { formatTanggal } from "@/lib/kehamilan";
import { redirect } from "next/navigation";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>;
}) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { q, page, sort } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const currentSort = sort || "terbaru";
  const limit = 10;
  
  const { pasiens, total, totalPages } = await getPasiens(
    session.user.id,
    q,
    currentPage,
    limit,
    currentSort
  );

  const getSortHeaderUrl = (column: "nama" | "hpht") => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page", "1");

    if (column === "nama") {
      const nextSort = currentSort === "nama_asc" ? "nama_desc" : "nama_asc";
      params.set("sort", nextSort);
    } else if (column === "hpht") {
      const nextSort = currentSort === "hpht_asc" ? "hpht_desc" : "hpht_asc";
      params.set("sort", nextSort);
    }

    return `/dashboard?${params.toString()}`;
  };

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daftar Pasien</h1>
            <p className="text-gray-600 mt-1">
              Kelola data pasien ibu hamil Anda ({total} terdaftar)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <DeleteAllPasiensButton totalPasiens={total} />
            <ImportExcelButton />
            <Link
              href="/pasien/baru"
              className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Plus size={20} />
              <span>Tambah Pasien</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <PasienFilterBar currentSearch={q} currentSort={currentSort} />

          {pasiens.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {q ? (
                <p>Tidak ada pasien dengan nama "{q}"</p>
              ) : (
                <p>Belum ada data pasien. Silakan tambah pasien baru atau import Excel.</p>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                      {/* Sort Header Nama */}
                      <th className="p-4 font-medium">
                        <Link
                          href={getSortHeaderUrl("nama")}
                          className="group inline-flex items-center space-x-1.5 hover:text-emerald-700 transition-colors"
                          title="Urutkan berdasarkan nama"
                        >
                          <span>Nama Pasien</span>
                          {currentSort === "nama_asc" ? (
                            <ArrowUpAZ size={16} className="text-emerald-600" />
                          ) : currentSort === "nama_desc" ? (
                            <ArrowDownAZ size={16} className="text-emerald-600" />
                          ) : (
                            <ArrowUpDown size={14} className="text-gray-400 group-hover:text-emerald-600 opacity-60" />
                          )}
                        </Link>
                      </th>

                      {/* Sort Header HPHT */}
                      <th className="p-4 font-medium hidden sm:table-cell">
                        <Link
                          href={getSortHeaderUrl("hpht")}
                          className="group inline-flex items-center space-x-1.5 hover:text-emerald-700 transition-colors"
                          title="Urutkan berdasarkan HPHT"
                        >
                          <span>HPHT</span>
                          {currentSort === "hpht_asc" ? (
                            <ArrowUp size={16} className="text-emerald-600" />
                          ) : currentSort === "hpht_desc" ? (
                            <ArrowDown size={16} className="text-emerald-600" />
                          ) : (
                            <ArrowUpDown size={14} className="text-gray-400 group-hover:text-emerald-600 opacity-60" />
                          )}
                        </Link>
                      </th>

                      <th className="p-4 font-medium hidden md:table-cell">No. HP</th>
                      <th className="p-4 font-medium text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pasiens.map((p: any) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-3">
                              <User size={20} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{p.nama}</div>
                              <div className="text-xs text-gray-500 sm:hidden">
                                HPHT: {formatTanggal(p.hpht)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-600 hidden sm:table-cell">
                          {formatTanggal(p.hpht)}
                        </td>
                        <td className="p-4 text-sm text-gray-600 hidden md:table-cell">
                          {p.noHp || "-"}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/pasien/${p.id}`}
                              className="text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                            >
                              Detail &rarr;
                            </Link>
                            <DeletePasienButton pasienId={p.id} namaPasien={p.nama} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={total}
                limit={limit}
                searchQuery={q}
                sortBy={currentSort}
              />
            </>
          )}
        </div>
      </main>
    </>
  );
}
