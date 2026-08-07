"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

export async function getPasiens(bidanId: string, search?: string) {
  return prisma.pasien.findMany({
    where: {
      bidanId,
      nama: search ? { contains: search } : undefined, // Case-insensitive works well in PG, in SQLite might be case-sensitive, better to use standard matching or convert to lowercase for production
    },
    orderBy: {
      createdAt: "desc",
    },
  });
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
