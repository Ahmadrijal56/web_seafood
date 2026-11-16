-- Artikel / berita / resep / tips untuk SEO & edukasi pelanggan

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  body text not null,
  cover_image_url text,
  category text not null default 'berita'
    check (category in ('berita', 'resep', 'tips')),
  author_name text,
  published_at timestamptz not null default now(),
  seo_title text,
  seo_description text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index articles_published_at_idx on public.articles (published_at desc);
create index articles_active_featured_idx on public.articles (is_active, is_featured);

create trigger articles_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

alter table public.articles enable row level security;

create policy "public read" on public.articles
  for select using (is_active or public.is_admin());

create policy "admin write" on public.articles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
