/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LBHContact {
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  description: string;
}

// Actual curated Lembaga Bantuan Hukum (LBH) across major cities in Indonesia
export const LBH_DIRECTORY: LBHContact[] = [
  {
    name: "YLBHI (Yayasan Lembaga Bantuan Hukum Indonesia) Pusat",
    address: "Jl. Pangeran Diponegoro No. 74, Menteng, Kec. Menteng, Jakarta Pusat",
    city: "Jakarta Pusat",
    phone: "(021) 3929840",
    email: "info@ylbhi.or.id",
    website: "https://ylbhi.or.id",
    description: "Induk jaringan LBH seluruh Indonesia, menyediakan bantuan hukum struktural bagi masyarakat miskin, buta hukum, dan tertindas."
  },
  {
    name: "LBH Jakarta",
    address: "Jl. Pangeran Diponegoro No. 74, RT.9/RW.2, Pegangsaan, Kec. Menteng, Jakarta Pusat",
    city: "Jakarta Pusat",
    phone: "(021) 3145456",
    email: "office@bantuanhukum.or.id",
    website: "https://bantuanhukum.or.id",
    description: "Fokus mendampingi kasus perburuhan, sengketa tanah, kaum miskin kota, minoritas, dan advokasi HAM sipil di wilayah Jabodetabek."
  },
  {
    name: "LBH Bandung",
    address: "Jl. Sentot Alibasa No. 24, Citarum, Kec. Bandung Wetan, Bandung, Jawa Barat",
    city: "Bandung",
    phone: "(022) 7215285",
    email: "lbhbdg@gmail.com",
    website: "http://lbhbandung.or.id",
    description: "Pendampingan hukum dasar gratis untuk isu-isu sengketa konsumen, hak-hak pekerja, serta sengketa lingkungan sosial di Jawa Barat."
  },
  {
    name: "LBH Surabaya",
    address: "Jl. Kidal No. 6, Pacar Keling, Kec. Tambaksari, Surabaya, Jawa Timur",
    city: "Surabaya",
    phone: "(031) 5022273",
    email: "surabaya.lbh@gmail.com",
    website: "https://lbhsurabaya.or.id",
    description: "Layanan advokasi rakyat miskin kota, kebebasan berekspresi, penanganan sengketa buruh dan perempuan di Jawa Timur."
  },
  {
    name: "LBH Yogyakarta",
    address: "Jl. Benowo No.252, Prenggan, Kotagede, Yogyakarta",
    city: "Yogyakarta",
    phone: "(0274) 376668",
    email: "lbhyogya@gmail.com",
    website: "https://lbhyogyakarta.or.id",
    description: "Menyediakan pembelaan hukum struktural, pendidikan paralegal, sengketa sosiologis tanah, dan isu adat di wilayah Jogja."
  },
  {
    name: "LBH Makassar",
    address: "Jl. Nikel I Blok A 22 No.11, Mapala, Kec. Rappocini, Kota Makassar, Sulawesi Selatan",
    city: "Makassar",
    phone: "(0411) 869632",
    email: "lbhmakassar@gmail.com",
    website: "https://lbhmakassar.org",
    description: "Pusat bantuan hukum gratis tertua di Indonesia Timur untuk mendampingi nelayan, kaum marginal, sengketa adat dan pidana umum."
  },
  {
    name: "LBH Medan",
    address: "Jl. Sei Kambing No. 12-C, Merdeka, Kec. Medan Baru, Kota Medan, Sumatera Utara",
    city: "Medan",
    phone: "(061) 4513813",
    email: "lbhmdn@gmail.com",
    website: "https://lbhmedan.org",
    description: "Mendampingi masyarakat miskin di wilayah Sumatera Utara dalam kasus ketenagakerjaan, hak agraria, dan perlindungan saksi/korban."
  },
  {
    name: "Posbakum (Pos Bantuan Hukum) PN Jakarta Selatan",
    address: "Jl. Ampera Raya No.133, RT.5/RW.10, Ragunan, Pasar Minggu, Jakarta Selatan",
    city: "Jakarta Selatan",
    phone: "(021) 7810793",
    email: "info@pn-jakartaselatan.go.id",
    website: "https://pn-jakartaselatan.go.id",
    description: "Unit bantuan hukum di lingkungan Pengadilan Negeri untuk pembuatan gugatan hukum/jawaban gratis bagi masyarakat tidak mampu secara ekonomi."
  },
  {
    name: "Komnas Perempuan (Komisi Nasional Anti Kekerasan terhadap Perempuan)",
    address: "Jl. Latuharhari No. 4B, RT.1/RW.4, Menteng, Jakarta Pusat",
    city: "Jakarta",
    phone: "(021) 3903963",
    email: "mail@komnasperempuan.go.id",
    website: "https://komnasperempuan.go.id",
    description: "Lembaga HAM nasional dengan mandat khusus perlindungan hak perempuan dari KDRT, pelecehan seksual, sengketa hak asuh, dan diskriminasi."
  }
];

export function listLBH(cityQuery?: string): LBHContact[] {
  if (!cityQuery) return LBH_DIRECTORY;
  
  const query = cityQuery.toLowerCase().trim();
  return LBH_DIRECTORY.filter(lbh => 
    lbh.city.toLowerCase().includes(query) || 
    lbh.name.toLowerCase().includes(query) || 
    lbh.address.toLowerCase().includes(query)
  );
}

