import { auth } from "@/lib/auth";
import { getPasiens } from "@/app/actions/pasien";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Plus, Search, User } from "lucide-react";
import { formatTanggal } from "@/lib/kehamilan";
import { redirect } from "next/navigation";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { q } = await searchParams;
  
  const pasiens = await getPasiens(session.user.id, q);

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daftar Pasien</h1>
            <p className="text-gray-600 mt-1">Kelola data pasien ibu hamil Anda</p>
          </div>
          <Link
            href="/pasien/baru"
            className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus size={20} />
            <span>Tambah Pasien</span>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50/50">
            <Search className="text-gray-400 mr-2" size={20} />
            <form className="flex-1">
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Cari nama pasien..."
                className="w-full bg-transparent border-none focus:ring-0 text-sm p-0"
              />
            </form>
          </div>

          {pasiens.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {q ? (
                <p>Tidak ada pasien dengan nama "{q}"</p>
              ) : (
                <p>Belum ada data pasien. Silakan tambah pasien baru.</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                    <th className="p-4 font-medium">Nama Pasien</th>
                    <th className="p-4 font-medium hidden sm:table-cell">HPHT</th>
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
                        <Link
                          href={`/pasien/${p.id}`}
                          className="text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                        >
                          Detail &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
