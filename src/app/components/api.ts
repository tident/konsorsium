// src/app/components/api.ts

const API_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;

if (!API_URL) {
  console.warn("Peringatan: NEXT_PUBLIC_APPS_SCRIPT_URL belum diatur di .env.local");
}

/**
 * Fungsi pembantu untuk mengirim data ke Google Apps Script.
 * Menggunakan x-www-form-urlencoded sesuai standar untuk menghindari masalah CORS.
 */
export async function callApi(action: string, payload: Record<string, any> = {}) {
  const formData = new URLSearchParams();
  formData.append("action", action);

  // Masukkan semua data lain ke dalam formData
  for (const key in payload) {
    formData.append(key, payload[key]);
  }

  try {
    const response = await fetch(API_URL as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: "Gagal terhubung ke server API" };
  }
}