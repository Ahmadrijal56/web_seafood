import type { Badge, ProductType, StockStatus } from "@sfs/shared";

export interface SeedCategory {
  slug: string;
  name: string;
  icon: string;
  description: string;
  image: string;
}

export const categories: SeedCategory[] = [
  { slug: "ikan", name: "Ikan Laut", icon: "fish", description: "Kakap, kerapu, bawal, selar, tongkol & lainnya", image: "photos/DebqliVoFCc" },
  { slug: "udang", name: "Udang & Lobster", icon: "shrimp", description: "Vaname, windu, tiger jumbo, lobster", image: "photos/Deb-1d5zsVw" },
  { slug: "kepiting", name: "Kepiting", icon: "crab", description: "Kepiting bakau & rajungan", image: "photos/5ZjIUDYl51g" },
  { slug: "cumi", name: "Cumi & Sotong", icon: "squid", description: "Cumi segar, sotong, cumi jumbo", image: "photos/59ecG-H1FLI" },
  { slug: "kerang", name: "Kerang", icon: "shell", description: "Kerang hijau & kerang dara", image: "photos/DeT5cP5zCoV" },
];

type Processing = { label: string; extra: number }[];

const PROC_IKAN: Processing = [
  { label: "Utuh", extra: 0 },
  { label: "Dibersihkan (siangi)", extra: 3000 },
  { label: "Potong steak", extra: 5000 },
  { label: "Fillet", extra: 20000 },
];
const PROC_IKAN_KECIL: Processing = [
  { label: "Utuh", extra: 0 },
  { label: "Dibersihkan (siangi)", extra: 5000 },
];
const PROC_UDANG: Processing = [
  { label: "Utuh", extra: 0 },
  { label: "Buang kepala", extra: 8000 },
  { label: "Kupas (sisakan ekor)", extra: 15000 },
];
const PROC_CUMI: Processing = [
  { label: "Utuh", extra: 0 },
  { label: "Dibersihkan", extra: 5000 },
  { label: "Potong ring", extra: 8000 },
];
const PROC_KEPITING: Processing = [
  { label: "Utuh (hidup)", extra: 0 },
  { label: "Dibersihkan & dipotong", extra: 5000 },
];
const PROC_KERANG: Processing = [
  { label: "Utuh", extra: 0 },
  { label: "Dicuci bersih", extra: 3000 },
];

const TIPS_IKAN =
  "Bakar: lumuri jeruk nipis & garam 10 menit, olesi bumbu kecap, bakar di bara sedang ±15 menit per sisi.\nGoreng: keringkan dengan tisu dapur, balur tepung tipis, goreng di minyak panas sampai kecokelatan.\nSimpan di freezer maksimal 1 bulan; cairkan pelan di kulkas.";
const TIPS_UDANG =
  "Saus padang: tumis bawang, cabai, saus tomat & sambal, masukkan udang, masak 3–4 menit sampai berubah warna (jangan terlalu lama agar tetap juicy).\nSimpan di freezer dalam wadah berisi sedikit air agar tidak kering.";
const TIPS_CUMI =
  "Cumi goreng tepung: potong ring, rendam susu/air jeruk 10 menit, balur tepung bumbu, goreng cepat 1–2 menit.\nKunci cumi empuk: masak sangat cepat atau sangat lama (rebus ±40 menit).";
const TIPS_KEPITING =
  "Simpan kepiting hidup di kulkas bawah (bukan freezer) dengan kain lembap, maksimal 1–2 hari.\nKukus 15–20 menit, atau masak saus padang/lada hitam setelah dikukus 10 menit.";
const TIPS_KERANG =
  "Rendam kerang di air garam 30 menit agar pasir keluar. Rebus dengan serai, jahe & daun jeruk ±5 menit sampai cangkang terbuka. Buang yang tidak terbuka.";

export interface SeedProduct {
  slug: string;
  name: string;
  category: string;
  type: ProductType;
  size?: string;
  short: string;
  description: string;
  tips: string;
  price: number | null;
  showPrice?: boolean;
  compare?: number;
  tiers?: [number, number][];
  processing: Processing;
  weights?: number[];
  minOrder?: number;
  stock?: StockStatus;
  badges?: Badge[];
  featured?: boolean;
  sold: number;
  images: string[];
}

