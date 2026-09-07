"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deletePasien } from "@/app/actions/pasien";
import { useRouter } from "next/navigation";

export default function DeletePasienButton({
  pasienId,
  namaPasien,
  redirectToDashboard = false,
}: {
  pasienId: string;
  namaPasien: string;
  redirectToDashboard?: boolean;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus data pasien "${namaPasien}" beserta seluruh riwayat pemeriksaannya? Tindakan ini tidak dapat dibatalkan.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await deletePasien(pasienId);
      if (res?.error) {
        alert("Gagal menghapus: " + res.error);
      } else {
        if (redirectToDashboard) {
          router.push("/dashboard");
        }
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
      onClick={handleDelete}
      disabled={isDeleting}
      title="Hapus Pasien"
      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
    >
      {isDeleting ? <Loader2 size={16} className="animate-spin text-red-600" /> : <Trash2 size={16} />}
    </button>
  );
}
