"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import * as xlsx from "xlsx";

export async function createPasien(formData: FormData) {
  const nama = formData.get("nama") as string;
  const nik = formData.get("nik") as string;
  const tanggalLahir = new Date(formData.get("tanggalLahir") as string);
  const alamat = formData.get("alamat") as string;
  const noHp = formData.get("noHp") as string;
  const namaSuami = formData.get("namaSuami") as string;
  const hpht = new Date(formData.get("hpht") as string);
  const gpa = formData.get("gpa") as string;
  const faktorRisiko = formData.get("faktorRisiko") as string;
  const bidanId = formData.get("bidanId") as string; // Usually from session, but passed hidden for simplicity

  const pasien = await prisma.pasien.create({
    data: {
      nama,
      nik,
      tanggalLahir,
      alamat,
      noHp,
      namaSuami,
      hpht,
      gpa,
      faktorRisiko,
      bidanId,
    },
  });

  revalidatePath("/dashboard");
  redirect(`/pasien/${pasien.id}`);
}

export async function getPasiens(
  bidanId: string,
  search?: string,
  page: number = 1,
  limit: number = 10,
  sortBy: string = "terbaru"
) {
  const safePage = Math.max(1, Number(page) || 1);
  const skip = (safePage - 1) * limit;
  const where = {
    bidanId,
    nama: search ? { contains: search } : undefined,
  };

  let orderBy: any = { createdAt: "desc" };

  switch (sortBy) {
    case "nama_asc":
      orderBy = { nama: "asc" };
      break;
    case "nama_desc":
      orderBy = { nama: "desc" };
      break;
    case "hpht_asc":
      orderBy = { hpht: "asc" };
      break;
    case "hpht_desc":
      orderBy = { hpht: "desc" };
      break;
    case "terlama":
      orderBy = { createdAt: "asc" };
      break;
    case "terbaru":
    default:
      orderBy = { createdAt: "desc" };
      break;
  }

  const [pasiens, total] = await Promise.all([
    prisma.pasien.findMany({
      where,
      skip,
      take: limit,
      orderBy,
    }),
    prisma.pasien.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    pasiens,
    total,
    page: safePage,
    totalPages,
    limit,
    sortBy,
  };
}

export async function deleteAllPasiens() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Belum login" };
    }
    const bidanId = session.user.id;

    const pasiens = await prisma.pasien.findMany({
      where: { bidanId },
      select: { id: true },
    });

    const pasienIds = pasiens.map((p) => p.id);

    if (pasienIds.length === 0) {
      return { success: true, count: 0 };
    }

    // Hapus seluruh riwayat pemeriksaan terlebih dahulu (foreign key)
    await prisma.pemeriksaan.deleteMany({
      where: {
        pasienId: { in: pasienIds },
      },
    });

    // Hapus seluruh data pasien milik bidan ini
    const deleted = await prisma.pasien.deleteMany({
      where: {
        id: { in: pasienIds },
      },
    });

    revalidatePath("/dashboard");
    return { success: true, count: deleted.count };
  } catch (error: any) {
    console.error("Error deleting all patients:", error);
    return { error: error.message || "Gagal menghapus semua data pasien" };
  }
}

export async function getPasienById(id: string) {
  return prisma.pasien.findUnique({
    where: { id },
    include: {
      riwayat: {
        orderBy: {
          tanggal: "desc",
        },
      },
    },
  });
}

export async function getPasienByQrToken(qrToken: string) {
  return prisma.pasien.findUnique({
    where: { qrToken },
    include: {
      riwayat: {
        orderBy: {
          tanggal: "desc",
        },
        take: 3, // only show last 3 exams
      },
    },
  });
}