export const products: SeedProduct[] = [
  // ----- Udang & Lobster -----
  {
    slug: "udang-vaname",
    name: "Udang Vaname",
    category: "udang",
    type: "fresh",
    size: "size 40–50",
    short: "Udang vaname segar, daging manis & kenyal. Favorit untuk saus padang dan goreng tepung.",
    description:
      "Udang vaname segar hasil tambak & lelang TPI Muara Angke pagi ini. Ukuran 40–50 ekor per kg, kulit bening, kepala menempel kuat — tanda masih sangat segar. Disortir satu per satu dan dikemas dengan es curah agar tetap dingin sampai di dapur Anda.",
    tips: TIPS_UDANG,
    price: 95000,
    compare: 105000,
    tiers: [
      [5, 90000],
      [10, 85000],
    ],
    processing: PROC_UDANG,
    badges: ["best_seller", "today_catch"],
    featured: true,
    sold: 412,
    images: ["photos/Deb-1d5zsVw", "photos/DeZAHEfzoCw", "photos/8d1qm1db_Hc", "photos/9rcDG5BTn34"],
  },
  {
    slug: "udang-windu",
    name: "Udang Windu",
    category: "udang",
    type: "fresh",
    size: "size 20–25",
    short: "Udang windu besar bergaris, tekstur padat. Cocok bakar & asam manis.",
    description:
      "Udang windu (tiger prawn) ukuran 20–25 ekor per kg dengan garis khas dan daging tebal. Pilihan utama restoran seafood untuk menu bakar madu, asam manis, atau tempura.",
    tips: TIPS_UDANG,
    price: 165000,
    tiers: [
      [5, 158000],
      [10, 150000],
    ],
    processing: PROC_UDANG,
    badges: ["today_catch"],
    featured: true,
    sold: 186,
    images: ["photos/DeRScYiz7PX", "photos/Aeh7W9b03XE", "photos/JDEzAaPQY8Q"],
  },
  {
    slug: "udang-tiger-jumbo",
    name: "Udang Tiger Jumbo",
    category: "udang",
    type: "fresh",
    size: "size 8–10",
    short: "Udang tiger ukuran jumbo, 8–10 ekor per kg. Harga mengikuti lelang harian.",
    description:
      "Udang tiger jumbo untuk menu spesial: grill, butter garlic, atau mukbang ala Syauqi. Ketersediaan terbatas dan harga mengikuti hasil lelang TPI setiap pagi — silakan tanya harga via WhatsApp.",
    tips: TIPS_UDANG,
    price: 260000,
    showPrice: false,
    processing: PROC_UDANG,
    stock: "limited",
    badges: ["limited"],
    sold: 74,
    images: ["photos/DeOrd3tzG4f", "photos/ppAWFgQ3qtk"],
  },
  {
    slug: "lobster-bambu",
    name: "Lobster Bambu",
    category: "udang",
    type: "fresh",
    size: "300–500 gr/ekor",
    short: "Lobster bambu hidup, warna hijau-biru bermotif. Untuk acara spesial.",
    description:
      "Lobster bambu hidup langsung dari nelayan, berat 300–500 gram per ekor. Dikirim dalam kondisi hidup dengan kemasan khusus. Stok sangat terbatas — tanya ketersediaan via WhatsApp.",
    tips: "Kukus 12–15 menit atau belah dua lalu panggang dengan mentega bawang putih ±8 menit.",
    price: null,
    showPrice: false,
    processing: [
      { label: "Hidup", extra: 0 },
      { label: "Belah dua (siap panggang)", extra: 15000 },
    ],
    weights: [0.5, 1, 2],
    stock: "limited",
    badges: ["limited"],
    sold: 39,
    images: ["photos/SrzCO9_mkNw", "photos/8VdCjR0Z9cQ", "photos/YogTi2DnNPk", "photos/6NdNImMN1wk"],
  },
  // ----- Kepiting -----
  {
    slug: "kepiting-bakau",
    name: "Kepiting Bakau",
    category: "kepiting",
    type: "fresh",
    size: "3–4 ekor/kg",
    short: "Kepiting bakau hidup, diikat rapi. Daging penuh untuk saus padang.",
    description:
      "Kepiting bakau (mud crab) hidup ukuran 3–4 ekor per kg, dipilih yang berat & padat. Dikirim hidup dalam kondisi terikat agar aman. Jantan/betina bertelur bisa diminta di catatan.",
    tips: TIPS_KEPITING,
    price: 185000,
    tiers: [[5, 175000]],
    processing: PROC_KEPITING,
    badges: ["best_seller"],
    featured: true,
    sold: 254,
    images: ["photos/5ZjIUDYl51g", "photos/M5iMDHSVjlg"],
  },
  {
    slug: "rajungan",
    name: "Rajungan",
    category: "kepiting",
    type: "frozen",
    size: "6–8 ekor/kg",
    short: "Rajungan (blue swimming crab), manis & gurih. Cocok untuk sup dan kari.",
    description:
      "Rajungan segar yang langsung dibekukan setelah sortir untuk menjaga rasa manisnya. Ideal untuk kepiting saus, sup jagung kepiting, atau kari.",
    tips: TIPS_KEPITING,
    price: 120000,
    processing: PROC_KEPITING,
    sold: 98,
    images: ["photos/9Lu0Q5yu1_U"],
  },
  // ----- Cumi & Sotong -----
  {
    slug: "cumi-segar",
    name: "Cumi Segar",
    category: "cumi",
    type: "fresh",
    size: "10–15 ekor/kg",
    short: "Cumi segar bening, tinta masih utuh. Enak digoreng tepung atau ditumis hitam.",
    description:
      "Cumi segar ukuran sedang, badan bening dan mata jernih. Bisa dibersihkan atau dipotong ring sesuai permintaan sebelum dikirim.",
    tips: TIPS_CUMI,
    price: 85000,
    tiers: [
      [5, 80000],
      [10, 76000],
    ],
    processing: PROC_CUMI,
    badges: ["best_seller"],
    featured: true,
    sold: 301,
    images: ["photos/59ecG-H1FLI", "photos/_byqofMNO_I"],
  },
  {
    slug: "sotong",
    name: "Sotong",
    category: "cumi",
    type: "fresh",
    size: "5–8 ekor/kg",
    short: "Sotong berdaging tebal, cocok untuk bakar dan sambal matah.",
    description: "Sotong segar dengan daging tebal dan manis. Sangat cocok untuk dibakar dengan bumbu kecap atau dimasak saus tiram.",
    tips: TIPS_CUMI,
    price: 90000,
    processing: PROC_CUMI,
    badges: ["today_catch"],
    sold: 122,
    images: ["photos/g25oikHMzmQ", "photos/3uXiq0Cjn4c"],
  },
  {
    slug: "cumi-jumbo",
    name: "Cumi Jumbo",
    category: "cumi",
    type: "frozen",
    size: "2–4 ekor/kg",
    short: "Cumi ukuran jumbo beku, untuk resto & katering. Harga grosir via WA.",
    description: "Cumi jumbo beku dengan kemasan rapi, cocok untuk stok restoran dan katering. Harga khusus untuk pembelian partai.",
    tips: TIPS_CUMI,
    price: null,
    showPrice: false,
    processing: PROC_CUMI,
    minOrder: 1,
    sold: 57,
    images: ["photos/_jgK6jlxa2A"],
  },
  // ----- Kerang -----
  {
    slug: "kerang-hijau",
    name: "Kerang Hijau",
    category: "kerang",
    type: "fresh",
    short: "Kerang hijau segar, cangkang mengkilap. Rebus, saus padang, atau bakar.",
    description: "Kerang hijau segar dari perairan utara Jakarta, dicuci dan disortir. Promo spesial untuk pembelian di atas 10 kg.",
    tips: TIPS_KERANG,
    price: 35000,
    compare: 42000,
    tiers: [[10, 30000]],
    processing: PROC_KERANG,
    weights: [1, 2, 5, 10],
    minOrder: 1,
    badges: ["promo"],
    featured: true,
    sold: 233,
    images: ["photos/DeT5cP5zCoV", "photos/6QiCsHdzwpc"],
  },
  {
    slug: "kerang-dara",
    name: "Kerang Dara",
    category: "kerang",
    type: "fresh",
    short: "Kerang dara (blood cockle), favorit untuk kerang rebus sambal.",
    description: "Kerang dara segar, dicuci bersih. Paling nikmat direbus sebentar dan dicocol sambal kacang atau saus padang.",
    tips: TIPS_KERANG,
    price: 45000,
    processing: PROC_KERANG,
    weights: [1, 2, 5],
    minOrder: 1,
    sold: 88,
    images: ["photos/JDsxFu9pTIs"],
  },
  // ----- Ikan -----
  {
    slug: "kakap-merah",
    name: "Kakap Merah",
    category: "ikan",
    type: "fresh",
    size: "500–800 gr/ekor",
    short: "Kakap merah segar, mata jernih & insang merah. Juara untuk ikan bakar.",
    description:
      "Kakap merah segar hasil lelang TPI Muara Angke. Daging putih tebal, cocok dibakar utuh, dibuat sup kepala ikan, atau fillet untuk fish & chips. Bisa disiangi, dipotong steak, atau di-fillet gratis tulang.",
    tips: TIPS_IKAN,
    price: 120000,
    tiers: [
      [5, 115000],
      [10, 110000],
    ],
    processing: PROC_IKAN,
    badges: ["best_seller", "today_catch"],
    featured: true,
    sold: 367,
    images: ["photos/DebqliVoFCc", "photos/mVoSei9mnY4", "photos/-jL_5or58zY"],
  },
  {
    slug: "bawal-putih",
    name: "Bawal Putih",
    category: "ikan",
    type: "fresh",
    size: "4–6 ekor/kg",
    short: "Bawal putih (silver pomfret), daging lembut, minim duri halus.",
    description: "Bawal putih segar berkualitas ekspor. Teksturnya lembut dan rasanya manis, cocok untuk digoreng kering atau tim jahe.",
    tips: TIPS_IKAN,
    price: 140000,
    tiers: [[5, 135000]],
    processing: PROC_IKAN,
    badges: ["today_catch"],
    sold: 143,
    images: ["photos/kNR9mZYGbSk", "photos/C8PPrsOMqdE", "photos/DeHEQnDT3NW"],
  },
  {
    slug: "kerapu",
    name: "Kerapu",
    category: "ikan",
    type: "fresh",
    size: "600 gr–1 kg/ekor",
    short: "Kerapu segar untuk tim, sup, dan steamboat. Harga mengikuti lelang.",
    description: "Kerapu segar pilihan restoran Chinese food. Daging kenyal dan kulit bergelatin. Harga berubah harian sesuai lelang, silakan tanya via WhatsApp.",
    tips: TIPS_IKAN,
    price: null,
    showPrice: false,
    processing: PROC_IKAN,
    stock: "limited",
    sold: 61,
    images: ["photos/DeJovEQzbcN", "photos/lZfMviQQ7m0"],
  },
  {
    slug: "selar-kuning",
    name: "Selar Kuning",
    category: "ikan",
    type: "fresh",
    size: "10–12 ekor/kg",
    short: "Selar kuning segar, harga ramah. Mantap digoreng garing atau dibalado.",
    description: "Selar kuning (ikan ekor kuning) segar langsung dari kapal. Ikan harian favorit keluarga — digoreng garing, dibalado, atau dipepes.",
    tips: TIPS_IKAN,
    price: 42000,
    compare: 48000,
    tiers: [[10, 38000]],
    processing: PROC_IKAN_KECIL,
    badges: ["promo", "today_catch"],
    featured: true,
    sold: 289,
    images: ["photos/DeeG1W1TzcN", "photos/DePGJ4wTFg4", "photos/wtkyoW1jOpY", "photos/TBFsNc2ExCI"],
  },
  {
    slug: "kembung",
    name: "Ikan Kembung",
    category: "ikan",
    type: "fresh",
    size: "8–10 ekor/kg",
    short: "Kembung segar kaya omega-3. Goreng, bakar, atau asam pedas.",
    description: "Ikan kembung segar dengan mata bening dan perut padat. Sumber omega-3 yang terjangkau untuk menu harian keluarga.",
    tips: TIPS_IKAN,
    price: 45000,
    tiers: [[10, 41000]],
    processing: PROC_IKAN_KECIL,
    badges: ["best_seller"],
    sold: 276,
    images: ["photos/zHT1LEb8js0", "photos/xjxihtExV9Q", "photos/NwxYr0eHRSg"],
  },
  {
    slug: "tongkol",
    name: "Ikan Tongkol",
    category: "ikan",
    type: "frozen",
    size: "1–2 ekor/kg",
    short: "Tongkol beku untuk balado, suwir, dan isian. Stok selalu ada.",
    description: "Tongkol segar yang dibekukan cepat setelah sortir. Cocok untuk tongkol balado, suwir pedas, atau stok katering.",
    tips: TIPS_IKAN,
    price: 38000,
    processing: PROC_IKAN,
    sold: 158,
    images: ["photos/Q1pTm_ZDej4", "photos/IYSfOy-9Xhc"],
  },
  {
    slug: "tenggiri",
    name: "Ikan Tenggiri",
    category: "ikan",
    type: "fresh",
    size: "2–4 kg/ekor",
    short: "Tenggiri segar, bahan terbaik untuk pempek, otak-otak & steak.",
    description: "Tenggiri segar ukuran besar. Bisa dipotong steak atau di-fillet untuk bahan pempek dan siomay.",
    tips: TIPS_IKAN,
    price: 110000,
    tiers: [[5, 104000]],
    processing: PROC_IKAN,
    sold: 132,
    images: ["photos/CcIGktJyVIY", "photos/P9xC_4kcH3A", "photos/QCimQYC8tUA"],
  },
  {
    slug: "layur",
    name: "Ikan Layur",
    category: "ikan",
    type: "fresh",
    short: "Layur segar berkilau perak. Digoreng kering atau dimasak kuah kuning.",
    description: "Ikan layur segar dengan kulit perak mengkilap. Sedang habis — stok kembali setelah lelang berikutnya.",
    tips: TIPS_IKAN,
    price: 55000,
    processing: PROC_IKAN_KECIL,
    stock: "out",
    sold: 84,
    images: ["photos/ybXEt7lOn4U", "photos/1f2K7YWHhzI"],
  },
  {
    slug: "kuwe",
    name: "Ikan Kuwe",
    category: "ikan",
    type: "fresh",
    size: "500 gr–1 kg/ekor",
    short: "Kuwe (trevally) segar, daging tebal. Cocok bakar & asam manis.",
    description: "Ikan kuwe segar dengan daging tebal dan gurih. Pilihan bagus untuk ikan bakar rica atau asam manis.",
    tips: TIPS_IKAN,
    price: 75000,
    processing: PROC_IKAN,
    sold: 67,
    images: ["photos/A9c6zlsizaw", "photos/GretuBb-_Y8"],
  },
  {
    slug: "kurisi",
    name: "Ikan Kurisi",
    category: "ikan",
    type: "fresh",
    size: "6–8 ekor/kg",
    short: "Kurisi merah muda, daging manis. Goreng garing atau bumbu kuning.",
    description: "Ikan kurisi segar berwarna merah muda cantik, rasanya manis dan cocok untuk digoreng garing atau dimasak bumbu kuning.",
    tips: TIPS_IKAN,
    price: 48000,
    processing: PROC_IKAN_KECIL,
    sold: 92,
    images: ["photos/bb00dB6zhM0", "photos/PWIysy9Mg9Y"],
  },
];

