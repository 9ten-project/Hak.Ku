/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LegalArticle {
  id: string;
  category: string;
  title: string;
  description: string;
  uuReference: string;
  keyPoints: string[];
  recommendedSteps: string[];
  requiredDocuments: string[];
}

export const LEGAL_KNOWLEDGE_BASE: LegalArticle[] = [
  {
    id: "kb-sewa-menyewa",
    category: "perjanjian sewa",
    title: "Hak & Kewajiban Sewa Menyewa Properti",
    description: "Sewa-menyewa diatur dalam Kitab Undang-Undang Hukum Perdata (KUHPerdata). Pada dasarnya, penyewa berhak menempati properti yang layak dan pemilik berhak menerima uang sewa serta merawat kerangka utama properti.",
    uuReference: "Pasal 1548 - Pasal 1600 KUHPerdata",
    keyPoints: [
      "Pemilik wajib menyerahkan barang sewaan dalam keadaan baik dan memelihara kerusakan struktural utama.",
      "Penyewa wajib membayar uang sewa tepat waktu sesuai kesepakatan.",
      "Penyewa wajib memakai barang sewaan sebagai kepala rumah tangga yang baik, tidak merusak atau merubah fungsi tanpa izin.",
      "Kerusakan kecil/pemeliharaan harian biasanya menjadi tanggung jawab penyewa, kecuali diperjanjikan lain."
    ],
    recommendedSteps: [
      "Buat surat perjanjian sewa tertulis bermeterai Rp 10.000.",
      "Buat Berita Acara Serah Terima (BAST) fisik beserta foto kondisi awal properti.",
      "Sepakati klausul pengembalian uang jaminan (deposit sewa) sewaktu masa sewa berakhir.",
      "Jika terjadi sengketa, upayakan musyawarah mufakat (mediasi kekeluargaan) terlebih dahulu sebelum melayangkan somasi."
    ],
    requiredDocuments: [
      "KTP Pemilik dan Penyewa",
      "Surat Perjanjian Sewa Menyewa (SPSM) tertulis",
      "Sertifikat Kepemilikan Properti (copy untuk validasi penyewa)",
      "Kwitansi Bukti Pembayaran Sewa dan Uang Jaminan (Deposit)"
    ]
  },
  {
    id: "kb-utang-piutang",
    category: "utang piutang",
    title: "Sengketa Utang Piutang & Perlindungan Konsumen",
    description: "Sengketa utang-piutang merupakan ranah perdata. Prinsip dasar 'Pacta Sunt Servanda' menegaskan bahwa semua perjanjian yang dibuat secara sah berlaku sebagai undang-undang bagi mereka yang membuatnya. Penting diingat: seseorang tidak dapat dipidana penjara semata-mata karena tidak mampu melunasi utang.",
    uuReference: "Pasal 1338 KUHPerdata & UU No. 39 Tahun 1999 tentang HAM Pasal 19 ayat 2",
    keyPoints: [
      "Utang piutang murni adalah kasus perdata, bukan pidana. Larangan mempidanakan penunggak utang diatur tegas dalam UU HAM.",
      "Namun, jika ada unsur penipuan, pemalsuan identitas, atau cek kosong di awal perjanjian, kasus dapat bergeser ke ranah pidana penipuan (Pasal 378 KUHP).",
      "Bunga utang yang terlampau tinggi (predatory lending/pinjol ilegal) bertentangan dengan kesusilaan dan regulasi OJK."
    ],
    recommendedSteps: [
      "Periksa legalitas kreditur (apakah terdaftar di Otoritas Jasa Keuangan / OJK jika berupa lembaga).",
      "Ajukan restrukturisasi utang (keringanan cicilan, perpanjangan waktu, atau pengurangan bunga) secara tertulis jika kesulitan membayar.",
      "Kumpulkan bukti komunikasi jika ditagih oleh DC (debt collector) dengan cara intimidasi atau kekerasan.",
      "Laporkan ke pihak kepolisian atau Satgas Pasti jika mendapati penagihan sepihak yang melanggar hukum dari pinjol ilegal."
    ],
    requiredDocuments: [
      "Surat Perjanjian Utang Piutang (SPUP) atau Perjanjian Kredit",
      "Bukti Transfer Aliran Dana",
      "Riwayat Pembayaran atau Mutasi Rekening",
      "Klip Penagihan / Screenshot Chat/Rekaman Suara jika ada intimidasi"
    ]
  },
  {
    id: "kb-ketenagakerjaan",
    category: "ketenagakerjaan",
    title: "Hak Karyawan Terkena PHK & Hak Pesangon",
    description: "Pemutusan Hubungan Kerja (PHK) harus mengikuti prosedur hukum yang ketat dan pekerja berhak atas kompensasi berupa uang pesangon, uang penghargaan masa kerja (UPMK), dan uang penggantian hak (UPH).",
    uuReference: "UU No. 13 Tahun 2003 tentang Ketenagakerjaan jo. UU No. 6 Tahun 2023 tentang Penetapan Perpu Cipta Kerja",
    keyPoints: [
      "Perusahaan wajib mengupayakan agar tidak terjadi PHK. Jika tetap terjadi, wajib diberitahukan resmi minimal 14 hari kerja sebelumnya.",
      "Kompensasi PHK terdiri atas: Uang Pesangon, UPMK (Uang Penghargaan Masa Kerja), dan UPH (Uang Penggantian Hak seperti sisa cuti, ongkos pulang).",
      "Karyawan PKWT (Kontrak) yang di-PHK sebelum masa kontrak habis berhak atas uang ganti rugi sebesar upah hingga sisa kontrak selesai, serta uang kompensasi proporsional."
    ],
    recommendedSteps: [
      "Jangan langsung menandatangani surat persetujuan PHK secara tergesa-gesa sebelum membaca nominal hak kompensasi.",
      "Lakukan perundingan Bipartit tertulis dengan manajemen perusahaan dalam waktu selambatnya 30 hari.",
      "Jika bipartit gagal, buat risalah bipartit dan ajukan mediasi Tripartit ke Dinas Ketenagakerjaan (Disnaker) setempat.",
      "Ajukan gugatan ke Pengadilan Hubungan Industrial (PHI) hanya jika mediasi Disnaker tidak membuahkan hasil."
    ],
    requiredDocuments: [
      "Surat Kontrak Kerja (PKWT/PKWTT)",
      "Slip Gaji 3 bulan terakhir",
      "Surat Pemberitahuan PHK",
      "Bukti Korespondensi (Email/WhatsApp) terkait penolakan atau proses PHK"
    ]
  },
  {
    id: "kb-keluarga",
    category: "keluarga",
    title: "Perceraian, Hak Asuh Anak & Nafkah",
    description: "Perceraian di Indonesia diproses melalui Pengadilan Agama bagi yang beragama Islam, dan Pengadilan Negeri bagi yang beragama non-Islam. Penyelesaian mencakup pemutusan ikatan perkawinan, pembagian harta bersama (gono-gini), hak asuh, serta nafkah anak.",
    uuReference: "UU No. 1 Tahun 1974 tentang Perkawinan jo. UU No. 16 Tahun 2019",
    keyPoints: [
      "Perceraian hanya dapat dilakukan di depan sidang Pengadilan setelah pengadilan berusaha dan tidak berhasil mendamaikan kedua belah pihak.",
      "Alasan perceraian harus memenuhi ketentuan undang-undang (salah satu pihak berbuat zina, pemabuk, meninggalkan pihak lain 2 tahun berturut-turut, kekerasan/KDRT, sengketa terus menerus).",
      "Hak asuh anak di bawah umur (di bawah 12 tahun/belum mumayyiz) umumnya jatuh ke tangan ibu, dengan biaya nafkah tetap ditanggung ayah sesuai kemampuan."
    ],
    recommendedSteps: [
      "Upayakan mediasi keluarga non-formal terlebih dahulu.",
      "Siapkan alasan-alasan kuat yang disertai bukti konkret (misal saksi, dokumen atau bukti KDRT).",
      "Daftarkan gugatan cerai (Gugatan Cerai oleh istri atau Permohonan Talak oleh suami) ke Pengadilan Agama/Negeri sesuai domisili tergugat.",
      "Ikuti proses mediasi wajib (Mediasi Court-Annexed) di Pengadilan di awal persidangan."
    ],
    requiredDocuments: [
      "Buku Nikah (KUA) atau Akta Perkawinan (Catatan Sipil) asli",
      "Akta Kelahiran Anak (jika menuntut hak asuh)",
      "Kartu Keluarga (KK) dan KTP Penggugat",
      "Bukti pendukung alasan cerai (Visum jika ada KDRT, foto, saksi minimal 2 orang)"
    ]
  },
  {
    id: "kb-penipuan",
    category: "perlindungan konsumen / penipuan",
    title: "Langkah Hukum Menghadapi Penipuan Online",
    description: "Penipuan transaksi online, arisan bodong, investasi ilegal, atau manipulasi digital merupakan tindak pidana yang diatur dalam KUHP dan Undang-Undang Informasi dan Transaksi Elektronik (UU ITE).",
    uuReference: "Pasal 378 KUHP (Penipuan) & Pasal 28 ayat (1) UU ITE (Menyebarkan Berita Bohong/Menyesatkan yang merugikan konsumen)",
    keyPoints: [
      "Penipuan online yang merugikan keuangan konsumen dalam transaksi elektronik diancam pidana penjara paling lama 6 tahun.",
      "Penyidik kepolisian khusus (Siber) berwenang memblokir rekening penerima aliran dana kejahatan berdasarkan laporan korban.",
      "Korban penipuan bisa mengupayakan pengembalian dana atau ganti rugi lewat gugatan perdata ganti kerugian atau restitusi dalam persidangan pidana."
    ],
    recommendedSteps: [
      "Segera dokumentasikan seluruh bukti percakapan, nomor rekening penipu, nomor telepon, dan tautan akun media sosial pelaku.",
      "Laporkan nomor rekening penipu ke situs resmi CekRekening.id milik Kominfo agar diblokir.",
      "Minta surat keterangan penipuan dari Kepolisian Sektor (Polsek) atau Kepolisian Resor (Polres) terdekat.",
      "Bawa surat kepolisian tersebut ke bank pengirim/penerima untuk memohon pembekuan rekening pelaku sesegera mungkin."
    ],
    requiredDocuments: [
      "Tangkapan Layar (Screenshot) Bukti Chat dan Bukti Iklan/Situs",
      "Bukti Transfer (Struk ATM, mutasi m-banking, link e-wallet)",
      "Nomor Rekening, Nama Bank, dan Nama Pemilik Rekening Pelaku",
      "KTP Korban"
    ]
  },
  {
    id: "kb-sengketa-tetangga",
    category: "sengketa tetangga",
    title: "Penyelesaian Sengketa Hubungan Tetangga",
    description: "Sengketa bertetangga seperti tembok batas, air tirisan atap, dahan pohon yang melintasi pekarangan, saluran pembuangan, atau kebisingan diatur dalam asas bertetangga atau hukum perbuatan melanggar hukum (PMH).",
    uuReference: "Pasal 1365 KUHPerdata (Perbuatan Melanggar Hukum) & Pasal 625 - 672 KUHPerdata tentang Hak Bertetangga",
    keyPoints: [
      "Setiap pemilik pekarangan wajib mengatur agar air hujan atau tirisan atap tidak jatuh langsung ke pekarangan tetangga.",
      "Dahan pohon milik tetangga yang dahan atau akarnya menjalar ke halaman kita boleh dipaksa untuk dipotong setelah diberi peringatan.",
      "Kebisingan atau polusi udara yang ekstrem di lingkungan pemukiman dapat digugat atas dasar Perbuatan Melanggar Hukum (PMH) jika menimbulkan kerugian nyata."
    ],
    recommendedSteps: [
      "Bicarakan secara baik-baik secara pribadi dengan tetangga bermasalah dengan kepala dingin.",
      "Libatkan Ketua RT dan RW untuk melakukan musyawarah mediasi warga tingkat lingkungan.",
      "Apabila perlu, minta bantuan aparat kelurahan / Babinkamtibmas setempat untuk menengahi sengketa secara damai.",
      "Gunakan gugatan PMH perdata sebagai jalan paling terakhir di Pengadilan Negeri jika terjadi kerugian material yang besar."
    ],
    requiredDocuments: [
      "Foto atau Rekaman Video Kejadian/Sengketa yang dipermasalahkan",
      "Sertifikat Tanah / Denah Rumah (untuk membuktikan batas kepemilikan)",
      "Surat Pernyataan / Surat Rekomendasi dari Ketua RT/RW setempat terkait sengketa",
      "Bukti rincian kerugian material (jika ada barang/konstruksi yang rusak)"
    ]
  },
  {
    id: "kb-waris-dasar",
    category: "waris dasar",
    title: "Hukum Waris Dasar di Indonesia",
    description: "Di Indonesia, terdapat tiga sistem hukum waris yang diakui dan berlaku secara berdampingan: Hukum Waris Perdata Barat (KUHPerdata) untuk non-Islam, Hukum Waris Islam (KHI) untuk pemeluk agama Islam, dan Hukum Waris Adat sesuai suku asal.",
    uuReference: "Buku II KUHPerdata, Kompilasi Hukum Islam (KHI) Instruksi Presiden No. 1 Tahun 1991, & Hukum Adat",
    keyPoints: [
      "Waris Islam: Mengatur porsi tetap (Asabah, Dzawil Furud) antara ahli waris laki-laki dan perempuan (perbandingan 2:1), didasarkan pada KHI.",
      "Waris Perdata: Mengatur empat golongan ahli waris berdasarkan kedekatan hubungan darah, tanpa membedakan porsi gender.",
      "Waris tidak dapat dibagi sebelum utang-utang sah milik pewaris dilunasi terlebih dahulu dari harta peninggalan."
    ],
    recommendedSteps: [
      "Identifikasi siapa saja ahli waris yang sah berdasar aturan hukum yang disepakati (Islam/Perdata/Adat).",
      "Buat Surat Keterangan Ahli Waris (SKAW) yang ditandatangani RT/RW dan disahkan oleh Lurah dan Camat, atau penetapan Pengadilan Agama/Negeri.",
      "Inventarisasi seluruh aset harta peninggalan serta daftar utang-piutang milik pewaris.",
      "Lakukan musyawarah pembagian waris secara tertulis demi menghindari perselisihan di kemudian hari."
    ],
    requiredDocuments: [
      "Akte Kematian Pewaris asli",
      "Surat Keterangan Ahli Waris (SKAW) sah",
      "Kartu Keluarga dan KTP seluruh Ahli Waris",
      "Sertifikat Tanah, Buku Tabungan, BPKB, atau dokumen aset lainnya"
    ]
  }
];

export function findArticleByQuery(query: string): LegalArticle[] {
  const normalizedQuery = query.toLowerCase();
  
  // Scored matching
  const matchingWithScores = LEGAL_KNOWLEDGE_BASE.map(article => {
    let score = 0;
    
    if (article.category.toLowerCase().includes(normalizedQuery)) score += 10;
    if (article.title.toLowerCase().includes(normalizedQuery)) score += 8;
    if (article.description.toLowerCase().includes(normalizedQuery)) score += 5;
    
    // Keyword matching
    const keywords = normalizedQuery.split(/\s+/);
    keywords.forEach(keyword => {
      if (keyword.length < 3) return;
      if (article.title.toLowerCase().includes(keyword)) score += 3;
      if (article.description.toLowerCase().includes(keyword)) score += 2;
      if (article.category.toLowerCase().includes(keyword)) score += 3;
      article.keyPoints.forEach(point => {
        if (point.toLowerCase().includes(keyword)) score += 1;
      });
    });
    
    return { article, score };
  });

  return matchingWithScores
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.article);
}
