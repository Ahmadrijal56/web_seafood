/**
 * Mengolah aset mentah di /assets menjadi gambar siap pakai:
 * - Thumbnail Shorts YouTube (frame vertikal di dalam 16:9) → crop tengah 4:5
 * - Thumbnail YouTube biasa (16:9) → 960×540
 * - Cover Reels Instagram (bar hitam atas/bawah) → crop area foto 4:5
 * - Logo → PNG transparan, versi putih, ikon/favicon
 *
 * Hasil: supabase/seed/images/** dan apps/{web,cms}/public/brand, apps/web/public/img
 */
import { copyFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const assets = path.join(root, "assets");
const out = path.join(here, "images");

/** Thumbnail YouTube berformat 16:9 penuh (bukan Shorts). */
const WIDE_YOUTUBE = new Set(["-__DIg0ciGU", "CJTu047XSiQ", "d9RtlXf_J14", "kkejsBnu_g4", "nms4eGDHHEA"]);

async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true });
}

async function processYoutube() {
  const dir = path.join(assets, "youtube");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".jpg"));
  for (const file of files) {
    const id = path.basename(file, ".jpg");
    const input = path.join(dir, file);
    const { width = 1280, height = 720 } = await sharp(input).metadata();
    if (WIDE_YOUTUBE.has(id)) {
      await sharp(input).resize(960, 540, { fit: "cover" }).webp({ quality: 80 }).toFile(path.join(out, "wide", `${id}.webp`));
      continue;
    }
    // Frame vertikal 9:16 berada di tengah thumbnail.
    const frameW = Math.round((height * 9) / 16);
    const left = Math.round((width - frameW) / 2);
    const cropH = Math.round((frameW * 5) / 4);
    const top = Math.round((height - cropH) / 2);
    await sharp(input)
      .extract({ left, top, width: frameW, height: cropH })
      .resize(640, 800, { fit: "cover", kernel: "lanczos3" })
      .sharpen({ sigma: 0.6 })
      .webp({ quality: 82 })
      .toFile(path.join(out, "photos", `${id}.webp`));
  }
  return files.length;
}

/** Cari baris pertama & terakhir yang bukan bar hitam. */
async function findContentRows(input: string) {
  const { data, info } = await sharp(input).greyscale().raw().toBuffer({ resolveWithObject: true });
  const rowMean = (y: number) => {
    let sum = 0;
    for (let x = 0; x < info.width; x++) sum += data[y * info.width + x]!;
    return sum / info.width;
  };
  let top = 0;
  while (top < info.height && rowMean(top) < 12) top++;
  let bottom = info.height - 1;
  while (bottom > top && rowMean(bottom) < 12) bottom--;
  return { top, bottom, width: info.width, height: info.height };
}

async function processInstagram() {
  const dir = path.join(assets, "instagram");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".jpg"));
  for (const file of files) {
    const id = path.basename(file, ".jpg");
    const input = path.join(dir, file);
    const { top, bottom, width } = await findContentRows(input);
    const contentH = bottom - top + 1;
    const cropH = Math.min(contentH, Math.round((width * 5) / 4));
    await sharp(input)
      // Ambil dari atas area foto agar watermark logo tetap terlihat.
      .extract({ left: 0, top, width, height: cropH })
      .resize(640, 800, { fit: "cover" })
      .webp({ quality: 82 })
      .toFile(path.join(out, "photos", `${id}.webp`));
  }
  return files.length;
}

/** "Color to alpha" untuk latar putih. */
async function whiteToAlpha(input: string) {
  const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const outBuf = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
    const r = data[i]!, g = data[i + 1]!, b = data[i + 2]!;
    const a = Math.max(255 - r, 255 - g, 255 - b) / 255;
    let alpha = a < 0.04 ? 0 : a;
    if (alpha > 0) {
      alpha = Math.min(1, alpha * 1.08);
      outBuf[j] = Math.round(255 - (255 - r) / alpha);
      outBuf[j + 1] = Math.round(255 - (255 - g) / alpha);
      outBuf[j + 2] = Math.round(255 - (255 - b) / alpha);
    }
    outBuf[j + 3] = Math.round(alpha * 255);
  }
  return sharp(outBuf, { raw: { width: info.width, height: info.height, channels: 4 } });
}

async function processBrand() {
  const logoSrc = path.join(assets, "brand", "logo-youtube.jpg");
  const brand = path.join(out, "brand");

  const transparent = await (await whiteToAlpha(logoSrc)).png().toBuffer();
  const trimmed = await sharp(transparent).trim({ threshold: 1 }).png().toBuffer();
  await sharp(trimmed).png({ compressionLevel: 9 }).toFile(path.join(brand, "logo.png"));
  await sharp(trimmed).resize({ width: 320 }).webp({ quality: 90 }).toFile(path.join(brand, "logo.webp"));

  // Versi putih untuk latar gelap: semua piksel putih, alpha dipertahankan.
  const { data, info } = await sharp(trimmed).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
  }
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(brand, "logo-white.png"));

  // Ikon: bagian ikan + udang (atas logo) di atas lingkaran putih.
  const markArea = await sharp(transparent).extract({ left: 195, top: 180, width: 350, height: 228 }).png().toBuffer();
  const mark = await sharp(markArea).trim({ threshold: 1 }).png().toBuffer();
  const markResized = await sharp(mark).resize(360, 360, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  const circle = Buffer.from(
    `<svg width="512" height="512"><circle cx="256" cy="256" r="256" fill="#ffffff"/></svg>`,
  );
  const icon = await sharp(circle).composite([{ input: markResized, gravity: "center" }]).png().toBuffer();
  await sharp(icon).toFile(path.join(brand, "icon.png"));
  await sharp(icon).resize(180, 180).flatten({ background: "#ffffff" }).png().toFile(path.join(brand, "apple-icon.png"));
  await sharp(icon).resize(48, 48).png().toFile(path.join(brand, "favicon-48.png"));
}

