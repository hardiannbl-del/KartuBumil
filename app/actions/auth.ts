"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function registerBidan(formData: FormData) {
  const nama = formData.get("nama") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!nama || !email || !password) {
    return { error: "Semua field harus diisi" };
  }

  // Check if email already exists
  const existingBidan = await prisma.bidan.findUnique({
    where: { email },
  });

  if (existingBidan) {
    return { error: "Email sudah terdaftar" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.bidan.create({
    data: {
      nama,
      email,
      password: hashedPassword,
    },
  });

  redirect("/login");
}
