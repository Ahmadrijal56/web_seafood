import "server-only";
import { cache } from "react";
import {
  mergeSettings,
  type Banner,
  type BundleWithItems,
  type Category,
  type Faq,
  type ProductWithRelations,
  type ShippingArea,
  type Testimonial,
  type Video,
} from "@sfs/shared";
import { supabaseCached as db } from "./supabase";

const PRODUCT_SELECT =
  "*, category:categories(id, name, slug), product_images(*), price_tiers(*), product_options(*)";

function sortRelations(product: ProductWithRelations): ProductWithRelations {
  product.product_images?.sort((a, b) => a.sort_order - b.sort_order);
  product.price_tiers?.sort((a, b) => a.min_kg - b.min_kg);
  product.product_options?.sort((a, b) => a.sort_order - b.sort_order);
  return product;
}

export const getSettings = cache(async () => {
  const { data } = await db.from("settings").select("key, value");
  return mergeSettings(data);
});

export const getCategories = cache(async (): Promise<Category[]> => {
  const { data, error } = await db.from("categories").select("*").eq("is_active", true).order("sort_order");
  if (error) throw error;
  return data ?? [];
});

export const getProducts = cache(async (): Promise<ProductWithRelations[]> => {
  const { data, error } = await db.from("products").select(PRODUCT_SELECT).eq("is_active", true).order("sort_order");
  if (error) throw error;
  return (data ?? []).map(sortRelations);
});

export const getProduct = cache(async (slug: string): Promise<ProductWithRelations | null> => {
  const { data, error } = await db.from("products").select(PRODUCT_SELECT).eq("slug", slug).eq("is_active", true).maybeSingle();
  if (error) throw error;
  return data ? sortRelations(data) : null;
});

export const getBundles = cache(async (): Promise<BundleWithItems[]> => {
  const { data, error } = await db
    .from("bundles")
    .select("*, bundle_items(*, product:products(id, name, slug, size_label))")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
});

export const getBanners = cache(async (): Promise<Banner[]> => {
  const { data, error } = await db.from("banners").select("*").eq("is_active", true).order("sort_order");
  if (error) throw error;
  return data ?? [];
});

export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  const { data, error } = await db.from("testimonials").select("*").eq("is_active", true).order("sort_order");
  if (error) throw error;
  return data ?? [];
});

export const getVideos = cache(async (): Promise<Video[]> => {
  const { data, error } = await db.from("videos").select("*").eq("is_active", true).order("sort_order");
  if (error) throw error;
  return data ?? [];
});

export const getFaqs = cache(async (): Promise<Faq[]> => {
  const { data, error } = await db.from("faqs").select("*").eq("is_active", true).order("sort_order");
  if (error) throw error;
  return data ?? [];
});

export const getShippingAreas = cache(async (): Promise<ShippingArea[]> => {
  const { data, error } = await db.from("shipping_areas").select("*").eq("is_active", true).order("sort_order");
  if (error) throw error;
  return data ?? [];
});

/** Banner yang sedang berlaku (jadwal mulai/selesai). */
export function activeBanners(banners: Banner[], now = Date.now()) {
  return banners.filter(
    (b) => (!b.starts_at || new Date(b.starts_at).getTime() <= now) && (!b.ends_at || new Date(b.ends_at).getTime() > now),
  );
}
