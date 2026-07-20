/**
 * Tayamo Sport — Seed real ON products from user images
 * 13 Optimum Nutrition products across 9 categories
 *
 * Usage: npx tsx prisma/seed-on-products.ts
 */

import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import https from "https";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Load .env.local
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i > 0) { const k = t.substring(0, i).trim(); const v = t.substring(i + 1).trim(); if (!process.env[k]) process.env[k] = v; }
  }
}
const envBase = path.join(process.cwd(), ".env");
if (fs.existsSync(envBase)) {
  for (const line of fs.readFileSync(envBase, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i > 0) { const k = t.substring(0, i).trim(); const v = t.substring(i + 1).trim(); if (!process.env[k]) process.env[k] = v; }
  }
}

const PEXELS_KEY = process.env.PEXELS_API_KEY || "";

// ============================================================
// CATEGORIES (9)
// ============================================================

const CATEGORIES = [
  { name: "Whey Protein", slug: "whey-protein", icon: "\u{1F95B}", description: "Premium whey protein blends", sortOrder: 1 },
  { name: "Plant Protein", slug: "plant-protein", icon: "\u{1F331}", description: "Vegan and plant-based proteins", sortOrder: 2 },
  { name: "Isolate Protein", slug: "isolate-protein", icon: "\u{1F48E}", description: "Ultra-pure whey isolate", sortOrder: 3 },
  { name: "Mass Gainer", slug: "mass-gainer", icon: "\u{1F4AA}", description: "High-calorie mass gainers", sortOrder: 4 },
  { name: "Creatine", slug: "creatine", icon: "\u{26A1}", description: "Creatine for strength and power", sortOrder: 5 },
  { name: "Pre Workout", slug: "pre-workout", icon: "\u{1F525}", description: "Energy and focus pre-workouts", sortOrder: 6 },
  { name: "Vitamins & Minerals", slug: "vitamins", icon: "\u{1F48A}", description: "Daily multivitamins and minerals", sortOrder: 7 },
  { name: "Amino Acids", slug: "amino-acids", icon: "\u{26A1}", description: "BCAAs and amino acid supplements", sortOrder: 8 },
  { name: "Accessories", slug: "accessories", icon: "\u{1F4B0}", description: "Shakers, bags and gym accessories", sortOrder: 9 },
];

// ============================================================
// PRODUCTS (13 from user images)
// ============================================================

type ProductDef = {
  name: string;
  slug: string;
  description: string;
  shortDesc: string;
  productType: string;
  price: number;
  compareAtPrice?: number;
  categorySlug: string;
  brand: string;
  sku: string;
  weight?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  tags: string[];
  colors?: string[];
  specs?: Record<string, string>;
  pexelsQuery: string;
};