export const bundles = [
  {
    slug: "paket-bakar-keluarga",
    name: "Paket Bakar Keluarga",
    description: "Kakap merah 1 kg + udang vaname 1 kg + cumi segar 1 kg. Cukup untuk 5–6 orang, siap bakar akhir pekan.",
    price: 279000,
    compare: 300000,
    image: "photos/Q2E56S1ydnU",
    items: [
      ["kakap-merah", 1],
      ["udang-vaname", 1],
      ["cumi-segar", 1],
    ] as [string, number][],
  },
  {
    slug: "paket-saus-padang",
    name: "Paket Saus Padang",
    description: "Kepiting bakau 1 kg + udang vaname 1 kg + kerang hijau 1 kg. Menu seafood saus padang ala resto di rumah.",
    price: 289000,
    compare: 315000,
    image: "photos/bfbmc7rfsV8",
    items: [
      ["kepiting-bakau", 1],
      ["udang-vaname", 1],
      ["kerang-hijau", 1],
    ] as [string, number][],
  },
  {
    slug: "paket-stok-kulkas",
    name: "Paket Stok Kulkas",
    description: "Selar kuning 2 kg + kembung 2 kg + cumi 1 kg + udang vaname 1 kg. Sudah dibersihkan & dikemas per porsi.",
    price: 319000,
    compare: 354000,
    image: "photos/DeJovEQzbcN",
    items: [
      ["selar-kuning", 2],
      ["kembung", 2],
      ["cumi-segar", 1],
      ["udang-vaname", 1],
    ] as [string, number][],
  },
];

