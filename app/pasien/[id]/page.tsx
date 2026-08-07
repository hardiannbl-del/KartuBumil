import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPasienById } from "@/app/actions/pasien";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowLeft, Calendar, FileText, Activity, Download, Printer } from "lucide-react";
import { formatTanggal, hitungHPL, hitungUmur, hitungUsiaKehamilan } from "@/lib/kehamilan";
import QRCode from "qrcode";
import PemeriksaanForm from "./PemeriksaanForm";

export default async function PasienDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const pasien = await getPasienById(id);

  if (!pasien || pasien.bidanId !== session.user.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Pasien tidak ditemukan</h2>
          <Link href="/dashboard" className="text-emerald-600 hover:underline mt-4 block">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Calculate fields
  const hpl = hitungHPL(pasien.hpht);
  const umur = hitungUmur(pasien.tanggalLahir);
  const usiaKehamilan = hitungUsiaKehamilan(pasien.hpht);
  
  // Generate QR Code URL
  // We need the absolute URL. In production, process.env.NEXT_PUBLIC_APP_URL should be used.
  // For prototype, we can use a relative or hardcoded local path, but QR needs absolute.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const qrUrl = `${baseUrl}/pasien/qr/${pasien.qrToken}`;
  const qrDataUrl = await QRCode.toDataURL(qrUrl, {
    width: 200,
    margin: 2,
    color: {
      dark: '#059669', // emerald-600
      light: '#ffffff'
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-emerald-600 transition-colors">
            <ArrowLeft size={16} className="mr-1" />
            Kembali ke Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Data Pasien & QR Code */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-emerald-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Data Pasien</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Nama Lengkap</p>
                    <p className="text-lg font-semibold text-gray-900">{pasien.nama}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Umur</p>
                      <p className="font-medium text-gray-900">{umur} tahun</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">No. HP</p>
                      <p className="font-medium text-gray-900">{pasien.noHp || "-"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Nama Suami</p>
                    <p className="font-medium text-gray-900">{pasien.namaSuami || "-"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Usia Kehamilan</p>
                      <p className="font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md inline-block mt-1">
                        {usiaKehamilan}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">HPL</p>
                      <p className="font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-md inline-block mt-1">
                        {formatTanggal(hpl)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Riwayat Kehamilan</p>
                    <p className="font-medium text-gray-900">{pasien.gpa || "-"}</p>
                  </div>
                  {pasien.faktorRisiko && (
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100 mt-4">
                      <p className="text-sm text-red-800 font-medium flex items-center">
                        <Activity size={16} className="mr-1" />
                        Faktor Risiko:
                      </p>
                      <p className="text-sm text-red-700 mt-1">{pasien.faktorRisiko}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <h3 className="font-semibold text-gray-900 mb-2">QR Code Pasien</h3>
              <p className="text-sm text-gray-500 mb-4">Scan untuk melihat rekam medis publik</p>
              
              <div className="flex justify-center mb-4">
                <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 border border-gray-200 rounded-lg p-2" />
              </div>
              
              <div className="flex justify-center space-x-2">
                <a 
                  href={qrDataUrl} 
                  download={`QR_${pasien.nama.replace(/\s+/g, '_')}.png`}
                  className="flex items-center space-x-1 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  <Download size={16} />
                  <span>Download</span>
                </a>
                <Link
                  href={qrUrl}
                  target="_blank"
                  className="flex items-center space-x-1 bg-gray-100 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
                >
                  <Printer size={16} />
                  <span>Lihat Halaman</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Riwayat Pemeriksaan */}
          <div className="lg:col-span-2 space-y-6">
            <PemeriksaanForm pasienId={pasien.id} />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-900 flex items-center text-lg">
                  <FileText className="mr-2 text-emerald-600" size={20} />
                  Riwayat Pemeriksaan
                </h3>
              </div>
              
              {pasien.riwayat.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Belum ada riwayat pemeriksaan.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {pasien.riwayat.map((rekam) => (
                    <div key={rekam.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center text-emerald-700 font-medium bg-emerald-50 px-3 py-1 rounded-full text-sm">
                          <Calendar size={14} className="mr-1.5" />
                          {formatTanggal(rekam.tanggal)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Tekanan Darah</p>
                          <p className="font-medium">{rekam.tekananDarah || "-"}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Berat Badan</p>
                          <p className="font-medium">{rekam.beratBadan ? `${rekam.beratBadan} kg` : "-"}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Tinggi Fundus</p>
                          <p className="font-medium">{rekam.tinggiFundus ? `${rekam.tinggiFundus} cm` : "-"}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">DJJ</p>
                          <p className="font-medium">{rekam.detakJantungJanin ? `${rekam.detakJantungJanin} bpm` : "-"}</p>
                        </div>
                      </div>
                      
                      {rekam.catatan && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Catatan Tambahan:</p>
                          <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                            {rekam.catatan}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
