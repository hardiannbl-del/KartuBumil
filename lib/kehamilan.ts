import { differenceInDays, differenceInYears, addDays, format } from 'date-fns';

/**
 * Menghitung usia kehamilan dalam minggu dan hari
 * @param hpht - Hari Pertama Haid Terakhir
 * @param tanggalSekarang - Tanggal saat ini atau tanggal periksa (opsional)
 * @returns String format "X minggu Y hari"
 */
export function hitungUsiaKehamilan(hpht: Date, tanggalSekarang: Date = new Date()): string {
  const selisihHari = differenceInDays(tanggalSekarang, hpht);
  
  if (selisihHari < 0) {
    return 'Belum hamil';
  }

  const minggu = Math.floor(selisihHari / 7);
  const hari = selisihHari % 7;

  return `${minggu} minggu ${hari} hari`;
}

/**
 * Menghitung Hari Perkiraan Lahir (HPL) menggunakan rumus Naegele (HPHT + 280 hari)
 * @param hpht - Hari Pertama Haid Terakhir
 * @returns Date HPL
 */
export function hitungHPL(hpht: Date): Date {
  return addDays(hpht, 280);
}

/**
 * Menghitung umur dalam tahun
 * @param tanggalLahir - Tanggal Lahir
 * @param tanggalSekarang - Tanggal saat ini (opsional)
 * @returns Umur dalam angka
 */
export function hitungUmur(tanggalLahir: Date, tanggalSekarang: Date = new Date()): number {
  return differenceInYears(tanggalSekarang, tanggalLahir);
}

/**
 * Format tanggal ke dalam format lokal Indonesia (DD/MM/YYYY)
 * @param date - Tanggal
 * @returns String tanggal terformat
 */
export function formatTanggal(date: Date): string {
  return format(date, 'dd/MM/yyyy');
}