export const banners = [
  {
    title: "Promo Kerang Hijau Rp 35rb/kg",
    subtitle: "Hemat 17% — beli 10 kg cuma Rp 30rb/kg. Berlaku sampai stok promo habis.",
    image: "photos/DeT5cP5zCoV",
    link: "/produk/kerang-hijau",
    cta: "Ambil Promo",
    endsInHours: 62,
    countdown: true,
  },
  {
    title: "Paket Bakar Keluarga — hemat Rp 21rb",
    subtitle: "Kakap + udang + cumi, siap bakar akhir pekan untuk 5–6 orang.",
    image: "photos/Q2E56S1ydnU",
    link: "/paket",
    cta: "Lihat Paket",
    endsInHours: null,
    countdown: false,
  },
  {
    title: "Supply Resto, Hotel & Katering",
    subtitle: "Harga khusus untuk order rutin. Bisa invoice & jadwal kirim tetap.",
    image: "photos/DeRScYiz7PX",
    link: "/resto-ekspor",
    cta: "Minta Penawaran",
    endsInHours: null,
    countdown: false,
  },
];

export const testimonials = [
  { name: "Ibu Rina", city: "Kelapa Gading", rating: 5, content: "Udang vanamenya seger banget, kepalanya masih nempel kuat. Dikirim pakai es batu jadi sampai rumah masih dingin. Langganan!" },
  { name: "Pak Hendra", city: "Pluit", rating: 5, content: "Kakap merahnya mantap buat bakar-bakar keluarga. Minta dibersihkan juga dikerjain rapi. Admin fast respon." },
  { name: "Chef Dimas — Resto Bahari", city: "Jakarta Selatan", rating: 5, content: "Sudah 8 bulan supply udang & cumi untuk resto kami. Kualitas konsisten dan selalu tepat waktu jam 7 pagi." },
  { name: "Mbak Sari", city: "Bekasi", rating: 5, content: "Awalnya ragu beli seafood online, ternyata beratnya pas sesuai timbangan di video. Kepiting masih hidup semua!" },
  { name: "Koh Aming", city: "Pantai Indah Kapuk", rating: 5, content: "Lobster bambunya hidup dan sehat, buat acara keluarga semua puas. Harganya juga lebih masuk akal dari supermarket." },
  { name: "Ibu Fitri — Katering Barokah", city: "Tangerang", rating: 4, content: "Order tongkol & kembung 30 kg tiap minggu buat katering. Harga grosirnya membantu banget, pengiriman kadang agak siang." },
  { name: "Andi Pratama", city: "Jakarta Barat", rating: 5, content: "Cumi segarnya bening, digoreng tepung empuk. Paket bakar keluarga worth it banget buat tahun baruan." },
  { name: "Bu Yanti", city: "Depok", rating: 5, content: "Kerang hijau promo 35rb, bersih dan gemuk-gemuk. Anak-anak suka banget dimasak saus padang." },
  { name: "Rizky", city: "Sunter", rating: 5, content: "Suka nonton mukbang Syauqi di YouTube, akhirnya order langsung. Udang tigernya beneran jumbo!" },
];

