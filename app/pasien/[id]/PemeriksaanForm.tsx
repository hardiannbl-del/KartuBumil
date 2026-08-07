"use client";

import { useRef, useState } from "react";
import { createPemeriksaan } from "@/app/actions/pemeriksaan";
import { PlusCircle } from "lucide-react";

export default function PemeriksaanForm({ pasienId }: { pasienId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    
    const formData = new FormData(e.currentTarget);
    await createPemeriksaan(formData);
    
    setIsPending(false);
    setIsOpen(false);
    formRef.current?.reset();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-white rounded-xl shadow-sm border border-emerald-200 border-dashed p-6 text-center hover:bg-emerald-50 transition-colors flex flex-col items-center justify-center text-emerald-600"
      >
        <PlusCircle size={28} className="mb-2" />
        <span className="font-medium">Tambah Riwayat Pemeriksaan Baru</span>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-emerald-200 overflow-hidden">
      <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex justify-between items-center">
        <h3 className="font-bold text-emerald-800">Form Pemeriksaan Baru</h3>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600 font-medium text-sm"
        >
          Batal
        </button>
      </div>
      
      <form ref={formRef} onSubmit={handleSubmit} className="p-6">
        <input type="hidden" name="pasienId" value={pasienId} />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tekanan Darah (mmHg)</label>
            <input type="text" name="tekananDarah" placeholder="Contoh: 120/80" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Berat Badan (kg)</label>
            <input type="number" step="0.1" name="beratBadan" placeholder="Contoh: 65.5" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tinggi Fundus (cm)</label>
            <input type="number" step="0.1" name="tinggiFundus" placeholder="Contoh: 28" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Denyut Jantung Janin (bpm)</label>
            <input type="number" name="detakJantungJanin" placeholder="Contoh: 140" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
          <textarea name="catatan" rows={2} placeholder="Keluhan pasien, resep obat, dll..." className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"></textarea>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? "Menyimpan..." : "Simpan Pemeriksaan"}
          </button>
        </div>
      </form>
    </div>
  );
}