const PRODUCTS: ProductDef[] = [
  {
    name: "Gold Standard Pro Gainer",
    slug: "on-gold-standard-pro-gainer",
    description: "Premium high-protein mass gainer with 650 calories and 60g of multi-source protein per serving. Vanilla Custard flavour. Supports muscle recovery and weight gain with a balanced macro profile.",
    shortDesc: "650 cal | 60g protein | Vanilla Custard | 5.09 LB",
    productType: "Mass Gainer", price: 289, compareAtPrice: 339,
    categorySlug: "mass-gainer", brand: "Optimum Nutrition", sku: "ON-PRO-GAIN-VC",
    weight: 2.31, stock: 20, rating: 4.6, reviewCount: 432,
    isFeatured: true, isBestSeller: false, isNew: true,
    tags: ["mass-gainer", "protein", "vanilla-custard"],
    specs: { Calories: "650", Protein: "60g", Weight: "5.09 LB", Servings: "16", Flavour: "Vanilla Custard" },
    pexelsQuery: "mass gainer protein tub supplement",
  },
  {
    name: "Gold Standard 100% Plant Protein (Single Serving)",
    slug: "on-plant-protein-single",
    description: "Vegan plant-based protein with 24g of protein per serving. 0g sugar, 150 calories. Creamy Vanilla flavour. Single serving sachet (37g).",
    shortDesc: "24g plant protein | 0g sugar | Vegan | 37g",
    productType: "Plant Protein", price: 15,
    categorySlug: "plant-protein", brand: "Optimum Nutrition", sku: "ON-PLANT-SINGLE",
    weight: 0.037, stock: 100, rating: 4.4, reviewCount: 89,
    isFeatured: false, isBestSeller: false, isNew: true,
    tags: ["plant", "vegan", "protein", "single-serving"],
    specs: { Protein: "24g", Sugar: "0g", Calories: "150", Weight: "1.3 OZ", Servings: "1", Flavour: "Creamy Vanilla" },
    pexelsQuery: "plant protein powder vegan supplement",
  },
  {
    name: "Creatine+ Enhanced 3-in-1 Formula",
    slug: "on-creatine-plus",
    description: "Enhanced creatine formula combining creatine monohydrate, HCl, and buffered creatine. Orange Tangerine flavour. 360g tub with 40 servings.",
    shortDesc: "3-in-1 creatine | Orange Tangerine | 40 servings",
    productType: "Creatine", price: 129, compareAtPrice: 149,
    categorySlug: "creatine", brand: "Optimum Nutrition", sku: "ON-CREATINE-PLUS",
    weight: 0.36, stock: 30, rating: 4.5, reviewCount: 267,
    isFeatured: false, isBestSeller: false, isNew: true,
    tags: ["creatine", "3-in-1", "orange-tangerine"],
    specs: { Type: "3-in-1 Creatine", Weight: "12.69 OZ (360g)", Servings: "40", Flavour: "Orange Tangerine" },
    pexelsQuery: "creatine powder supplement container",
  },
  {
    name: "Opti-Women Multivitamin",
    slug: "on-opti-women",
    description: "Comprehensive multivitamin designed specifically for active women. 60 capsules with essential vitamins, minerals, and botanical extracts.",
    shortDesc: "Multivitamin for active women | 60 capsules",
    productType: "Vitamin", price: 119,
    categorySlug: "vitamins", brand: "Optimum Nutrition", sku: "ON-OPTI-WOMEN",
    weight: 0.15, stock: 40, rating: 4.6, reviewCount: 1876,
    isFeatured: false, isBestSeller: true, isNew: false,
    tags: ["multivitamin", "women", "vitamins"],
    specs: { Type: "Multivitamin", For: "Active Women", Capsules: "60", Servings: "30" },
    pexelsQuery: "women multivitamin supplement bottle",
  },
  {
    name: "Opti-Men Multivitamin",
    slug: "on-opti-men",
    description: "Comprehensive multivitamin designed for active men. 150 tablets with 75+ ingredients including vitamins, minerals, and amino blends. 50 servings.",
    shortDesc: "Multivitamin for active men | 150 tablets | 50 servings",
    productType: "Vitamin", price: 139,
    categorySlug: "vitamins", brand: "Optimum Nutrition", sku: "ON-OPTI-MEN",
    weight: 0.25, stock: 45, rating: 4.6, reviewCount: 2341,
    isFeatured: false, isBestSeller: true, isNew: false,
    tags: ["multivitamin", "men", "vitamins"],
    specs: { Type: "Multivitamin", For: "Active Men", Tablets: "150", Servings: "50" },
    pexelsQuery: "men multivitamin supplement bottle",
  },
  {
    name: "Micronized Creatine Capsules",
    slug: "on-micronized-creatine-capsules",
    description: "Pure micronized creatine monohydrate in convenient capsule form. 300 capsules providing 2.5g of creatine per serving of 2 capsules. 150 servings.",
    shortDesc: "Creatine capsules | 300 caps | 2.5g per serving",
    productType: "Creatine", price: 109,
    categorySlug: "creatine", brand: "Optimum Nutrition", sku: "ON-CR-CAPS-300",
    weight: 0.45, stock: 35, rating: 4.5, reviewCount: 987,
    isFeatured: false, isBestSeller: false, isNew: false,
    tags: ["creatine", "capsules", "micronized"],
    specs: { Type: "Creatine Monohydrate", Form: "Capsules", Count: "300", PerServing: "2.5g", Servings: "150" },
    pexelsQuery: "creatine capsules supplement bottle",
  },
  {
    name: "Gold Standard Pre-Workout",
    slug: "on-gold-standard-pre-workout",
    description: "Premium pre-workout with 175mg caffeine, 3.3g creatine monohydrate, and 1.6g beta-alanine. Blueberry Lemonade flavour. 300g tub with 30 servings.",
    shortDesc: "175mg caffeine | 3.3g creatine | 30 servings",
    productType: "Pre Workout", price: 149, compareAtPrice: 179,
    categorySlug: "pre-workout", brand: "Optimum Nutrition", sku: "ON-GS-PRE-300",
    weight: 0.3, stock: 40, rating: 4.7, reviewCount: 1567,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["pre-workout", "caffeine", "creatine", "beta-alanine"],
    specs: { Caffeine: "175mg", Creatine: "3.3g", BetaAlanine: "1.6g", Weight: "10.58 OZ", Servings: "30", Flavour: "Blueberry Lemonade" },
    pexelsQuery: "pre workout supplement container tub",
  },
  {
    name: "Gold Standard 100% Plant Protein (2 LB)",
    slug: "on-plant-protein-2lb",
    description: "Premium vegan plant-based protein powder. 24g of protein per serving from pea, rice, and soy. 0g sugar, 150 calories. Creamy Vanilla flavour. 29 servings.",
    shortDesc: "24g plant protein | Vegan | Creamy Vanilla | 2 LB",
    productType: "Plant Protein", price: 219,
    categorySlug: "plant-protein", brand: "Optimum Nutrition", sku: "ON-PLANT-2LB",
    weight: 0.916, stock: 25, rating: 4.5, reviewCount: 654,
    isFeatured: false, isBestSeller: false, isNew: false,
    tags: ["plant", "vegan", "protein", "vanilla"],
    specs: { Protein: "24g", Sugar: "0g", Calories: "150", Weight: "2.02 LB", Servings: "29", Flavour: "Creamy Vanilla" },
    pexelsQuery: "vegan plant protein powder tub",
  },
  {
    name: "Gold Standard 100% Isolate",
    slug: "on-gold-standard-isolate",
    description: "Ultra-filtered whey protein isolate with 25g of protein and 5.5g BCAAs per serving. Rich Vanilla flavour. 2.91 LB tub with 44 servings.",
    shortDesc: "25g protein | 5.5g BCAAs | Rich Vanilla | 2.91 LB",
    productType: "Isolate Protein", price: 349, compareAtPrice: 399,
    categorySlug: "isolate-protein", brand: "Optimum Nutrition", sku: "ON-GS-ISO-2.91",
    weight: 1.32, stock: 30, rating: 4.8, reviewCount: 2341,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["isolate", "whey", "protein", "vanilla"],
    specs: { Protein: "25g", BCAAs: "5.5g", Weight: "2.91 LB", Servings: "44", Flavour: "Rich Vanilla" },
    pexelsQuery: "protein isolate powder tub supplement",
  },
  {
    name: "Serious Mass",
    slug: "on-serious-mass",
    description: "High-calorie weight gainer with 1,250 calories and 50g of protein per serving. Chocolate Peanut Butter flavour. 12 LB bag with 16 servings.",
    shortDesc: "1,250 cal | 50g protein | Chocolate PB | 12 LB",
    productType: "Mass Gainer", price: 269, compareAtPrice: 319,
    categorySlug: "mass-gainer", brand: "Optimum Nutrition", sku: "ON-SM-12LB",
    weight: 5.44, stock: 20, rating: 4.5, reviewCount: 1876,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["mass-gainer", "protein", "chocolate-peanut-butter"],
    specs: { Calories: "1,250", Protein: "50g", Carbs: "250g", Weight: "12 LB", Servings: "16", Flavour: "Chocolate Peanut Butter" },
    pexelsQuery: "mass gainer protein supplement bag",
  },
  {
    name: "Pro Quench",
    slug: "on-pro-quench",
    description: "Clear protein, collagen and electrolyte powder drink mix. Tropical Orange Mango flavour. 416g tub with 24 servings. Advanced 3-in-1 support for muscle, joint and hydration.",
    shortDesc: "20g clear protein | Collagen + Electrolytes | 24 servings",
    productType: "Whey Protein", price: 159,
    categorySlug: "whey-protein", brand: "Optimum Nutrition", sku: "ON-PRO-QUENCH",
    weight: 0.416, stock: 25, rating: 4.4, reviewCount: 189,
    isFeatured: false, isBestSeller: false, isNew: true,
    tags: ["clear-protein", "collagen", "electrolytes", "hydration"],
    specs: { Protein: "20g", Type: "Clear Protein + Collagen", Weight: "14.67 OZ", Servings: "24", Flavour: "Tropical Orange Mango" },
    pexelsQuery: "protein powder drink mix supplement",
  },
  {
    name: "Essential Amin.O Energy",
    slug: "on-essentials-amin-o-energy",
    description: "Anytime energy and recovery blend with amino acids and natural caffeine. Blue Raspberry flavour. 270g tub with 30 servings. 0g sugar.",
    shortDesc: "Amino acids | Natural caffeine | Blue Raspberry | 30 srv",
    productType: "Amino Acid", price: 139,
    categorySlug: "amino-acids", brand: "Optimum Nutrition", sku: "ON-AMIN-O-BLUE",
    weight: 0.27, stock: 30, rating: 4.5, reviewCount: 876,
    isFeatured: false, isBestSeller: false, isNew: false,
    tags: ["amino-acids", "energy", "caffeine", "blue-raspberry"],
    specs: { Type: "Amino Energy", Sugar: "0g", Caffeine: "Natural", Weight: "9.5 OZ", Servings: "30", Flavour: "Blue Raspberry" },
    pexelsQuery: "amino energy supplement powder container",
  },
  {
    name: "Shaker Bottle",
    slug: "on-shaker-bottle",
    description: "Premium ON branded shaker bottle for mixing protein shakes and supplements. Black with red accents. Durable, leak-proof design.",
    shortDesc: "ON branded shaker | Black/Red | Leak-proof",
    productType: "Accessory", price: 39,
    categorySlug: "accessories", brand: "Optimum Nutrition", sku: "ON-SHAKER-BK",
    weight: 0.15, stock: 50, rating: 4.3, reviewCount: 432,
    isFeatured: false, isBestSeller: false, isNew: false,
    tags: ["shaker", "bottle", "accessory"],
    specs: { Type: "Shaker Bottle", Colour: "Black/Red", Feature: "Leak-proof" },
    pexelsQuery: "protein shaker bottle gym",
  },
];

