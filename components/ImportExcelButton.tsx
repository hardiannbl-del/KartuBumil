"use client";

import { useState, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { importPasiensExcel } from "@/app/actions/pasien";

export default function ImportExcelButton() {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await importPasiensExcel(formData);
      if (result?.error) {
        alert("Gagal import: " + result.error);
      } else {
        alert("Berhasil import data pasien.");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengunggah file.");
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".xlsx, .xls"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="flex items-center space-x-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Upload size={20} />
        )}
        <span>{isUploading ? "Mengunggah..." : "Import Excel"}</span>
      </button>
    </>
  );
}
