/**
 * Tayamo Sport — Premium Sports Nutrition Store v4 (Final)
 *
 * - Cleans ALL shop data
 * - Creates 8 categories
 * - Seeds 25 products with Pexels images (category-specific queries)
 * - Falls back to local /public/products/ placeholders
 *
 * Usage: npx tsx prisma/seed-final.ts
 */

import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import https from "https";
import http from "http";
import fs from "fs";
import path from "path";

// Load .env.local manually (Next.js convention)
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.substring(0, eqIdx).trim();
      const val = trimmed.substring(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}
// Also load .env as fallback
const envBase = path.join(process.cwd(), ".env");
if (fs.existsSync(envBase)) {
  const envContent = fs.readFileSync(envBase, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.substring(0, eqIdx).trim();
      const val = trimmed.substring(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PEXELS_KEY = process.env.PEXELS_API_KEY || "";

// ============================================================
// CATEGORIES
// ============================================================

const CATEGORIES = [
  { name: "Whey Protein", slug: "whey-protein", icon: "\u{1F95B}", description: "Premium whey protein blends for muscle growth and recovery", sortOrder: 1 },
  { name: "Whey Isolate", slug: "whey-isolate", icon: "\u{1F48E}", description: "Ultra-pure whey isolate with minimal fat and carbs", sortOrder: 2 },
  { name: "Hydrolyzed Whey", slug: "hydrolyzed-whey", icon: "\u{26A1}", description: "Fast-absorbing hydrolyzed whey for rapid recovery", sortOrder: 3 },
  { name: "Mass Gainer", slug: "mass-gainer", icon: "\u{1F4AA}", description: "High-calorie mass gainers for hardgainers", sortOrder: 4 },
  { name: "Creatine", slug: "creatine", icon: "\u{26A1}", description: "Pure creatine for strength, power and endurance", sortOrder: 5 },
  { name: "Pre Workout", slug: "pre-workout", icon: "\u{1F525}", description: "Explosive energy and focus for intense training", sortOrder: 6 },
  { name: "Keto Snacks", slug: "keto-snacks", icon: "\u{1F95C}", description: "Low-carb protein bars and keto-friendly snacks", sortOrder: 7 },
  { name: "Combat Gear", slug: "combat-gear", icon: "\u{1F94A}", description: "Professional boxing and combat sports equipment", sortOrder: 8 },
];

// ============================================================
// PEXELS QUERIES (category-specific, NEVER generic)
// ============================================================

const PEXELS_QUERIES: Record<string, string> = {
  "whey-protein": "whey protein powder container",
  "whey-isolate": "protein isolate powder tub",
  "hydrolyzed-whey": "protein powder supplement jar",
  "mass-gainer": "mass gainer protein tub",
  "creatine": "creatine powder supplement",
  "pre-workout": "pre workout supplement container",
  "keto-snacks": "protein bar snack package",
  "combat-gear": "boxing gloves equipment",
};

// ============================================================
// PRODUCTS (25 total)
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
  sizes?: string[];
  specs?: Record<string, string>;
};

const PRODUCTS: ProductDef[] = [
  // ===== WHEY PROTEIN (5) =====
  {
    name: "Gold Standard 100% Whey",
    slug: "gold-standard-100-whey",
    description: "The world's best-selling whey protein. 24g of pure whey protein per serving with 5.5g of naturally occurring BCAAs. Supports muscle recovery and lean muscle growth. Trusted by athletes worldwide for over 30 years.",
    shortDesc: "24g protein | 5.5g BCAAs | 29 servings",
    productType: "Whey Protein", price: 289, compareAtPrice: 349,
    categorySlug: "whey-protein", brand: "Optimum Nutrition", sku: "ON-GSW-2.27",
    weight: 2.27, stock: 45, rating: 4.8, reviewCount: 2341,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["whey", "protein", "best-seller"], colors: ["Chocolate", "Vanilla", "Strawberry"],
    specs: { Protein: "24g", BCAAs: "5.5g", Servings: "29" },
  },
  {
    name: "Elite Whey Protein",
    slug: "dymatize-elite-whey",
    description: "Premium whey protein blend with 25g of protein per serving. Features a blend of whey concentrate and isolate for sustained amino acid delivery.",
    shortDesc: "25g protein | Great taste & mixability",
    productType: "Whey Protein", price: 249,
    categorySlug: "whey-protein", brand: "Dymatize", sku: "DYM-EW-2.27",
    weight: 2.27, stock: 35, rating: 4.6, reviewCount: 1567,
    isFeatured: false, isBestSeller: true, isNew: false,
    tags: ["whey", "protein", "blend"], colors: ["Chocolate", "Vanilla"],
    specs: { Protein: "25g", BCAAs: "5.5g", Servings: "32" },
  },
  {
    name: "Impact Whey Protein",
    slug: "myprotein-impact-whey",
    description: "Award-winning whey protein concentrate with 21g of protein per serving. Informed Sport certified. Over 40 flavours available.",
    shortDesc: "21g protein | Informed Sport certified",
    productType: "Whey Protein", price: 189, compareAtPrice: 229,
    categorySlug: "whey-protein", brand: "MyProtein", sku: "MP-IWP-2.5",
    weight: 2.5, stock: 60, rating: 4.5, reviewCount: 3210,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["whey", "protein", "value"], colors: ["Chocolate", "Strawberry", "Banana"],
    specs: { Protein: "21g", BCAAs: "4.5g", Servings: "50" },
  },
  {
    name: "R1 Whey Blend",
    slug: "rule1-r1-whey-blend",
    description: "High-quality whey protein blend with fast-acting whey isolate as the primary source. 24g of protein per scoop with a delicious taste.",
    shortDesc: "24g protein | Isolate-first blend",
    productType: "Whey Protein", price: 259,
    categorySlug: "whey-protein", brand: "Rule 1", sku: "R1-RWB-2.27",
    weight: 2.27, stock: 35, rating: 4.6, reviewCount: 876,
    isFeatured: false, isBestSeller: false, isNew: false,
    tags: ["whey", "protein", "blend"], colors: ["Chocolate Fudge", "Vanilla"],
    specs: { Protein: "24g", BCAAs: "5g", Servings: "30" },
  },
  {
    name: "Zero Carb Whey Protein",
    slug: "isopure-zero-carb-whey",
    description: "100% whey protein isolate with zero carbs. Perfect for low-carb and ketogenic diets. 25g of pure protein per serving.",
    shortDesc: "Zero carb | 25g protein | Keto-friendly",
    productType: "Whey Protein", price: 329,
    categorySlug: "whey-protein", brand: "Isopure", sku: "IS-ZC-2.27",
    weight: 2.27, stock: 20, rating: 4.5, reviewCount: 876,
    isFeatured: false, isBestSeller: false, isNew: false,
    tags: ["whey", "zero-carb", "keto"], colors: ["Vanilla", "Chocolate"],
    specs: { Protein: "25g", Carbs: "0g", Servings: "29" },
  },

  // ===== WHEY ISOLATE (3) =====
  {
    name: "Gold Standard Isolate",
    slug: "on-gold-standard-isolate",
    description: "Pure whey protein isolate with 25g of protein and less than 1g of sugar per serving. Micro-filtered for maximum purity.",
    shortDesc: "25g isolate | <1g sugar | Premium purity",
    productType: "Whey Isolate", price: 349, compareAtPrice: 399,
    categorySlug: "whey-isolate", brand: "Optimum Nutrition", sku: "ON-GSI-1.36",
    weight: 1.36, stock: 30, rating: 4.7, reviewCount: 1234,
    isFeatured: true, isBestSeller: false, isNew: false,
    tags: ["isolate", "whey", "pure"], colors: ["Chocolate", "Vanilla"],
    specs: { Protein: "25g", Sugar: "<1g", Servings: "31" },
  },
  {
    name: "ISO100 Hydrolyzed",
    slug: "dymatize-iso100-hydrolyzed",
    description: "100% hydrolyzed whey protein isolate filtered for maximum purity. Zero sugar, zero fat, and fast-absorbing for rapid post-workout recovery.",
    shortDesc: "Hydrolyzed isolate | Zero sugar & fat",
    productType: "Whey Isolate", price: 379, compareAtPrice: 429,
    categorySlug: "whey-isolate", brand: "Dymatize", sku: "DYM-ISO-2.27",
    weight: 2.27, stock: 25, rating: 4.7, reviewCount: 1567,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["isolate", "hydrolyzed", "premium"], colors: ["Gourmet Chocolate", "Birthday Cake"],
    specs: { Protein: "25g", Sugar: "0g", Fat: "0g" },
  },
  {
    name: "Low Carb Protein Isolate",
    slug: "isopure-low-carb-isolate",
    description: "100% whey protein isolate with only 3g net carbs per serving. Packed with 25g of protein and essential vitamins.",
    shortDesc: "25g isolate | 3g net carbs | Vitamins",
    productType: "Whey Isolate", price: 319,
    categorySlug: "whey-isolate", brand: "Isopure", sku: "IS-LC-3.18",
    weight: 3.18, stock: 20, rating: 4.5, reviewCount: 654,
    isFeatured: false, isBestSeller: false, isNew: true,
    tags: ["isolate", "low-carb", "vitamins"], colors: ["Vanilla", "Apple Melon"],
    specs: { Protein: "25g", "Net Carbs": "3g", Servings: "44" },
  },

  // ===== HYDROLYZED WHEY (2) =====
  {
    name: "Platinum Hydrowhey",
    slug: "on-platinum-hydrowhey",
    description: "Advanced hydrolyzed whey protein isolate with micronized peptides for ultra-fast absorption. 30g of protein per serving.",
    shortDesc: "30g hydrolyzed peptides | Ultra-fast",
    productType: "Hydrolyzed Whey", price: 399, compareAtPrice: 449,
    categorySlug: "hydrolyzed-whey", brand: "Optimum Nutrition", sku: "ON-PH-1.59",
    weight: 1.59, stock: 25, rating: 4.6, reviewCount: 987,
    isFeatured: true, isBestSeller: false, isNew: false,
    tags: ["hydrolyzed", "peptides", "fast"], colors: ["Chocolate", "Vanilla"],
    specs: { Protein: "30g", Fat: "1g", Servings: "22" },
  },
  {
    name: "ISO100 Gourmet Chocolate",
    slug: "dymatize-iso100-gourmet-chocolate",
    description: "The legendary ISO100 in gourmet chocolate flavour. Hydrolyzed whey isolate with 25g protein, zero sugar, and incredible taste.",
    shortDesc: "Gourmet Chocolate | 25g isolate",
    productType: "Hydrolyzed Whey", price: 369,
    categorySlug: "hydrolyzed-whey", brand: "Dymatize", sku: "DYM-ISO100-GC",
    weight: 2.27, stock: 20, rating: 4.7, reviewCount: 1089,
    isFeatured: false, isBestSeller: true, isNew: false,
    tags: ["hydrolyzed", "chocolate", "gourmet"], colors: ["Gourmet Chocolate"],
    specs: { Protein: "25g", Sugar: "0g", Servings: "28" },
  },

  // ===== MASS GAINER (4) =====
  {
    name: "Serious Mass",
    slug: "on-serious-mass",
    description: "High-calorie weight gainer with 1250 calories and 50g of protein per serving. For hardgainers who need extra calories to build mass.",
    shortDesc: "1250 cal | 50g protein | Weight gainer",
    productType: "Mass Gainer", price: 269, compareAtPrice: 319,
    categorySlug: "mass-gainer", brand: "Optimum Nutrition", sku: "ON-SM-5.44",
    weight: 5.44, stock: 25, rating: 4.5, reviewCount: 1876,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["mass", "gainer", "calories"], colors: ["Chocolate", "Vanilla"],
    specs: { Calories: "1250", Protein: "50g", Carbs: "252g" },
  },
  {
    name: "Mass Tech Elite",
    slug: "muscletech-mass-tech-elite",
    description: "Advanced mass gainer with 1000 calories, 80g of multi-source protein, and added creatine for maximum muscle building.",
    shortDesc: "1000 cal | 80g protein | Creatine added",
    productType: "Mass Gainer", price: 349, compareAtPrice: 399,
    categorySlug: "mass-gainer", brand: "MuscleTech", sku: "MT-MTE-6.8",
    weight: 6.8, stock: 15, rating: 4.4, reviewCount: 654,
    isFeatured: false, isBestSeller: false, isNew: false,
    tags: ["mass", "gainer", "creatine"], colors: ["Chocolate", "Vanilla"],
    specs: { Calories: "1000", Protein: "80g", Creatine: "10g" },
  },
  {
    name: "True Mass",
    slug: "bsn-true-mass",
    description: "Premium mass gainer with 1230 calories, 50g of multi-source protein, and MCTs for sustained energy.",
    shortDesc: "1230 cal | Multi-source protein | MCTs",
    productType: "Mass Gainer", price: 299,
    categorySlug: "mass-gainer", brand: "BSN", sku: "BSN-TM-5.84",
    weight: 5.84, stock: 20, rating: 4.5, reviewCount: 987,
    isFeatured: false, isBestSeller: true, isNew: false,
    tags: ["mass", "gainer", "mct"], colors: ["Chocolate", "Vanilla"],
    specs: { Calories: "1230", Protein: "50g", Carbs: "215g" },
  },
  {
    name: "Mutant Mass",
    slug: "mutant-mass",
    description: "Extreme mass gainer with 1060 calories and 56g of protein per serving. Built for true hardgainers. 10-source protein blend.",
    shortDesc: "1060 cal | 10-source protein | Extreme",
    productType: "Mass Gainer", price: 329,
    categorySlug: "mass-gainer", brand: "Mutant", sku: "MU-MM-6.8",
    weight: 6.8, stock: 15, rating: 4.3, reviewCount: 432,
    isFeatured: false, isBestSeller: false, isNew: true,
    tags: ["mass", "gainer", "extreme"], colors: ["Chocolate", "Vanilla"],
    specs: { Calories: "1060", Protein: "56g", Sources: "10" },
  },

  // ===== CREATINE (4) =====
  {
    name: "Micronized Creatine Powder",
    slug: "on-micronized-creatine",
    description: "Pure micronized creatine monohydrate for increased strength, power, and muscle endurance. The most researched supplement in history.",
    shortDesc: "5g creatine | 120 servings | Pure",
    productType: "Creatine", price: 89, compareAtPrice: 119,
    categorySlug: "creatine", brand: "Optimum Nutrition", sku: "ON-CR-600",
    weight: 0.63, stock: 80, rating: 4.7, reviewCount: 3456,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["creatine", "strength", "power"], specs: { Creatine: "5g", Servings: "120" },
  },
  {
    name: "Creatine Monohydrate (Creapure)",
    slug: "creapure-creatine",
    description: "Pure Creapure creatine monohydrate from Germany. The highest quality creatine available. Unflavored, micronized, lab-tested.",
    shortDesc: "German Creapure | Lab-tested | 200 servings",
    productType: "Creatine", price: 119,
    categorySlug: "creatine", brand: "Creapure", sku: "CP-CM-1",
    weight: 1.0, stock: 50, rating: 4.6, reviewCount: 1234,
    isFeatured: true, isBestSeller: false, isNew: false,
    tags: ["creatine", "creapure", "german"], specs: { Creatine: "5g", Source: "Creapure", Servings: "200" },
  },
  {
    name: "Creatine Monohydrate",
    slug: "myprotein-creatine",
    description: "Pure creatine monohydrate powder. Lab-tested for purity. Unflavored and micronized for easy mixing.",
    shortDesc: "Pure creatine | Unflavored | Lab-tested",
    productType: "Creatine", price: 69, compareAtPrice: 89,
    categorySlug: "creatine", brand: "MyProtein", sku: "MP-CM-1",
    weight: 1.0, stock: 70, rating: 4.5, reviewCount: 2345,
    isFeatured: false, isBestSeller: true, isNew: false,
    tags: ["creatine", "pure", "value"], specs: { Creatine: "5g", Servings: "200" },
  },
  {
    name: "Creatine Monohydrate Powder",
    slug: "dymatize-creatine",
    description: "Micronized creatine monohydrate for increased muscle strength and power. Pure, unflavored, HPLC tested for purity.",
    shortDesc: "Micronized | HPLC tested | 90 servings",
    productType: "Creatine", price: 79,
    categorySlug: "creatine", brand: "Dymatize", sku: "DYM-CM-454",
    weight: 0.45, stock: 40, rating: 4.5, reviewCount: 654,
    isFeatured: false, isBestSeller: false, isNew: false,
    tags: ["creatine", "micronized", "hplc"], specs: { Creatine: "5g", HPLC: "Tested", Servings: "90" },
  },

  // ===== PRE WORKOUT (3) =====
  {
    name: "C4 Original Pre Workout",
    slug: "c4-original-preworkout",
    description: "America's #1 pre-workout with explosive energy, focus, and endurance. Features CarnoSyn beta-alanine and caffeine.",
    shortDesc: "150mg caffeine | Explosive energy | 30 servings",
    productType: "Pre Workout", price: 149, compareAtPrice: 179,
    categorySlug: "pre-workout", brand: "Cellucor", sku: "CC-C4-30",
    weight: 0.27, stock: 55, rating: 4.5, reviewCount: 3210,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["pre-workout", "energy", "caffeine"], colors: ["Fruit Punch", "Blue Raspberry", "Watermelon"],
    specs: { Caffeine: "150mg", BetaAlanine: "1.6g", Servings: "30" },
  },
  {
    name: "Ghost Legend V4",
    slug: "ghost-legend-preworkout",
    description: "Premium pre-workout with AlphaSize, S7, and NeuroFactor for energy, pumps, and focus. Full transparency and amazing flavours.",
    shortDesc: "250mg caffeine | Energy + Pumps + Focus",
    productType: "Pre Workout", price: 169,
    categorySlug: "pre-workout", brand: "Ghost", sku: "GH-LEG-30",
    weight: 0.3, stock: 25, rating: 4.6, reviewCount: 876,
    isFeatured: false, isBestSeller: true, isNew: true,
    tags: ["pre-workout", "pumps", "focus"], colors: ["Sour Keys", "Warheads Watermelon"],
    specs: { Caffeine: "250mg", AlphaSize: "300mg", Servings: "30" },
  },
  {
    name: "Pre JYM",
    slug: "pre-jym",
    description: "Science-backed pre-workout with 13 active ingredients at clinically effective doses. Transparent label, no proprietary blends.",
    shortDesc: "13 ingredients | No proprietary blends",
    productType: "Pre Workout", price: 179, compareAtPrice: 209,
    categorySlug: "pre-workout", brand: "JYM Supplement Science", sku: "JYM-Pre-30",
    weight: 0.35, stock: 30, rating: 4.7, reviewCount: 987,
    isFeatured: true, isBestSeller: false, isNew: false,
    tags: ["pre-workout", "transparent", "science"], colors: ["Blue Raspberry", "Orange Mango"],
    specs: { Caffeine: "300mg", BetaAlanine: "3.2g", Creatine: "5g" },
  },

  // ===== KETO SNACKS (2) =====
  {
    name: "Quest Protein Bar (12 Pack)",
    slug: "quest-protein-bar",
    description: "High-fiber, low-sugar protein bar with 21g of protein and only 1g of sugar. Perfect meal replacement or post-workout snack.",
    shortDesc: "21g protein | 1g sugar | 14g fiber",
    productType: "Keto Snack", price: 129,
    categorySlug: "keto-snacks", brand: "Quest Nutrition", sku: "QN-PB-12",
    weight: 0.7, stock: 80, rating: 4.6, reviewCount: 3456,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["protein-bar", "keto", "low-sugar"], colors: ["Chocolate Chip", "Peanut Butter", "Cookies & Cream"],
    specs: { Protein: "21g", Sugar: "1g", Fiber: "14g" },
  },
  {
    name: "Grenade Carb Killa Bar (12 Pack)",
    slug: "grenade-carb-killa",
    description: "Ultra-low sugar protein bar with 22g of protein and crispy texture. Triple-layered for maximum taste.",
    shortDesc: "22g protein | Triple-layered | <1g sugar",
    productType: "Keto Snack", price: 139, compareAtPrice: 159,
    categorySlug: "keto-snacks", brand: "Grenade", sku: "GR-CK-12",
    weight: 0.72, stock: 60, rating: 4.7, reviewCount: 1876,
    isFeatured: true, isBestSeller: false, isNew: false,
    tags: ["protein-bar", "low-sugar", "triple-layer"], colors: ["Fudge Brownie", "White Chocolate", "Salted Caramel"],
    specs: { Protein: "22g", Sugar: "<1g", Calories: "216" },
  },

  // ===== COMBAT GEAR (2) =====
  {
    name: "Challenger Boxing Gloves",
    slug: "venum-challenger-boxing-gloves",
    description: "Premium synthetic leather boxing gloves with multi-density foam padding. Suitable for training and sparring. Secure velcro closure.",
    shortDesc: "Synthetic leather | Multi-density foam",
    productType: "Boxing Gloves", price: 159, compareAtPrice: 199,
    categorySlug: "combat-gear", brand: "Venum", sku: "VN-CH-BG",
    weight: 0.9, stock: 30, rating: 4.6, reviewCount: 876,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["boxing", "gloves", "training"], colors: ["Black/Red", "All Black", "Green/Black"],
    sizes: ["10oz", "12oz", "14oz", "16oz"],
    specs: { Material: "Synthetic Leather", Padding: "Multi-Density Foam", Closure: "Velcro" },
  },
  {
    name: "Pro Style Boxing Gloves",
    slug: "everlast-pro-boxing-gloves",
    description: "Professional-grade boxing gloves with EverCool ventilation technology. Premium leather construction with dense foam padding.",
    shortDesc: "Premium leather | EverCool ventilation",
    productType: "Boxing Gloves", price: 139,
    categorySlug: "combat-gear", brand: "Everlast", sku: "EV-PRO-BG",
    weight: 0.85, stock: 25, rating: 4.4, reviewCount: 567,
    isFeatured: false, isBestSeller: false, isNew: false,
    tags: ["boxing", "gloves", "professional"], colors: ["Black", "Red"],
    sizes: ["12oz", "14oz", "16oz"],
    specs: { Material: "Premium Leather", Ventilation: "EverCool", Padding: "Dense Foam" },
  },
];

// ============================================================
// IMAGE DOWNLOAD + UPLOAD
// ============================================================

function downloadUrl(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, { headers: { "User-Agent": "TayamoBot/1.0" } }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return downloadUrl(res.headers.location).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

async function uploadCloudinary(buffer: Buffer, folder: string, name: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `tayamo/shop/${folder}`,
        public_id: name,
        resource_type: "image",
        transformation: [{ width: 600, height: 600, crop: "fill", quality: "auto", format: "auto" }],
      },
      (err, result) => (err ? reject(err) : resolve(result!.secure_url))
    );
    stream.end(buffer);
  });
}