// ============================================================
// HELPERS
// ============================================================

function downloadUrl(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "TayamoBot/1.0" } }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadUrl(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode}`)); return; }
      const chunks: Buffer[] = [];
      res.on("data", (c: Buffer) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function uploadCloudinary(buffer: Buffer, folder: string, name: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `tayamo/shop/${folder}`, public_id: name, resource_type: "image", transformation: [{ width: 600, height: 600, crop: "fill", quality: "auto", format: "auto" }] },
      (err, result) => (err ? reject(err) : resolve(result!.secure_url))
    );
    stream.end(buffer);
  });
}

async function fetchPexels(query: string): Promise<string | null> {
  if (!PEXELS_KEY) return null;
  try {
    const encoded = encodeURIComponent(query);
    const data = await new Promise<any>((resolve, reject) => {
      https.get(`https://api.pexels.com/v1/search?query=${encoded}&per_page=3&orientation=square`, {
        headers: { Authorization: PEXELS_KEY },
      }, (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => resolve(JSON.parse(body)));
      }).on("error", reject);
    });
    if (data.photos?.length > 0) {
      return data.photos[0].src.large2x || data.photos[0].src.large || data.photos[0].src.medium;
    }
  } catch {}
  return null;
}

function getPlaceholder(slug: string): string {
  return path.join(process.cwd(), "public", "products", `placeholder-${slug.split("-")[0]}.svg`);
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  process.stdout.write("\n  =============================================\n");
  process.stdout.write("   Tayamo Sport — Seed 13 ON Products\n");
  process.stdout.write("  =============================================\n\n");

  // Clean
  process.stdout.write("  Cleaning old shop data...\n");
  await prisma.shopReview.deleteMany();
  await prisma.shopOrderItem.deleteMany();
  await prisma.shopOrder.deleteMany();
  await prisma.shopProduct.deleteMany();
  await prisma.shopCategory.deleteMany();
  process.stdout.write("  Done.\n\n");

  // Categories
  process.stdout.write("  Creating 9 categories...\n");
  const catMap: Record<string, number> = {};
  for (const cat of CATEGORIES) {
    const c = await prisma.shopCategory.create({
      data: { name: cat.name, slug: cat.slug, icon: cat.icon, description: cat.description, sortOrder: cat.sortOrder, isActive: true },
    });
    catMap[cat.slug] = c.id;
    process.stdout.write("    + " + cat.name + "\n");
  }

  // Products
  process.stdout.write("\n  Seeding 13 products...\n\n");
  const results: string[] = [];

  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const catId = catMap[p.categorySlug];
    if (!catId) continue;

    let imageUrl = "";

    // Try Pexels
    const pexelsUrl = await fetchPexels(p.pexelsQuery);
    if (pexelsUrl) {
      try {
        const buf = await downloadUrl(pexelsUrl);
        if (buf.length > 5000) {
          imageUrl = await uploadCloudinary(buf, p.categorySlug, p.slug);
        }
      } catch {}
    }

    // Fallback
    if (!imageUrl) {
      const ph = getPlaceholder(p.slug);
      if (fs.existsSync(ph)) {
        try {
          const buf = fs.readFileSync(ph);
          imageUrl = await uploadCloudinary(buf, p.categorySlug, "placeholder-" + p.slug);
        } catch { imageUrl = "/products/placeholder-" + p.categorySlug.split("-")[0] + ".svg"; }
      } else { imageUrl = "/products/placeholder-whey.svg"; }
    }

    await prisma.shopProduct.create({
      data: {
        name: p.name, slug: p.slug, description: p.description, shortDesc: p.shortDesc,
        productType: p.productType, price: p.price, compareAtPrice: p.compareAtPrice ?? null,
        images: JSON.stringify([imageUrl]), categoryId: catId, brand: p.brand, sku: p.sku,
        weight: p.weight ?? null, stock: p.stock, rating: p.rating, reviewCount: p.reviewCount,
        isFeatured: p.isFeatured, isNew: p.isNew, isBestSeller: p.isBestSeller, isActive: true,
        tags: JSON.stringify(p.tags), sizes: JSON.stringify([]), colors: JSON.stringify(p.colors || []),
        specifications: JSON.stringify(p.specs || {}),
      },
    });

    const src = imageUrl.includes("cloudinary") ? "Pexels" : "Placeholder";
    results.push(`${String(i + 1).padStart(2)}. ${p.name.padEnd(45)} ${p.categorySlug.padEnd(18)} ${String(p.price + " TND").padEnd(10)} ${src}`);
    process.stdout.write(`  [${i + 1}/13] ${p.name} [${src}]\n`);
  }

  // Summary
  process.stdout.write("\n  =============================================\n");
  process.stdout.write("  PRODUCT SUMMARY\n");
  process.stdout.write("  =============================================\n");
  for (const r of results) process.stdout.write("  " + r + "\n");
  process.stdout.write("  =============================================\n");
  process.stdout.write("\n  Done! 9 categories + 13 products seeded.\n\n");

  await prisma.$disconnect();
}

main().catch((e) => { process.stderr.write("Error: " + String(e) + "\n"); process.exit(1); });