export const faqs = [
  { q: "Apakah seafood dijamin segar?", a: "Ya. Semua produk kami ambil dari lelang TPI Muara Angke setiap pagi, disortir, lalu dikemas dengan es curah di dalam styrofoam. Jika produk tidak segar saat diterima, kami ganti baru atau uang kembali." },
  { q: "Bagaimana cara memesan?", a: "Pilih produk, tentukan berat & olahan, lalu klik \"Pesan via WhatsApp\". Pesanan otomatis tersusun rapi di WhatsApp admin kami untuk dikonfirmasi beserta ongkirnya." },
  { q: "Kenapa ada produk yang tertulis \"Tanya Harga\"?", a: "Beberapa produk premium (lobster, kerapu, udang jumbo) harganya mengikuti hasil lelang harian. Anda tetap bisa memasukkannya ke keranjang, admin akan mengonfirmasi harga terbaru di WhatsApp." },
  { q: "Berapa minimal order?", a: "Minimal 0,5 kg per produk (beberapa produk minimal 1 kg). Tidak ada minimal total belanja untuk pengiriman Jakarta." },
  { q: "Apakah bisa dibersihkan atau di-fillet?", a: "Bisa. Pilih olahan saat memesan: dibersihkan, fillet, potong steak, kupas udang, potong ring cumi, dll. Beberapa olahan dikenakan biaya tambahan yang tertera." },
  { q: "Kapan pesanan dikirim?", a: "Pesanan yang masuk sebelum jam 12.00 WIB dikirim di hari yang sama untuk area Jakarta. Bodetabek H+0 atau H+1 tergantung jadwal kurir." },
  { q: "Pembayaran bisa lewat apa?", a: "Transfer bank, QRIS, atau COD (khusus area tertentu). Detail pembayaran dikirim admin setelah pesanan dikonfirmasi di WhatsApp." },
  { q: "Apakah melayani supply restoran & ekspor?", a: "Ya, kami melayani supply rutin untuk restoran, hotel, katering, hingga kebutuhan ekspor dengan harga khusus. Isi form di halaman Resto & Ekspor untuk minta penawaran." },
];

