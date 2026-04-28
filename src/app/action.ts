// app/actions.ts
"use server";

import { cookies } from "next/headers";

export async function authenticateUser(email: string, pass: string) {
  // Ambil data dari env (jika tidak ada di env, pakai default agar local aman)
  const envEmail = process.env.APP_LOGIN_EMAIL || "admin@cubybot.net";
  const envPass = process.env.APP_LOGIN_PASSWORD || "Eren123#";
  const secretToken =
    process.env.AUTH_SECRET_TOKEN || "token_rahasia_lokal_123";

  if (email === envEmail && pass === envPass) {
    const cookieStore = await cookies();
    cookieStore.set("auth_token", secretToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });
    return { success: true };
  }
  return { success: false, error: "Email atau password salah." };
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
}

export async function processReceipt(formData: FormData) {
  // --- SECURITY CHECK ---
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const expectedToken =
    process.env.AUTH_SECRET_TOKEN || "token_rahasia_lokal_123";

  if (token !== expectedToken) {
    console.error(
      "UNAUTHORIZED: Seseorang mencoba mengakses API melalui Server Action!",
    );
    return { error: "Akses ditolak! Anda belum login." };
  }
  // ----------------------

  const file = formData.get("file"); // Ambil file dari form

  // Kita bungkus lagi ke FormData untuk dikirim ke Elysia
  const body = new FormData();
  body.append("file", file as File);

  try {
    const response = await fetch(
      `${process.env.INTERNAL_OCR_URL}/ocr/mindee/file`,
      {
        method: "POST",
        body: body, // Next.js otomatis set header multipart/form-data
      },
    );

    console.log(
      "url internal ocr env readed :::::",
      process.env.INTERNAL_OCR_URL,
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Elysia Error: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("OCR_ACTION_ERROR:", error);
    return { error: "Gagal memproses struk" };
  }
}
