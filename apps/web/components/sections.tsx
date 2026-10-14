import { describeDays, waLink, type StoreSettings } from "@sfs/shared";
import { Anchor, BadgeCheck, Clock, MapPin, Navigation, Scale, ShieldCheck, Snowflake, Truck } from "lucide-react";
import Image from "next/image";
import { Bubbles, Wave } from "./decor";
import { WhatsAppIcon } from "./icons";
import { OpenStatus } from "./open-status";
import { SectionHeading, buttonClass } from "./ui";

export function WhyUs({ settings }: { settings: StoreSettings }) {
  const items = [
    {
      icon: Anchor,
      title: "Langsung dari TPI",
      text: "Kami belanja di lelang TPI Muara Angke setiap subuh — harga tangan pertama, tanpa perantara.",
    },
    { icon: ShieldCheck, title: "Garansi Segar", text: settings.guarantee.fresh },
    { icon: Scale, title: "Berat Pas", text: settings.guarantee.weight },
    { icon: Truck, title: "Kirim Cepat & Dingin", text: "Dikemas styrofoam + es curah, sampai hari yang sama se-Jakarta." },
  ];
  const stats = [
    { value: String(settings.trust.since), label: "Melayani sejak" },
    { value: settings.trust.customers, label: "Pelanggan puas" },
    { value: settings.trust.partners, label: "Resto & katering mitra" },
    { value: `${settings.trust.rating}/5`, label: "Rating pelanggan" },
  ];
  return (
    <section className="relative overflow-hidden bg-ice py-16 sm:py-24">
      <div className="container-page">
        <SectionHeading
          align="center"
          eyebrow="Kenapa Syauqi?"
          title="Segar, berat pas, dan aman dibeli online"
          description="Kami paham kekhawatiran beli seafood online: takut tidak segar, berat kurang, atau penipuan. Ini jaminan kami."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, text }) => (
            <div key={title} className="reveal rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg">
              <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan to-brand-600 text-white shadow-lg shadow-brand-600/20">
                <Icon className="size-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-navy">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
        <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-brand-100 shadow-sm lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white p-6 text-center">
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">{s.label}</dt>
              <dd className="mt-1 text-3xl font-extrabold text-brand-600 sm:text-4xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

const STEPS = [
  { img: "/img/proses-tpi.webp", title: "Lelang TPI subuh", text: "Tim kami memilih langsung hasil tangkapan terbaik di TPI Muara Angke sejak jam 4 pagi." },
  { img: "/img/proses-sortir.webp", title: "Sortir & timbang", text: "Disortir per ukuran, dicek kesegaran (mata, insang, aroma), lalu ditimbang & divideokan." },
  { img: "/img/proses-packing.webp", title: "Packing es + styrofoam", text: "Dikemas dengan es curah di box styrofoam agar suhu tetap dingin sepanjang jalan." },
  { img: "/img/proses-kirim.webp", title: "Kirim ke dapur Anda", text: "Kurir berangkat hari yang sama. Anda tinggal masak — nggak perlu ke pasar subuh-subuh." },
];

export function ProcessSteps() {
  return (
    <section className="relative overflow-hidden bg-navy py-16 text-white sm:py-24">
      <Bubbles />
      <div className="container-page relative">
        <SectionHeading
          dark
          align="center"
          eyebrow="Proses kami"
          title="Dari TPI ke dapur Anda dalam hitungan jam"
          description="Setiap pesanan melewati 4 langkah ini, bukan disimpan berhari-hari di gudang."
        />
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="reveal group overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image src={step.img} alt={step.title} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute left-4 top-4 grid size-10 place-items-center rounded-full bg-coral text-lg font-extrabold shadow-lg">
                  {i + 1}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-100/80">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function GuaranteeBox({ settings }: { settings: StoreSettings }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {[
        { icon: ShieldCheck, title: "Garansi Segar", text: "Tidak segar? Ganti baru / uang kembali" },
        { icon: Scale, title: "Berat Pas", text: "Ditimbang & divideokan sebelum kirim" },
        { icon: Snowflake, title: "Dikemas Dingin", text: "Styrofoam + es curah" },
      ].map(({ icon: Icon, title, text }) => (
        <div key={title} className="flex items-start gap-3 rounded-2xl bg-ice p-4">
          <Icon className="mt-0.5 size-5 shrink-0 text-brand-600" />
          <div>
            <p className="text-sm font-bold text-navy">{title}</p>
            <p className="text-xs text-slate-600">{text}</p>
          </div>
        </div>
      ))}
      <p className="sr-only">{settings.guarantee.fresh}</p>
    </div>
  );
}

export function LocationSection({ settings }: { settings: StoreSettings }) {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-page grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <div>
          <SectionHeading
            eyebrow="Lokasi lapak"
            title="Lapak fisik di TPI Muara Angke — silakan mampir"
            description="Bukan toko online fiktif. Anda bisa datang langsung, pilih sendiri, atau ambil pesanan di lapak kami."
          />
          <ul className="space-y-4">
            <li className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600"><MapPin className="size-5" /></span>
              <div>
                <p className="font-bold text-navy">Alamat</p>
                <p className="text-sm text-slate-600">{settings.address}</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600"><Clock className="size-5" /></span>
              <div>
                <p className="font-bold text-navy">Jam operasional</p>
                <p className="text-sm text-slate-600">
                  {describeDays(settings.hours.days)}, {settings.hours.open}–{settings.hours.close} WIB
                </p>
                <OpenStatus hours={settings.hours} className="mt-2" />
              </div>
            </li>
            <li className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600"><BadgeCheck className="size-5" /></span>
              <div>
                <p className="font-bold text-navy">Legalitas</p>
                <p className="text-sm text-slate-600">{settings.legal.nib}</p>
              </div>
            </li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={settings.maps_url} target="_blank" rel="noopener" className={buttonClass("brand")}>
              <Navigation className="size-4" /> Petunjuk Arah
            </a>
            <a href={waLink(settings.whatsapp)} target="_blank" rel="noopener" className={buttonClass("outline")}>
              <WhatsAppIcon size={16} className="text-wa" /> Tanya Lokasi
            </a>
          </div>
        </div>
        <div className="overflow-hidden rounded-3xl bg-brand-50 shadow-xl ring-1 ring-slate-100">
          <iframe
            src={settings.maps_embed_url}
            title="Peta lokasi TPI Muara Angke"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="aspect-[4/3] w-full border-0"
          />
        </div>
      </div>
    </section>
  );
}

export function ClosingCta({ settings }: { settings: StoreSettings }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-navy text-white">
      <Wave className="h-10 sm:h-14" fill="#ffffff" flip />
      <Bubbles />
      <div className="container-page relative flex flex-col items-center py-14 text-center sm:py-20">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan">Tangkapan hari ini menunggu</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">Pesan sekarang, dikirim hari ini.</h2>
        <p className="mt-4 max-w-xl text-brand-100/90">
          Order sebelum jam 12.00 WIB, seafood segar sampai di dapur Anda hari ini juga.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="/produk" className={buttonClass("coral", "lg")}>Belanja Sekarang</a>
          <a href={waLink(settings.whatsapp, "Halo Syauqi Fresh Seafood, saya mau pesan seafood hari ini 🙏")} target="_blank" rel="noopener" className={buttonClass("wa", "lg")}>
            <WhatsAppIcon size={20} /> Chat WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
