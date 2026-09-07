"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteAllPasiens } from "@/app/actions/pasien";

export default function DeleteAllPasiensButton({
  totalPasiens,
}: {
  totalPasiens: number;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAll = async () => {
    if (totalPasiens === 0) return;

    const confirm1 = window.confirm(
      `PERINGATAN: Apakah Anda yakin ingin menghapus SEMUA data pasien (${totalPasiens} orang) beserta seluruh riwayat pemeriksaannya?\n\nTindakan ini bersifat permanen dan tidak dapat dibatalkan!`
    );
    if (!confirm1) return;

    const confirm2 = window.confirm(
      `Konfirmasi Terakhir: Anda benar-benar akan menghapus seluruh data ${totalPasiens} pasien? Klik OK untuk melanjutkan.`
    );
    if (!confirm2) return;

    setIsDeleting(true);
    try {
      const res = await deleteAllPasiens();
      if (res?.error) {
        alert("Gagal menghapus: " + res.error);
      } else {
        alert(`Berhasil menghapus ${res.count} data pasien.`);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menghapus data.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDeleteAll}
      disabled={isDeleting || totalPasiens === 0}
      title="Hapus Seluruh Data Pasien"
      className="flex items-center space-x-1.5 bg-white text-red-600 border border-red-200 px-3.5 py-2 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors shadow-2xs text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {isDeleting ? (
        <Loader2 size={18} className="animate-spin text-red-600" />
      ) : (
        <Trash2 size={18} />
      )}
      <span>{isDeleting ? "Menghapus..." : "Hapus Semua"}</span>
    </button>
  );
}