export async function importPasiensExcel(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Belum login" };
    }
    const bidanId = session.user.id;

    const file = formData.get("file") as File;
    if (!file) {
      return { error: "File tidak ditemukan" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const workbook = xlsx.read(buffer, { type: "buffer", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    const rawData = xlsx.utils.sheet_to_json(sheet) as any[];

    if (rawData.length === 0) {
      return { error: "File Excel kosong atau format tidak sesuai" };
    }

    // Pastikan Bidan ada di database
    const bidan = await prisma.bidan.findUnique({
      where: { id: bidanId }
    });
    
    if (!bidan) {
      return { error: "Akun Bidan tidak ditemukan atau tidak valid" };
    }

    const validPasiensToCreate: Array<{
      dataPasien: any;
      dataPemeriksaan: any | null;
    }> = [];

    for (const row of rawData) {
      // Helper pencocokan kunci kolom umum
      const findVal = (...searchTerms: string[]) => {
        for (const term of searchTerms) {
          const key = Object.keys(row).find((k) =>
            k.trim().toLowerCase().includes(term.toLowerCase())
          );
          if (key && row[key] !== undefined && row[key] !== null) {
            const val = String(row[key]).trim();
            if (val !== "") return val;
          }
        }
        return undefined;
      };

      const parseNumber = (val: string | undefined): number | undefined => {
        if (!val) return undefined;
        const cleaned = val.replace(",", ".").replace(/[^0-9.]/g, "");
        const num = parseFloat(cleaned);
        return isNaN(num) ? undefined : num;
      };

      // 1. Ekstraksi NAMA PASIEN (Ibu Hamil)
      // Jangan sampai salah cocok dengan "Nama Suami" atau "Nama Petugas"
      const namaKey = Object.keys(row).find((k) => {
        const lower = k.trim().toLowerCase();
        if (
          lower.includes("suami") ||
          lower.includes("bidan") ||
          lower.includes("anak") ||
          lower.includes("petugas") ||
          lower.includes("klinik") ||
          lower.includes("faskes")
        ) {
          return false;
        }
        return (
          lower === "nama" ||
          lower.includes("nama ibu") ||
          lower.includes("nama pasien") ||
          lower.includes("nama bumil") ||
          lower.includes("nama lengkap") ||
          lower.startsWith("nama") ||
          lower.includes("ibu hamil")
        );
      });

      const rawNama = namaKey && row[namaKey] ? String(row[namaKey]).trim() : findVal("nama");

      // VALIDASI: Skip baris yang bukan data pasien (misal judul header excel, baris kosong, nomor urut saja)
      if (!rawNama || rawNama === "" || rawNama === "-" || rawNama === ".") {
        continue;
      }

      const lowerNama = rawNama.toLowerCase();
      // Skip jika teks adalah kata kunci header/judul tabel
      const headerKeywords = [
        "nama",
        "nama ibu",
        "nama pasien",
        "nama bumil",
        "nama lengkap",
        "tanpa nama",
        "register",
        "kohort",
        "laporan",
        "puskesmas",
        "pemerintah",
        "kemenkes",
        "posyandu",
        "rekapitulasi",
        "desa",
        "kelurahan",
        "kecamatan",
        "kabupaten",
      ];
      if (headerKeywords.includes(lowerNama)) {
        continue;
      }

      // Skip jika hanya angka (misalnya kolom nomor urut yang salah terdeteksi sebagai nama)
      if (/^\d+$/.test(rawNama)) {
        continue;
      }

      // Nama harus memiliki minimal 2 huruf
      const alphaCount = rawNama.replace(/[^a-zA-Z]/g, "").length;
      if (alphaCount < 2) {
        continue;
      }

      const nama = rawNama;

      // 2. Ekstraksi NIK (Hindari kolom "Klinik")
      const nikKey = Object.keys(row).find((k) => {
        const lower = k.trim().toLowerCase();
        if (lower.includes("klinik") || lower.includes("teknik")) return false;
        return (
          lower === "nik" ||
          lower.includes("no ktp") ||
          lower.includes("no. ktp") ||
          lower.includes("nomor induk") ||
          /\bnik\b/.test(lower)
        );
      });
      const nik = (nikKey && row[nikKey] ? String(row[nikKey]).trim() : undefined) || "-";

      // 3. Ekstraksi Tanggal Lahir / Estimasi dari Umur
      let tanggalLahir = new Date();
      const rawTgl = findVal("tanggal lahir", "tgl lahir", "lahir", "tgl_lahir");
      const rawUmur = findVal("umur", "usia");
      if (rawTgl) {
        const parsed = new Date(rawTgl);
        if (!isNaN(parsed.getTime())) {
          tanggalLahir = parsed;
        }
      } else if (rawUmur) {
        const umurNum = parseInt(rawUmur.replace(/\D/g, ""), 10);
        if (!isNaN(umurNum) && umurNum > 10 && umurNum < 80) {
          const now = new Date();
          tanggalLahir = new Date(now.getFullYear() - umurNum, now.getMonth(), now.getDate());
        }
      }

      // 4. Ekstraksi Alamat
      const alamat = findVal("alamat", "domisili", "tempat tinggal") || "-";

      // 5. Ekstraksi NOMOR HP (PENTING: Jangan cocokkan HPHT / HPL!)
      let noHp = "-";
      const hpKey = Object.keys(row).find((k) => {
        const lower = k.trim().toLowerCase();
        // Kritis: hindari kolom HPHT, HPL, Haid
        if (lower.includes("hpht") || lower.includes("hpl") || lower.includes("haid")) {
          return false;
        }
        return (
          lower.includes("no hp") ||
          lower.includes("no. hp") ||
          lower.includes("nohp") ||
          lower.includes("nomor hp") ||
          lower.includes("no telp") ||
          lower.includes("no. telp") ||
          lower.includes("telepon") ||
          lower.includes("telp") ||
          lower.includes("handphone") ||
          lower.includes("whatsapp") ||
          lower.includes("wa") ||
          lower.includes("kontak") ||
          lower === "hp" ||
          /\bhp\b/.test(lower)
        );
      });

      if (hpKey && row[hpKey] !== undefined && row[hpKey] !== null) {
        const val = row[hpKey];
        // Jika bertipe Date atau format tanggal, abaikan karena bukan no hp
        if (!(val instanceof Date)) {
          const str = String(val).trim();
          if (
            str !== "" &&
            !str.includes("GMT") &&
            !str.includes("Western Indonesia Time") &&
            !str.includes(":00:00")
          ) {
            noHp = str;
          }
        }
      }

      // 6. Ekstraksi Nama Suami
      const namaSuamiKey = Object.keys(row).find((k) => k.trim().toLowerCase().includes("suami"));
      const namaSuami = (namaSuamiKey && row[namaSuamiKey] ? String(row[namaSuamiKey]).trim() : undefined) || "-";

      // 7. Ekstraksi HPHT (Hari Pertama Haid Terakhir)
      let hpht = new Date();
      const hphtKey = Object.keys(row).find((k) => {
        const lower = k.trim().toLowerCase();
        if (lower.includes("hpl")) return false;
        return lower.includes("hpht") || lower.includes("haid terakhir") || lower.includes("hari pertama haid");
      });

      if (hphtKey && row[hphtKey]) {
        const raw = row[hphtKey];
        if (raw instanceof Date) {
          hpht = raw;
        } else {
          const parsed = new Date(raw);
          if (!isNaN(parsed.getTime())) {
            hpht = parsed;
          }
        }
      }

      // 8. Ekstraksi GPA (Riwayat Kehamilan)
      const gpa = findVal("gpa", "riwayat kehamilan", "gravida") || "-";

      // 9. Data Pemeriksaan Fisik & Vital
      const tekananDarah = findVal("tekanan darah", "tensi", "td", "mmhg");
      const beratBadan = parseNumber(findVal("berat badan", "bb"));
      const tinggiFundus = parseNumber(findVal("tinggi fundus", "tfu", "fundus"));
      const detakJantungJanin = parseNumber(findVal("denyut jantung", "detak jantung", "djj", "djl"))
        ? Math.round(parseNumber(findVal("denyut jantung", "detak jantung", "djj", "djl"))!)
        : undefined;

      // 10. OPSI B: Ekstraksi Data Tambahan (ANC, Eklampsia, Lab, Fisik Tambahan)
      const anc = findVal("anc", "kunjungan", "trimester");
      const eklampsia = findVal("eklampsia", "preeklampsia", "preeklamsia", "skrining pe", "pe");
      const lila = findVal("lila", "lingkar lengan");
      const tinggiBadan = findVal("tinggi badan", "tb");
      const hb = findVal("hb", "hemoglobin");
      const proteinUrine = findVal("protein urine", "protein urin", "protein");
      const glukosa = findVal("glukosa", "gula darah", "gds");
      const letakJanin = findVal("letak janin", "presentasi", "letak");
      const imunisasi = findVal("imunisasi", "status tt", "tt");
      const catatanUmum = findVal("keluhan", "keterangan", "catatan", "terapi", "tindakan");

      const catatanItems: string[] = [];
      if (anc) catatanItems.push(`ANC: ${anc}`);
      if (eklampsia) catatanItems.push(`Skrining Preeklamsia: ${eklampsia}`);
      if (lila) catatanItems.push(`LiLA: ${lila}${lila.toLowerCase().includes("cm") ? "" : " cm"}`);
      if (tinggiBadan) catatanItems.push(`TB: ${tinggiBadan}${tinggiBadan.toLowerCase().includes("cm") ? "" : " cm"}`);
      if (hb) catatanItems.push(`Hb: ${hb}${hb.toLowerCase().includes("g") ? "" : " g/dL"}`);
      if (proteinUrine) catatanItems.push(`Protein Urine: ${proteinUrine}`);
      if (glukosa) catatanItems.push(`Glukosa: ${glukosa}`);
      if (letakJanin) catatanItems.push(`Letak Janin: ${letakJanin}`);
      if (imunisasi) catatanItems.push(`Imunisasi TT: ${imunisasi}`);
      if (catatanUmum) catatanItems.push(`Ket: ${catatanUmum}`);

      const ringkasanCatatan = catatanItems.length > 0 ? catatanItems.join(" • ") : undefined;

      // Faktor Risiko
      let faktorRisiko = findVal("faktor risiko", "faktor resiko", "risiko", "resiko", "komplikasi") || "-";
      if (eklampsia && /tinggi|positif|peb|preeklamsia|eklamsia|waspada/i.test(eklampsia)) {
        faktorRisiko = faktorRisiko !== "-" 
          ? `${faktorRisiko}, Preeklampsia: ${eklampsia}` 
          : `Risiko Preeklampsia: ${eklampsia}`;
      }

      const hasPemeriksaan = Boolean(
        tekananDarah || 
        beratBadan !== undefined || 
        tinggiFundus !== undefined || 
        detakJantungJanin !== undefined || 
        ringkasanCatatan
      );

      let tanggalPemeriksaan = new Date();
      const rawTglPeriksa = findVal("tanggal periksa", "tgl periksa", "tgl kunjungan", "tanggal kunjung");
      if (rawTglPeriksa) {
        const parsed = new Date(rawTglPeriksa);
        if (!isNaN(parsed.getTime())) {
          tanggalPemeriksaan = parsed;
        }
      }

      validPasiensToCreate.push({
        dataPasien: {
          nama,
          nik,
          tanggalLahir,
          alamat,
          noHp,
          namaSuami,
          hpht,
          gpa,
          faktorRisiko,
          bidanId,
        },
        dataPemeriksaan: hasPemeriksaan ? {
          tanggal: tanggalPemeriksaan,
          tekananDarah: tekananDarah || "-",
          beratBadan: beratBadan || null,
          tinggiFundus: tinggiFundus || null,
          detakJantungJanin: detakJantungJanin || null,
          catatan: ringkasanCatatan || null,
        } : null,
      });
    }

    if (validPasiensToCreate.length === 0) {
      return { error: "Tidak ada data pasien yang valid untuk diimpor dari file ini." };
    }

    // Gunakan transaksi untuk menyimpan pasien beserta riwayat pemeriksaannya
    await prisma.$transaction(
      validPasiensToCreate.map(({ dataPasien, dataPemeriksaan }) =>
        prisma.pasien.create({
          data: {
            ...dataPasien,
            riwayat: dataPemeriksaan ? {
              create: [dataPemeriksaan],
            } : undefined,
          },
        })
      )
    );

    revalidatePath("/dashboard");
    return { success: true, count: validPasiensToCreate.length };
  } catch (error: any) {
    console.error("Error importing excel:", error);
    return { error: error.message || "Gagal mengunggah file" };
  }
}

export async function deletePasien(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Belum login" };
    }

    const pasien = await prisma.pasien.findUnique({
      where: { id },
    });

    if (!pasien || pasien.bidanId !== session.user.id) {
      return { error: "Pasien tidak ditemukan atau bukan milik Anda" };
    }

    // Hapus rekam medis terlebih dahulu
    await prisma.pemeriksaan.deleteMany({
      where: { pasienId: id },
    });

    // Hapus pasien
    await prisma.pasien.delete({
      where: { id },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting pasien:", error);
    return { error: error.message || "Gagal menghapus data pasien" };
  }
}