async function fetchPexelsImage(query: string): Promise<string | null> {
  if (!PEXELS_KEY) return null;
  try {
    const encoded = encodeURIComponent(query);
    const data = await new Promise<any>((resolve, reject) => {
      https
        .get(`https://api.pexels.com/v1/search?query=${encoded}&per_page=5&orientation=square`, {
          headers: { Authorization: PEXELS_KEY },
        }, (res) => {
          let body = "";
          res.on("data", (c) => (body += c));
          res.on("end", () => resolve(JSON.parse(body)));
        })
        .on("error", reject);
    });

    if (data.photos && data.photos.length > 0) {
      // Pick the first photo (most relevant)
      return data.photos[0].src.large2x || data.photos[0].src.large || data.photos[0].src.medium;
    }
  } catch {}
  return null;
}

function getPlaceholderPath(categorySlug: string): string {
  return path.join(process.cwd(), "public", "products", `placeholder-${categorySlug}.svg`);
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  process.stdout.write("\n");
  process.stdout.write("  ================================================\n");
  process.stdout.write("   Tayamo Sport - Premium Supplements v4 (Final)\n");
  process.stdout.write("  ================================================\n\n");

  // STEP 1: Clean
  process.stdout.write("  [1/4] Cleaning database...\n");
  await prisma.shopReview.deleteMany();
  await prisma.shopOrderItem.deleteMany();
  await prisma.shopOrder.deleteMany();
  await prisma.shopProduct.deleteMany();
  await prisma.shopCategory.deleteMany();
  process.stdout.write("         All shop data deleted.\n\n");

  // STEP 2: Categories
  process.stdout.write("  [2/4] Creating 8 categories...\n");
  const catMap: Record<string, number> = {};
  for (const cat of CATEGORIES) {
    const c = await prisma.shopCategory.create({
      data: { name: cat.name, slug: cat.slug, icon: cat.icon, description: cat.description, sortOrder: cat.sortOrder, isActive: true },
    });
    catMap[cat.slug] = c.id;
    process.stdout.write("         + " + cat.name + "\n");
  }
  process.stdout.write("\n");

  // STEP 3: Products + Images
  process.stdout.write("  [3/4] Seeding 25 products with Pexels images...\n\n");

  const results: { name: string; category: string; price: number; image: string }[] = [];

  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const catId = catMap[p.categorySlug];
    if (!catId) { process.stdout.write("  [!] Skip " + p.name + ": category not found\n"); continue; }

    const pexelsQuery = PEXELS_QUERIES[p.categorySlug] || "supplement product";
    let finalImageUrl = "";

    // Try Pexels
    const pexelsUrl = await fetchPexelsImage(pexelsQuery);
    if (pexelsUrl) {
      try {
        const buffer = await downloadUrl(pexelsUrl);
        if (buffer.length > 5000) {
          finalImageUrl = await uploadCloudinary(buffer, p.categorySlug, p.slug);
          process.stdout.write("  [" + (i + 1) + "/25] " + p.name + " [Pexels OK]\n");
        }
      } catch {}
    }

    // Fallback to local placeholder
    if (!finalImageUrl) {
      const placeholderPath = getPlaceholderPath(p.categorySlug);
      if (fs.existsSync(placeholderPath)) {
        try {
          const svgBuffer = fs.readFileSync(placeholderPath);
          finalImageUrl = await uploadCloudinary(svgBuffer, p.categorySlug, "placeholder-" + p.slug);
          process.stdout.write("  [" + (i + 1) + "/25] " + p.name + " [Placeholder]\n");
        } catch {
          finalImageUrl = "/products/placeholder-" + p.categorySlug + ".svg";
          process.stdout.write("  [" + (i + 1) + "/25] " + p.name + " [Local SVG]\n");
        }
      } else {
        finalImageUrl = "/products/placeholder-" + p.categorySlug + ".svg";
        process.stdout.write("  [" + (i + 1) + "/25] " + p.name + " [Local SVG]\n");
      }
    }

    // Create product
    await prisma.shopProduct.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        shortDesc: p.shortDesc,
        productType: p.productType,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        images: JSON.stringify([finalImageUrl]),
        categoryId: catId,
        brand: p.brand,
        sku: p.sku,
        weight: p.weight ?? null,
        stock: p.stock,
        rating: p.rating,
        reviewCount: p.reviewCount,
        isFeatured: p.isFeatured,
        isNew: p.isNew,
        isBestSeller: p.isBestSeller,
        isActive: true,
        tags: JSON.stringify(p.tags),
        sizes: JSON.stringify(p.sizes || []),
        colors: JSON.stringify(p.colors || []),
        specifications: JSON.stringify(p.specs || {}),
      },
    });

    results.push({ name: p.name, category: p.categorySlug, price: p.price, image: finalImageUrl });
  }

  // STEP 4: Summary table
  process.stdout.write("\n  [4/4] Product Summary\n");
  process.stdout.write("  " + "=".repeat(90) + "\n");
  process.stdout.write("  " + "Product".padEnd(40) + "Category".padEnd(18) + "Price".padEnd(10) + "Image\n");
  process.stdout.write("  " + "-".repeat(90) + "\n");
  for (const r of results) {
    const imgType = r.image.includes("pexels") ? "Pexels" : r.image.includes("placeholder") ? "Placeholder" : "Cloudinary";
    process.stdout.write("  " + r.name.padEnd(40) + r.category.padEnd(18) + (r.price + " TND").padEnd(10) + imgType + "\n");
  }
  process.stdout.write("  " + "=".repeat(90) + "\n");
  process.stdout.write("\n  Done! 8 categories + " + results.length + " products seeded.\n\n");

  await prisma.$disconnect();
}

main().catch((e) => {
  process.stderr.write("Error: " + String(e) + "\n");
  process.exit(1);
});
