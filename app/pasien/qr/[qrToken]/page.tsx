import { getPasienByQrToken } from "@/app/actions/pasien";
import { formatTanggal, hitungHPL, hitungUmur, hitungUsiaKehamilan } from "@/lib/kehamilan";
import { Activity, Calendar, FileText, Heart, User, Stethoscope } from "lucide-react";

export default async function PublicQrPage({
  params,
}: {
  params: Promise<{ qrToken: string }>;
}) {
  const { qrToken } = await params;
  const pasien = await getPasienByQrToken(qrToken);

  if (!pasien) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-sm w-full border border-gray-100">
          <div className="mx-auto h-16 w-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
            <User size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Data Tidak Ditemukan</h2>
          <p className="text-gray-500 text-sm">QR Code tidak valid atau data pasien telah dihapus.</p>
        </div>
      </div>
    );
  }

  const hpl = hitungHPL(pasien.hpht);
  const umur = hitungUmur(pasien.tanggalLahir);
  const usiaKehamilan = hitungUsiaKehamilan(pasien.hpht);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-emerald-600 text-white pt-8 pb-16 px-4 rounded-b-[40px] shadow-md">
        <div className="max-w-md mx-auto text-center">
          <div className="inline-flex items-center justify-center space-x-2 bg-emerald-700/50 backdrop-blur-sm px-4 py-1.5 rounded-full mb-6 text-sm font-medium">
            <Stethoscope size={16} />
            <span>BidanKu</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">Ringkasan Medis</h1>
          <p className="text-emerald-100 text-sm">Data diperbarui secara real-time</p>
        </div>
      </div>

      <main className="max-w-md mx-auto px-4 -mt-10 space-y-6">
        {/* Identitas Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Heart size={100} />
          </div>
          <div className="flex items-center space-x-4 mb-6 relative">
            <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 border-2 border-white shadow-sm">
              <User size={28} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">{pasien.nama}</h2>
              <p className="text-sm text-gray-500">{umur} tahun • {pasien.gpa || "GPA tidak diset"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 relative">
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100/50">
              <p className="text-xs text-emerald-700 font-medium mb-1">Usia Kehamilan</p>
              <p className="font-bold text-emerald-900 text-lg leading-tight">{usiaKehamilan}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100/50">
              <p className="text-xs text-purple-700 font-medium mb-1">Perkiraan Lahir</p>
              <p className="font-bold text-purple-900 text-lg leading-tight">{formatTanggal(hpl)}</p>
            </div>
          </div>
          
          {pasien.faktorRisiko && (
            <div className="mt-4 bg-red-50 rounded-xl p-4 border border-red-100/50 relative">
              <p className="text-xs text-red-800 font-medium flex items-center mb-1">
                <Activity size={14} className="mr-1" />
                Faktor Risiko
              </p>
              <p className="text-sm text-red-900 font-medium leading-snug">{pasien.faktorRisiko}</p>
            </div>
          )}
        </div>

        {/* Riwayat Pemeriksaan */}
        <div>
          <h3 className="font-bold text-gray-900 px-2 mb-3 flex items-center text-lg">
            <FileText className="mr-2 text-emerald-600" size={20} />
            Pemeriksaan Terakhir
          </h3>
          
          {pasien.riwayat.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <p className="text-gray-500 text-sm">Belum ada data pemeriksaan tercatat.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pasien.riwayat.map((rekam, index) => (
                <div key={rekam.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center text-sm font-medium text-emerald-700 mb-4 bg-emerald-50 self-start px-3 py-1.5 rounded-lg inline-flex">
                    <Calendar size={14} className="mr-1.5" />
                    {formatTanggal(rekam.tanggal)}
                    {index === 0 && <span className="ml-2 text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">Terbaru</span>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Tekanan Darah</p>
                      <p className="font-semibold text-gray-900">{rekam.tekananDarah || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Berat Badan</p>
                      <p className="font-semibold text-gray-900">{rekam.beratBadan ? `${rekam.beratBadan} kg` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Tinggi Fundus</p>
                      <p className="font-semibold text-gray-900">{rekam.tinggiFundus ? `${rekam.tinggiFundus} cm` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Denyut Janin</p>
                      <p className="font-semibold text-gray-900">{rekam.detakJantungJanin ? `${rekam.detakJantungJanin} bpm` : "-"}</p>
                    </div>
                  </div>
                  
                  {rekam.catatan && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Catatan Bidan</p>
                      <p className="text-sm text-gray-700 italic">{rekam.catatan}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
