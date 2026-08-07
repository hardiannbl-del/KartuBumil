"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPemeriksaan(formData: FormData) {
  const pasienId = formData.get("pasienId") as string;
  const tekananDarah = formData.get("tekananDarah") as string;
  const beratBadanStr = formData.get("beratBadan") as string;
  const tinggiFundusStr = formData.get("tinggiFundus") as string;
  const detakJantungJaninStr = formData.get("detakJantungJanin") as string;
  const catatan = formData.get("catatan") as string;

  const beratBadan = beratBadanStr ? parseFloat(beratBadanStr) : null;
  const tinggiFundus = tinggiFundusStr ? parseFloat(tinggiFundusStr) : null;
  const detakJantungJanin = detakJantungJaninStr ? parseInt(detakJantungJaninStr, 10) : null;

  await prisma.pemeriksaan.create({
    data: {
      pasienId,
      tekananDarah: tekananDarah || null,
      beratBadan,
      tinggiFundus,
      detakJantungJanin,
      catatan: catatan || null,
    },
  });

  revalidatePath(`/pasien/${pasienId}`);
  // Also revalidate the public page if we want, or just wait for revalidate cache timeout
}