export const shippingAreas = [
  { name: "Jakarta Utara", fee: 15000, minFree: 200000, eta: "Hari yang sama (order < 12.00)" },
  { name: "Jakarta Pusat", fee: 20000, minFree: null, eta: "Hari yang sama (order < 12.00)" },
  { name: "Jakarta Barat", fee: 20000, minFree: null, eta: "Hari yang sama (order < 12.00)" },
  { name: "Jakarta Selatan", fee: 25000, minFree: null, eta: "Hari yang sama (order < 11.00)" },
  { name: "Jakarta Timur", fee: 25000, minFree: null, eta: "Hari yang sama (order < 11.00)" },
  { name: "Bodetabek", fee: 35000, minFree: 500000, eta: "H+0 / H+1" },
];

export const videos = [
  { platform: "youtube", id: "nms4eGDHHEA", title: "Mukbang Udang Tiger Jumbo + Sambal Lalapan", thumb: "wide/nms4eGDHHEA" },
  { platform: "youtube", id: "CJTu047XSiQ", title: "Cumi Pedas Nampol — Mukbang Seafood", thumb: "wide/CJTu047XSiQ" },
  { platform: "youtube", id: "-__DIg0ciGU", title: "Udang Besar Pedas di Tengah Sawah", thumb: "wide/-__DIg0ciGU" },
  { platform: "youtube", id: "d9RtlXf_J14", title: "Mukbang Seafood 2 Kg Pedas Poll", thumb: "wide/d9RtlXf_J14" },
  { platform: "youtube", id: "SrzCO9_mkNw", title: "Lobster Bambu Hidup di Lapak TPI", thumb: "photos/SrzCO9_mkNw" },
  { platform: "youtube", id: "5ZjIUDYl51g", title: "Kepiting Bakau Segar Siap Kirim", thumb: "photos/5ZjIUDYl51g" },
];