export interface OCRResult {
  success: boolean;
  documentType: string;
  parties: string[];
  keyDates: { label: string; date: string }[];
  keyArticles: { num: string; summary: string }[];
  risksDetected: string[];
  recommendations: string[];
  originalSnippets: string;
}

/**
 * Mock OCR Legal Document Reader.
 * In a real-world app, this would query a Google Cloud Vision API or Gemini Multimodal Base64 Parser to summarize.
 */
export async function processDocumentOCR(fileContentBase64: string, filename: string): Promise<OCRResult> {
  // Simulate OCR loading delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const lowerFilename = filename.toLowerCase();
  
  if (lowerFilename.includes("sewa") || lowerFilename.includes("kontrak") || lowerFilename.includes("perjanjian")) {
    return {
      success: true,
      documentType: "Perjanjian Sewa Menyewa (SPSM)",
      parties: ["Pihak Pertama (Pemilik Properti)", "Pihak Kedua (Penyewa)"],
      keyDates: [
        { label: "Tanggal Penandatanganan", date: "10 Januari 2026" },
        { label: "Mulai Masa Sewa", date: "1 Februari 2026" },
        { label: "Akhir Masa Sewa", date: "1 Februari 2027" }
      ],
      keyArticles: [
        { num: "Pasal 3", summary: "Uang jaminan (deposit) wajib ditransfer senilai Rp 5.000.000 dan harus dikembalikan setelah sisa tagihan diselesaikan." },
        { num: "Pasal 7", summary: "Kerusakan struktur utama (atap bocor parah, dinding retak besar) ditanggung oleh Pemilik. Kerusakan ringan ditanggung Penyewa." },
        { num: "Pasal 10", summary: "Denda keterlambatan pembayaran sewa dihitung per hari sesudah tanggal 5 setiap bulan berjalan." }
      ],
      risksDetected: [
        "Definisi 'kerusakan ringan' tidak dirinci secara spesifik, berpotensi memicu sengketa uang deposit di akhir masa sewa.",
        "Denda keterlambatan dihitung harian tanpa batas maksimum (cap value), berpotensi menumpuk hingga nominal yang tidak wajar."
      ],
      recommendations: [
        "Minta pemilik merinci daftar komponen 'perbaikan ringan' yang menjadi beban Anda di dalam addendum baru.",
        "Usulkan batas atas denda keterlambatan maksimal sebesar 10% dari total sewa tahunan.",
        "Pastikan kondisi awal bangunan difoto menyeluruh dan dilampirkan dalam Berita Acara Serah Terima (BAST)."
      ],
      originalSnippets: "Dikutip lewat deteksi otomatis surat kontrak sewa..."
    };
  }

  if (lowerFilename.includes("kerja") || lowerFilename.includes("kontrak_kerja") || lowerFilename.includes("phk")) {
    return {
      success: true,
      documentType: "Perjanjian Kerja PKWT / PKWTT atau Surat PHK",
      parties: ["Perusahaan (Pemberi Kerja)", "Karyawan (Penerima Kerja)"],
      keyDates: [
        { label: "Dimulai Hubungan Kerja", date: "1 Juni 2024" },
        { label: "Masa Percobaan (Probation)", date: "3 Bulan (Hingga 1 September 2024)" }
      ],
      keyArticles: [
        { num: "Pasal 5", summary: "Waktu kerja diatur senilai 40 jam seminggu. Lembur harus disepakati lewat Surat Perintah Lembur (SPL)." },
        { num: "Pasal 12", summary: "Pemutusan hubungan kerja sepihak sebelum masa kontrak habis menuntut ganti rugi sebesar upah hingga sisa berakhirnya masa kontrak." }
      ],
      risksDetected: [
        "Klausul ganti rugi pemutusan kontrak sepihak dinilai sangat memberatkan jika inisiatif pengakhiran berasal dari karyawan karena alasan Force Majeure.",
        "Ketiadaan jaminan kompensasi proporsional UU Cipta Kerja yang tertulis di dalam draf lama."
      ],
      recommendations: [
        "Pastikan hak uang kompensasi PKWT setelah berakhirnya masa waktu tetap dicantumkan sesuai PP No. 35 Tahun 2021.",
        "Negosiasikan ulang klausul pemberitahuan mengundurkan diri (one-month notice) agar dibebaskan dari klausul denda ganti rugi perdata."
      ],
      originalSnippets: "Analisis teks otomatis dari draf ketenagakerjaan..."
    };
  }

  // Fallback default legal parser analysis
  return {
    success: true,
    documentType: "Dokumen Hukum Umum / Surat Pernyataan",
    parties: ["Pihak Penandatangan Utama", "Pihak Terkait"],
    keyDates: [
      { label: "Tanggal Pembuatan", date: "Hari pembuatan dokumen" }
    ],
    keyArticles: [
      { num: "Pasal / Klausul Utama", summary: "Mengatur komitmen, pernyataan pertanggungjawaban, atau pelepasan klaim hukum." }
    ],
    risksDetected: [
      "Kalimat terlalu luas dan dapat dimaknai ganda (multitafsir).",
      "Klausul penyelesaian sengketa langsung merujuk ke pengadilan tanpa mewajibkan mediasi keluarga (ADR) terlebih dahulu."
    ],
    recommendations: [
      "Tambahkan klausul mediasi kekeluargaan selama 30 hari sebelum melangkah ke proses persidangan perdata.",
      "Gunakan meterai Rp 10.000 yang ditandatangani secara tumpang-tindih dengan nama terang."
    ],
    originalSnippets: "Teks terdeteksi dari surat pernyataan umum..."
  };
}
