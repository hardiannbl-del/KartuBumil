import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { redirect } from "next/navigation";
import { createPasien } from "@/app/actions/pasien";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function PasienBaruPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-emerald-600 transition-colors">
            <ArrowLeft size={16} className="mr-1" />
            Kembali ke Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Tambah Pasien Baru</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <form action={createPasien} className="space-y-6">
            <input type="hidden" name="bidanId" value={session.user.id} />
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="nama" className="block text-sm font-medium text-gray-700">Nama Lengkap Pasien *</label>
                <input type="text" name="nama" id="nama" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 py-2 border" />
              </div>

              <div>
                <label htmlFor="nik" className="block text-sm font-medium text-gray-700">NIK</label>
                <input type="text" name="nik" id="nik" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 py-2 border" />
              </div>

              <div>
                <label htmlFor="tanggalLahir" className="block text-sm font-medium text-gray-700">Tanggal Lahir *</label>
                <input type="date" name="tanggalLahir" id="tanggalLahir" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 py-2 border" />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="alamat" className="block text-sm font-medium text-gray-700">Alamat</label>
                <textarea name="alamat" id="alamat" rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 py-2 border"></textarea>
              </div>

              <div>
                <label htmlFor="noHp" className="block text-sm font-medium text-gray-700">Nomor HP</label>
                <input type="tel" name="noHp" id="noHp" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 py-2 border" />
              </div>

              <div>
                <label htmlFor="namaSuami" className="block text-sm font-medium text-gray-700">Nama Suami</label>
                <input type="text" name="namaSuami" id="namaSuami" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 py-2 border" />
              </div>

              <div>
                <label htmlFor="hpht" className="block text-sm font-medium text-gray-700">HPHT (Hari Pertama Haid Terakhir) *</label>
                <input type="date" name="hpht" id="hpht" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 py-2 border" />
              </div>

              <div>
                <label htmlFor="gpa" className="block text-sm font-medium text-gray-700">Riwayat Kehamilan (G_P_A_)</label>
                <input type="text" name="gpa" id="gpa" placeholder="Contoh: G1 P0 A0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 py-2 border" />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="faktorRisiko" className="block text-sm font-medium text-gray-700">Faktor Risiko (Opsional)</label>
                <textarea name="faktorRisiko" id="faktorRisiko" rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 py-2 border"></textarea>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <Link href="/dashboard" className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                Batal
              </Link>
              <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                Simpan Data
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