/** Foto statis yang dipakai langsung oleh web (hero, proses, tentang). */
const WEB_STATIC: Record<string, string> = {
  "hero-udang": "photos/DeOrd3tzG4f.webp",
  "hero-kakap": "photos/DebqliVoFCc.webp",
  "hero-kerang": "photos/DeT5cP5zCoV.webp",
  "hero-vaname": "photos/Deb-1d5zsVw.webp",
  "hero-kepiting": "photos/9Lu0Q5yu1_U.webp",
  "hero-lobster": "photos/SrzCO9_mkNw.webp",
  "proses-tpi": "photos/DeHEQnDT3NW.webp",
  "proses-sortir": "photos/DeEgYj5zhAt.webp",
  "proses-packing": "photos/DeJovEQzbcN.webp",
  "proses-kirim": "photos/cBCU_tEvltc.webp",
  "lapak-hidup": "photos/DeMIlAKTIdL.webp",
  "lapak-selar": "photos/DeeG1W1TzcN.webp",
  "lapak-cumi": "photos/g25oikHMzmQ.webp",
  "lapak-bawal": "photos/kNR9mZYGbSk.webp",
  "b2b-udang": "photos/DeRScYiz7PX.webp",
  "b2b-ikan": "photos/I32itFo5OHk.webp",
  "mukbang-udang": "wide/nms4eGDHHEA.webp",
  "mukbang-cumi": "wide/CJTu047XSiQ.webp",
};

async function copyToApps() {
  const brand = path.join(out, "brand");
  for (const app of ["web", "cms"]) {
    const pub = path.join(root, "apps", app, "public", "brand");
    await ensureDir(pub);
    for (const f of ["logo.png", "logo.webp", "logo-white.png", "icon.png"]) {
      await copyFile(path.join(brand, f), path.join(pub, f));
    }
    const appDir = path.join(root, "apps", app, "app");
    await ensureDir(appDir);
    await copyFile(path.join(brand, "icon.png"), path.join(appDir, "icon.png"));
    await copyFile(path.join(brand, "apple-icon.png"), path.join(appDir, "apple-icon.png"));
  }
  const img = path.join(root, "apps", "web", "public", "img");
  await ensureDir(img);
  for (const [name, rel] of Object.entries(WEB_STATIC)) {
    await copyFile(path.join(out, rel), path.join(img, `${name}.webp`));
  }
}

/** Gambar preview link (Open Graph) 1200×630. */
async function buildOgImage() {
  const W = 1200;
  const H = 630;
  const photo = (rel: string, w: number, h: number) =>
    sharp(path.join(out, rel)).resize(w, h, { fit: "cover" }).composite([
      { input: Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="28" ry="28"/></svg>`), blend: "dest-in" },
    ]).png().toBuffer();
  const bg = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#0A2A4A"/><stop offset="0.6" stop-color="#0B4A75"/><stop offset="1" stop-color="#0B72B5"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#g)"/>
      <circle cx="1100" cy="40" r="220" fill="#45C4E5" opacity="0.18"/>
      <path d="M0 560c160 30 320 40 480 30s320-50 480-50 240 30 240 30v110H0z" fill="#45C4E5" opacity="0.15"/>
      <text x="64" y="300" font-family="Helvetica Neue, Arial" font-size="54" font-weight="800" fill="#ffffff">Seafood Segar</text>
      <text x="64" y="364" font-family="Helvetica Neue, Arial" font-size="54" font-weight="800" fill="#45C4E5">Langsung dari TPI</text>
      <text x="64" y="428" font-family="Helvetica Neue, Arial" font-size="54" font-weight="800" fill="#ffffff">Muara Angke</text>
      <text x="64" y="484" font-family="Helvetica Neue, Arial" font-size="24" fill="#D6EEFA">Eceran &amp; grosir · Supply resto &amp; ekspor</text>
      <rect x="64" y="518" width="330" height="54" rx="27" fill="#25D366"/>
      <text x="229" y="553" text-anchor="middle" font-family="Helvetica Neue, Arial" font-size="22" font-weight="700" fill="#ffffff">Pesan via WhatsApp</text>
    </svg>`);
  const logo = await sharp(path.join(out, "brand", "logo-white.png")).resize({ height: 150 }).png().toBuffer();
  await sharp(bg)
    .composite([
      { input: logo, left: 64, top: 52 },
      { input: await photo("photos/DeOrd3tzG4f.webp", 300, 420), left: 600, top: 105 },
      { input: await photo("photos/DebqliVoFCc.webp", 250, 200), left: 916, top: 105 },
      { input: await photo("photos/5ZjIUDYl51g.webp", 250, 204), left: 916, top: 321 },
    ])
    .jpeg({ quality: 86 })
    .toFile(path.join(root, "apps", "web", "app", "opengraph-image.jpg"));
}

async function main() {
  await Promise.all(["photos", "wide", "brand"].map((d) => ensureDir(path.join(out, d))));
  const yt = await processYoutube();
  const ig = await processInstagram();
  await processBrand();
  await copyToApps();
  await buildOgImage();
  console.log(`✔ ${yt} foto YouTube, ${ig} foto Instagram, logo & ikon selesai diolah`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
