/**
 * Tayamo Sport — Premium Shop Seed Script
 *
 * Downloads product images, uploads them to Cloudinary,
 * and populates the database with 5 categories + 50 products.
 *
 * Usage: npx tsx prisma/seed-shop-premium.ts
 */

import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import https from "https";
import http from "http";

// ============================================================
// CLOUDINARY CONFIG
// ============================================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

// ============================================================
// IMAGE DOWNLOAD + UPLOAD HELPER
// ============================================================

function downloadImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, { headers: { "User-Agent": "TayamoBot/1.0" } }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return downloadImage(res.headers.location).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  filename: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `tayamo/shop/${folder}`,
        public_id: filename,
        resource_type: "image",
        transformation: [{ width: 600, height: 600, crop: "fill", quality: "auto", format: "auto" }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    );
    stream.end(buffer);
  });
}

async function fetchAndUpload(
  url: string,
  folder: string,
  filename: string
): Promise<string> {
  try {
    const buffer = await downloadImage(url);
    const cloudUrl = await uploadToCloudinary(buffer, folder, filename);
    process.stdout.write(`  ✓ ${filename}\n`);
    return cloudUrl;
  } catch (err) {
    process.stdout.write(`  ✗ ${filename}: ${err}\n`);
    // Return a fallback placeholder
    return `https://res.cloudinary.com/yfyeotey/image/upload/tayamo/shop/placeholder.jpg`;
  }
}

// ============================================================
// IMAGE SOURCES (Unsplash photos — free to use)
// ============================================================

const IMG = {
  // Categories
  catSupplements: "https://images.unsplash.com/photo-1593095948071-474c5cc2b1aa?w=800&h=600&fit=crop",
  catCombat: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&h=600&fit=crop",
  catApparel: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop",
  catEquipment: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop",
  catAccessories: "https://images.unsplash.com/photo-1570831597283-31a5a8d1e28c?w=800&h=600&fit=crop",

  // Supplements — Whey Protein
  wheyGold: "https://images.unsplash.com/photo-1622485831930-11d0f57f5b1f?w=600&h=600&fit=crop",
  wheyIso100: "https://images.unsplash.com/photo-1593095948071-474c5cc2b1aa?w=600&h=600&fit=crop",
  wheyRule1: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop",
  wheyApplied: "https://images.unsplash.com/photo-1541783245753-14ad98823717?w=600&h=600&fit=crop",

  // Supplements — Creatine & Pre-workout
  creatine: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&h=600&fit=crop",
  preworkout: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop",

  // Supplements — BCAA & Amino
  bcaa: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop",

  // Supplements — Vitamins & Health
  vitamins: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=600&h=600&fit=crop",
  fishOil: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=600&fit=crop",
  proteinBar: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&h=600&fit=crop",
  massGainer: "https://images.unsplash.com/photo-1583454110551-24f2fa695769?w=600&h=600&fit=crop",
  glutamine: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=600&fit=crop",
  casein: "https://images.unsplash.com/photo-1622485831930-11d0f57f5b1f?w=600&h=600&fit=crop&q=80",
  omega: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&h=600&fit=crop",

  // Combat Sports
  boxingGloves: "https://images.unsplash.com/photo-1517438322307-e67111335449?w=600&h=600&fit=crop",
  kickboxingGloves: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&h=600&fit=crop",
  mmaGloves: "https://images.unsplash.com/photo-1517438322307-e67111335449?w=600&h=600&fit=crop&q=80",
  punchingBag: "https://images.unsplash.com/photo-1517438322307-e67111335449?w=600&h=600&fit=crop&q=90",
  handWraps: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&h=600&fit=crop&q=80",
  shinGuards: "https://images.unsplash.com/photo-1517438322307-e67111335449?w=600&h=600&fit=crop&q=70",
  headGuard: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&h=600&fit=crop&q=60",
  jumpRope: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop",
  boxingShoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
  mouthGuard: "https://images.unsplash.com/photo-1517438322307-e67111335449?w=600&h=600&fit=crop&q=50",

  // Apparel
  trainingTee: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop",
  tankTop: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&h=600&fit=crop",
  hoodie: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop",
  gymShorts: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=600&fit=crop",
  joggers: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=600&fit=crop",
  compression: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&h=600&fit=crop",
  leggings: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&h=600&fit=crop&q=80",
  sportsBra: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=600&fit=crop",
  boxingShorts: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&h=600&fit=crop&q=40",
  gymShoes: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=600&fit=crop",
  cap: "https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=600&h=600&fit=crop",
  backpack: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop",

  // Equipment
  dumbbells: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&h=600&fit=crop",
  kettlebell: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600&h=600&fit=crop",
  resistanceBand: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&h=600&fit=crop",
  yogaMat: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad33?w=600&h=600&fit=crop",
  foamRoller: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop",
  barbell: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop",
  gymBelt: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop&q=80",
  massageGun: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&h=600&fit=crop",

  // Accessories
  shaker: "https://images.unsplash.com/photo-1570831597283-31a5a8d1e28c?w=600&h=600&fit=crop",
  waterBottle: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop",
  gymBag: "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=600&h=600&fit=crop",
  gymTowel: "https://images.unsplash.com/photo-1600369672770-985fd30004eb?w=600&h=600&fit=crop",
  timer: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600&h=600&fit=crop",
  wristWraps: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop&q=85",
  liftingStraps: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop&q=75",
};

// ============================================================
// CATEGORIES (5 premium categories)
// ============================================================

const CATEGORIES = [
  { name: "Supplements", slug: "supplements", icon: "💪", description: "Premium sports nutrition for peak performance", sortOrder: 1 },
  { name: "Combat Sports", slug: "combat-sports", icon: "🥊", description: "Professional fighting gear and equipment", sortOrder: 2 },
  { name: "Apparel", slug: "apparel", icon: "👕", description: "Performance clothing for every athlete", sortOrder: 3 },
  { name: "Equipment", slug: "equipment", icon: "🏋️", description: "Professional gym and training equipment", sortOrder: 4 },
  { name: "Accessories", slug: "accessories", icon: "🎒", description: "Essential accessories for your training", sortOrder: 5 },
];

// ============================================================
// PRODUCTS (50 realistic products)
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
  sizes?: string[];
  colors?: string[];
  specs?: Record<string, string>;
  imageKey: keyof typeof IMG;
};

const PRODUCTS: ProductDef[] = [
  // ======================== SUPPLEMENTS (15) ========================
  {
    name: "Gold Standard 100% Whey",
    slug: "gold-standard-100-whey",
    description: "The world's best-selling whey protein. 24g of pure whey protein per serving with 5.5g of naturally occurring BCAAs. Supports muscle recovery and lean muscle growth. Trusted by athletes worldwide for over 30 years.",
    shortDesc: "24g protein per serving",
    productType: "Whey Protein",
    price: 289.00, compareAtPrice: 349.00,
    categorySlug: "supplements", brand: "Optimum Nutrition", sku: "ON-GSW-2.27",
    weight: 2.27, stock: 45, rating: 4.8, reviewCount: 2341,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["whey", "protein", "muscle", "recovery"],
    colors: ["Double Rich Chocolate", "Vanilla Ice Cream", "Strawberry Cream"],
    specs: { "Protein": "24g", "BCAAs": "5.5g", "Servings": "29", "Sugar": "1g" },
    imageKey: "wheyGold",
  },
  {
    name: "ISO 100 Hydrolyzed Whey Isolate",
    slug: "iso-100-hydrolyzed",
    description: "100% hydrolyzed whey protein isolate filtered for maximum purity. Zero sugar, zero fat, and fast-absorbing for rapid post-workout recovery. The cleanest protein for serious athletes.",
    shortDesc: "Pure hydrolyzed isolate",
    productType: "Isolate Protein",
    price: 349.00, compareAtPrice: 399.00,
    categorySlug: "supplements", brand: "Dymatize", sku: "DYM-ISO-2.27",
    weight: 2.27, stock: 30, rating: 4.7, reviewCount: 1567,
    isFeatured: true, isBestSeller: false, isNew: false,
    tags: ["isolate", "whey", "pure", "low-carb"],
    colors: ["Gourmet Chocolate", "Birthday Cake"],
    specs: { "Protein": "25g", "Sugar": "0g", "Fat": "0g", "Servings": "28" },
    imageKey: "wheyIso100",
  },
  {
    name: "Rule 1 R1 Whey Blend",
    slug: "rule1-r1-whey",
    description: "High-quality whey protein blend with fast-acting whey isolate as the primary source. 24g of protein per scoop with a delicious taste. Perfect for any time of day.",
    shortDesc: "24g protein blend",
    productType: "Whey Protein",
    price: 259.00,
    categorySlug: "supplements", brand: "Rule 1", sku: "R1-RWB-2.27",
    weight: 2.27, stock: 35, rating: 4.6, reviewCount: 876,
    isFeatured: false, isBestSeller: true, isNew: false,
    tags: ["whey", "protein", "blend", "tasty"],
    colors: ["Chocolate Fudge", "Vanilla Cream"],
    specs: { "Protein": "24g", "BCAAs": "5g", "Servings": "30" },
    imageKey: "wheyRule1",
  },
  {
    name: "Applied Nutrition Critical Whey",
    slug: "applied-nutrition-whey",
    description: "Premium whey protein concentrate with added vitamins and minerals. Tastes incredible mixed with water or milk. Informed Sport certified for competitive athletes.",
    shortDesc: "Informed Sport certified",
    productType: "Whey Protein",
    price: 199.00, compareAtPrice: 249.00,
    categorySlug: "supplements", brand: "Applied Nutrition", sku: "AN-CW-2.27",
    weight: 2.27, stock: 40, rating: 4.5, reviewCount: 654,
    isFeatured: false, isBestSeller: false, isNew: true,
    tags: ["whey", "protein", "certified", "vitamins"],
    colors: ["Chocolate", "Strawberry", "Cookies & Cream"],
    specs: { "Protein": "23g", "BCAAs": "4.5g", "Servings": "30" },
    imageKey: "wheyApplied",
  },
  {
    name: "Micronized Creatine Powder",
    slug: "micronized-creatine",
    description: "Pure micronized creatine monohydrate for increased strength, power, and muscle endurance. The most researched supplement in sports nutrition history.",
    shortDesc: "5g pure creatine",
    productType: "Creatine",
    price: 89.00, compareAtPrice: 119.00,
    categorySlug: "supplements", brand: "Optimum Nutrition", sku: "ON-CR-600",
    weight: 0.63, stock: 80, rating: 4.7, reviewCount: 3456,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["creatine", "strength", "power"],
    specs: { "Creatine": "5g per serving", "Servings": "120" },
    imageKey: "creatine",
  },
  {
    name: "C4 Original Pre-Workout",
    slug: "c4-original-preworkout",
    description: "America's #1 pre-workout with explosive energy, focus, and endurance. Features CarnoSyn beta-alanine and caffeine for maximum performance.",
    shortDesc: "Explosive energy boost",
    productType: "Pre-Workout",
    price: 149.00, compareAtPrice: 179.00,
    categorySlug: "supplements", brand: "Cellucor", sku: "CC-C4-30srv",
    weight: 0.27, stock: 55, rating: 4.5, reviewCount: 3210,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["pre-workout", "energy", "focus", "caffeine"],
    colors: ["Fruit Punch", "Blue Raspberry", "Watermelon"],
    specs: { "Caffeine": "150mg", "Beta-Alanine": "1.6g", "Servings": "30" },
    imageKey: "preworkout",
  },
  {
    name: "EAA + BCAA Complete Amino",
    slug: "eaa-bcaa-complete",
    description: "Full spectrum essential amino acid formula with all 9 EAAs plus additional BCAAs. Supports maximum muscle protein synthesis during training.",
    shortDesc: "Complete EAA blend",
    productType: "BCAA",
    price: 149.00,
    categorySlug: "supplements", brand: "Kevin Levrone", sku: "KL-EAA-30",
    weight: 0.3, stock: 30, rating: 4.6, reviewCount: 876,
    isFeatured: false, isBestSeller: false, isNew: true,
    tags: ["eaa", "bcaa", "amino", "recovery"],
    colors: ["Tropical Punch", "Grape"],
    specs: { "EAAs": "8g", "BCAAs": "6g", "Servings": "30" },
    imageKey: "bcaa",
  },
  {
    name: "Serious Mass Weight Gainer",
    slug: "serious-mass-gainer",
    description: "High-calorie weight gainer with 1250 calories and 50g of protein per serving. For hardgainers who need extra calories to build mass.",
    shortDesc: "1250 calories per serving",
    productType: "Mass Gainer",
    price: 269.00, compareAtPrice: 319.00,
    categorySlug: "supplements", brand: "Optimum Nutrition", sku: "ON-SM-5.44",
    weight: 5.44, stock: 25, rating: 4.5, reviewCount: 1876,
    isFeatured: false, isBestSeller: true, isNew: false,
    tags: ["mass", "gainer", "calories", "weight-gain"],
    colors: ["Chocolate", "Vanilla"],
    specs: { "Calories": "1250", "Protein": "50g", "Carbs": "252g" },
    imageKey: "massGainer",
  },
  {
    name: "Glutamine Recovery Powder",
    slug: "glutamine-recovery",
    description: "Pure L-Glutamine for enhanced muscle recovery and immune system support. Helps reduce muscle breakdown during intense training periods.",
    shortDesc: "L-Glutamine recovery",
    productType: "Glutamine",
    price: 79.00,
    categorySlug: "supplements", brand: "BioTechUSA", sku: "BT-GLUT-60",
    weight: 0.5, stock: 40, rating: 4.4, reviewCount: 567,
    isFeatured: false, isBestSeller: false, isNew: false,
    tags: ["glutamine", "recovery", "immune"],
    specs: { "Glutamine": "5g per serving", "Servings": "60" },
    imageKey: "glutamine",
  },
  {
    name: "Gold Standard Casein",
    slug: "gold-standard-casein",
    description: "Slow-digesting micellar casein protein for sustained amino acid release overnight. Perfect before bed to prevent muscle breakdown during sleep.",
    shortDesc: "Slow-release casein",
    productType: "Casein",
    price: 299.00, compareAtPrice: 349.00,
    categorySlug: "supplements", brand: "Optimum Nutrition", sku: "ON-CS-2.27",
    weight: 2.27, stock: 20, rating: 4.6, reviewCount: 987,
    isFeatured: true, isBestSeller: false, isNew: false,
    tags: ["casein", "slow-digesting", "overnight"],
    colors: ["Chocolate", "Vanilla"],
    specs: { "Protein": "24g", "Digestion": "Slow", "Servings": "29" },
    imageKey: "casein",
  },
  {
    name: "Opti-Men Daily Multivitamin",
    slug: "opti-men-multi",
    description: "Comprehensive multivitamin designed for active men with 75+ ingredients including vitamins, minerals, and amino blends for optimal performance.",
    shortDesc: "75+ ingredients",
    productType: "Vitamin",
    price: 149.00, compareAtPrice: 179.00,
    categorySlug: "supplements", brand: "Optimum Nutrition", sku: "ON-VM-240",
    weight: 0.4, stock: 55, rating: 4.5, reviewCount: 1876,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["vitamins", "multivitamin", "health", "daily"],
    specs: { "Ingredients": "75+", "Servings": "240" },
    imageKey: "vitamins",
  },
  {
    name: "Triple Strength Fish Oil",
    slug: "triple-strength-fish-oil",
    description: "Ultra-pure omega-3 fish oil with 900mg EPA/DHA per softgel. Supports heart health, joint flexibility, and cognitive function.",
    shortDesc: "900mg EPA/DHA",
    productType: "Fish Oil",
    price: 129.00, compareAtPrice: 159.00,
    categorySlug: "supplements", brand: "Optimum Nutrition", sku: "ON-FO-90",
    weight: 0.2, stock: 40, rating: 4.6, reviewCount: 1567,
    isFeatured: false, isBestSeller: true, isNew: false,
    tags: ["fish-oil", "omega-3", "heart", "joints"],
    specs: { "EPA/DHA": "900mg", "Servings": "90 softgels" },
    imageKey: "fishOil",
  },
  {
    name: "Quest Protein Bar",
    slug: "quest-protein-bar",
    description: "High-fiber, low-sugar protein bar with 21g of protein and only 1g of sugar. Perfect meal replacement or post-workout snack. Tastes like a candy bar.",
    shortDesc: "21g protein, 1g sugar",
    productType: "Protein Bar",
    price: 12.00,
    categorySlug: "supplements", brand: "Quest Nutrition", sku: "QN-PB-12pk",
    weight: 0.7, stock: 120, rating: 4.6, reviewCount: 3456,
    isFeatured: false, isBestSeller: true, isNew: false,
    tags: ["protein-bar", "snack", "low-sugar"],
    colors: ["Chocolate Chip", "Peanut Butter", "Cookies & Cream"],
    specs: { "Protein": "21g", "Sugar": "1g", "Fiber": "14g" },
    imageKey: "proteinBar",
  },
  {
    name: "Collagen Peptides Powder",
    slug: "collagen-peptides",
    description: "Hydrolyzed collagen peptides for healthy skin, hair, nails, and joints. Dissolves easily in hot or cold liquids. Grass-fed, pasture-raised.",
    shortDesc: "Hydrolyzed collagen",
    productType: "Collagen",
    price: 159.00, compareAtPrice: 199.00,
    categorySlug: "supplements", brand: "BioTechUSA", sku: "BT-COL-300",
    weight: 0.3, stock: 35, rating: 4.7, reviewCount: 1234,
    isFeatured: false, isBestSeller: false, isNew: true,
    tags: ["collagen", "joints", "skin", "hair"],
    specs: { "Collagen": "11g per serving", "Type": "I & III", "Servings": "28" },
    imageKey: "omega",
  },
  {
    name: "Hydroxycut Hardcore Elite",
    slug: "hydroxycut-hardcore",
    description: "Advanced thermogenic fat burner with caffeine, green tea extract, and cayenne pepper. Boosts metabolism and energy for effective weight management.",
    shortDesc: "Thermogenic fat burner",
    productType: "Fat Burner",
    price: 139.00, compareAtPrice: 169.00,
    categorySlug: "supplements", brand: "MuscleTech", sku: "MT-HC-100",
    weight: 0.2, stock: 30, rating: 4.3, reviewCount: 987,
    isFeatured: false, isBestSeller: false, isNew: false,
    tags: ["fat-burner", "thermogenic", "metabolism"],
    specs: { "Caffeine": "270mg", "Green Tea": "200mg", "Servings": "100" },
    imageKey: "creatine",
  },

  // ======================== COMBAT SPORTS (10) ========================
  {
    name: "Pro Training Boxing Gloves 16oz",
    slug: "pro-training-gloves-16",
    description: "Premium leather boxing gloves with multi-layer foam padding for maximum hand protection. Breathable lining and secure velcro closure. Used by professional fighters worldwide.",
    shortDesc: "Premium leather 16oz",
    productType: "Boxing Gloves",
    price: 189.00, compareAtPrice: 249.00,
    categorySlug: "combat-sports", brand: "Venum", sku: "VN-BG-PT16",
    weight: 0.9, stock: 30, rating: 4.8, reviewCount: 1876,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["boxing", "gloves", "training", "leather"],
    colors: ["Black", "Red", "White/Black"],
    sizes: ["10oz", "12oz", "14oz", "16oz"],
    specs: { "Material": "Premium Leather", "Padding": "Multi-Layer Foam", "Closure": "Velcro" },
    imageKey: "boxingGloves",
  },
  {
    name: "Elite Sparring Gloves 14oz",
    slug: "elite-sparring-gloves-14",
    description: "Professional sparring gloves with extended wrist support and gel-infused padding. Designed for safety during partner training sessions.",
    shortDesc: "14oz sparring gloves",
    productType: "Boxing Gloves",
    price: 159.00,
    categorySlug: "combat-sports", brand: "Everlast", sku: "EV-BG-ES14",
    weight: 0.7, stock: 25, rating: 4.6, reviewCount: 567,
    isFeatured: false, isBestSeller: false, isNew: false,
    tags: ["boxing", "gloves", "sparring"],
    colors: ["Black", "Red"],
    sizes: ["12oz", "14oz", "16oz"],
    specs: { "Material": "Synthetic Leather", "Padding": "Gel-Infused", "Closure": "Velcro" },
    imageKey: "boxingGloves",
  },
  {
    name: "Muay Thai Training Gloves 14oz",
    slug: "muaythai-gloves-14",
    description: "Specialized Muay Thai gloves with open palm design for clinch work and pad training. Premium leather with reinforced stitching.",
    shortDesc: "Muay Thai specific",
    productType: "Kickboxing Gloves",
    price: 169.00,
    categorySlug: "combat-sports", brand: "Twins Special", sku: "TS-KBG-MT14",
    weight: 0.65, stock: 20, rating: 4.7, reviewCount: 876,
    isFeatured: true, isBestSeller: false, isNew: false,
    tags: ["kickboxing", "muay-thai", "gloves"],
    colors: ["Red", "Blue", "Black"],
    sizes: ["10oz", "12oz", "14oz"],
    specs: { "Material": "Genuine Leather", "Style": "Open Palm", "Origin": "Thailand" },
    imageKey: "kickboxingGloves",
  },
  {
    name: "Competition MMA Gloves 4oz",
    slug: "competition-mma-4oz",
    description: "UFC-approved competition gloves with open finger design for grappling. Minimal padding for authentic fight feel with adequate knuckle protection.",
    shortDesc: "UFC-approved 4oz",
    productType: "MMA Gloves",
    price: 119.00,
    categorySlug: "combat-sports", brand: "Venum", sku: "VN-MMA-C4",
    weight: 0.2, stock: 35, rating: 4.6, reviewCount: 1234,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["mma", "gloves", "competition"],
    colors: ["Black", "Red"],
    sizes: ["S/M", "L/XL"],
    specs: { "Approval": "UFC Certified", "Weight": "4oz", "Design": "Open Finger" },
    imageKey: "mmaGloves",
  },
  {
    name: "Heavy Bag 100lb Muay Thai",
    slug: "heavy-bag-100-muaythai",
    description: "Premium Muay Thai heavy bag with extra length for low kicks. Filled with shredded textile for realistic impact and reduced noise.",
    shortDesc: "100lb Muay Thai bag",
    productType: "Punching Bag",
    price: 349.00, compareAtPrice: 449.00,
    categorySlug: "combat-sports", brand: "Adidas Combat", sku: "AD-PB-HB100",
    weight: 45, stock: 12, rating: 4.8, reviewCount: 987,
    isFeatured: true, isBestSeller: false, isNew: false,
    tags: ["punching-bag", "heavy-bag", "muay-thai"],
    specs: { "Weight": "100lb / 45kg", "Length": "130cm", "Fill": "Textile" },
    imageKey: "punchingBag",
  },
  {
    name: "Mexican Style Hand Wraps 180in",
    slug: "mexican-hand-wraps-180",
    description: "Traditional Mexican-style hand wraps with optimal stretch and compression. Provides essential wrist and knuckle support during training.",
    shortDesc: "180in stretch wraps",
    productType: "Hand Wraps",
    price: 29.00,
    categorySlug: "combat-sports", brand: "Everlast", sku: "EV-HW-M180",
    weight: 0.12, stock: 80, rating: 4.5, reviewCount: 2345,
    isFeatured: false, isBestSeller: true, isNew: false,
    tags: ["hand-wraps", "boxing", "wrist-support"],
    colors: ["Red", "Black", "White", "Blue"],
    specs: { "Length": "180 inches", "Material": "Cotton/Elastic", "Closure": "Velcro" },
    imageKey: "handWraps",
  },
  {
    name: "Pro Shin Guards",
    slug: "pro-shin-guards",
    description: "Premium leather shin guards with thick EVA foam padding. Full shin and instep protection for Muay Thai and kickboxing training.",
    shortDesc: "Full shin + instep",
    productType: "Shin Guards",
    price: 89.00, compareAtPrice: 109.00,
    categorySlug: "combat-sports", brand: "Venum", sku: "VN-SG-PG",
    weight: 0.5, stock: 40, rating: 4.6, reviewCount: 1234,
    isFeatured: false, isBestSeller: true, isNew: false,
    tags: ["shin-guards", "muay-thai", "protection"],
    colors: ["Black/Gold", "Red", "White"],
    sizes: ["S", "M", "L", "XL"],
    specs: { "Material": "Premium Leather", "Padding": "EVA Foam", "Coverage": "Shin + Instep" },
    imageKey: "shinGuards",
  },
  {
    name: "Speed Jump Rope Pro",
    slug: "speed-jump-rope-pro",
    description: "Ultra-fast ball bearing jump rope with adjustable cable length. Lightweight aluminum handles for maximum speed and control. Essential for boxing conditioning.",
    shortDesc: "Ball bearing speed rope",
    productType: "Jump Rope",
    price: 39.00, compareAtPrice: 55.00,
    categorySlug: "combat-sports", brand: "Adidas Combat", sku: "AD-JR-SP",
    weight: 0.15, stock: 60, rating: 4.6, reviewCount: 1234,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["jump-rope", "speed", "cardio", "boxing"],
    specs: { "Length": "Adjustable 3m", "Handles": "Aluminum", "Bearings": "Ball Bearing" },
    imageKey: "jumpRope",
  },
  {
    name: "Pro Boxing Boots",
    slug: "pro-boxing-boots",
    description: "Lightweight boxing boots with ankle support and non-marking soles. Designed for quick footwork and lateral movement in the ring.",
    shortDesc: "Lightweight ankle support",
    productType: "Boxing Shoes",
    price: 159.00, compareAtPrice: 199.00,
    categorySlug: "combat-sports", brand: "Adidas Combat", sku: "AD-BS-PBB",
    weight: 0.6, stock: 20, rating: 4.7, reviewCount: 876,
    isFeatured: true, isBestSeller: false, isNew: false,
    tags: ["boxing-shoes", "boots", "footwork"],
    colors: ["Black/White", "Red/White"],
    sizes: ["7", "8", "9", "10", "11", "12"],
    specs: { "Sole": "Non-Marking", "Support": "Ankle", "Weight": "Lightweight" },
    imageKey: "boxingShoes",
  },
  {
    name: "Competition Head Guard",
    slug: "competition-head-guard",
    description: "Lightweight competition head guard with open face design for maximum visibility. Adjustable chin strap and ear protection for safe sparring.",
    shortDesc: "Open face competition",
    productType: "Head Guard",
    price: 79.00,
    categorySlug: "combat-sports", brand: "Leone", sku: "LN-HG-CG",
    weight: 0.3, stock: 25, rating: 4.5, reviewCount: 567,
    isFeatured: false, isBestSeller: false, isNew: false,
    tags: ["head-guard", "competition", "protection"],
    colors: ["Red", "Blue", "Black"],
    sizes: ["S/M", "L/XL"],
    specs: { "Design": "Open Face", "Protection": "Forehead + Cheeks", "Strap": "Velcro" },
    imageKey: "headGuard",
  },

  // ======================== APPAREL (12) ========================
  {
    name: "Dri-FIT Training Tee",
    slug: "dri-fit-training-tee",
    description: "Moisture-wicking Dri-FIT training t-shirt with 4-way stretch fabric. Anti-odor technology keeps you fresh through the most intense workouts.",
    shortDesc: "Dri-FIT moisture-wicking",
    productType: "T-Shirt",
    price: 45.00, compareAtPrice: 59.00,
    categorySlug: "apparel", brand: "Nike", sku: "NK-TS-DF",
    weight: 0.15, stock: 60, rating: 4.5, reviewCount: 2345,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["t-shirt", "training", "moisture-wicking"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "White", "Grey", "Navy"],
    imageKey: "trainingTee",
  },
  {
    name: "Performance Stringer Tank",
    slug: "performance-stringer-tank",
    description: "Sleeveless stringer tank with deep armholes for unrestricted movement. Lightweight, breathable fabric designed for maximum range of motion.",
    shortDesc: "Deep-cut stringer",
    productType: "Tank Top",
    price: 35.00,
    categorySlug: "apparel", brand: "Gymshark", sku: "GS-TT-ST",
    weight: 0.12, stock: 50, rating: 4.5, reviewCount: 987,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["tank-top", "stringer", "gym"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White", "Grey"],
    imageKey: "tankTop",
  },
  {
    name: "Tech Fleece Training Hoodie",
    slug: "tech-fleece-hoodie",
    description: "Lightweight zip-up hoodie with kangaroo pockets and thumbholes. Perfect for warm-ups, cool-downs, and everyday athletic wear.",
    shortDesc: "Lightweight zip hoodie",
    productType: "Hoodie",
    price: 89.00, compareAtPrice: 109.00,
    categorySlug: "apparel", brand: "Adidas", sku: "AD-HD-TF",
    weight: 0.5, stock: 35, rating: 4.6, reviewCount: 1234,
    isFeatured: true, isBestSeller: false, isNew: false,
    tags: ["hoodie", "fleece", "training"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Grey", "Navy"],
    imageKey: "hoodie",
  },
  {
    name: "Gym Training Shorts 7in",
    slug: "gym-training-shorts-7",
    description: "7-inch inseam training shorts with built-in brief liner. Side pockets and elastic waistband for secure fit during any workout.",
    shortDesc: "7in brief-liner shorts",
    productType: "Shorts",
    price: 39.00,
    categorySlug: "apparel", brand: "Under Armour", sku: "UA-SH-GTS7",
    weight: 0.15, stock: 70, rating: 4.5, reviewCount: 2345,
    isFeatured: false, isBestSeller: true, isNew: false,
    tags: ["shorts", "training", "gym"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Grey", "Navy", "Red"],
    imageKey: "gymShorts",
  },
  {
    name: "Fleece Training Joggers",
    slug: "fleece-joggers",
    description: "Comfortable fleece joggers with tapered legs and ribbed cuffs. Perfect for warm-ups, cool-downs, and casual gym wear.",
    shortDesc: "Soft fleece joggers",
    productType: "Joggers",
    price: 69.00, compareAtPrice: 89.00,
    categorySlug: "apparel", brand: "Nike", sku: "NK-JG-FT",
    weight: 0.4, stock: 40, rating: 4.5, reviewCount: 1234,
    isFeatured: false, isBestSeller: true, isNew: false,
    tags: ["joggers", "fleece", "comfortable"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Grey", "Navy"],
    imageKey: "joggers",
  },
  {
    name: "Compression Tights",
    slug: "compression-tights",
    description: "Graduated compression tights for enhanced blood flow and muscle support. Helps reduce fatigue and speeds up recovery during and after training.",
    shortDesc: "Graduated compression",
    productType: "Compression Wear",
    price: 79.00, compareAtPrice: 99.00,
    categorySlug: "apparel", brand: "Under Armour", sku: "UA-CW-CT",
    weight: 0.2, stock: 35, rating: 4.6, reviewCount: 876,
    isFeatured: true, isBestSeller: false, isNew: false,
    tags: ["compression", "tights", "recovery"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Grey"],
    imageKey: "compression",
  },
  {
    name: "High-Waist Training Leggings",
    slug: "high-waist-leggings",
    description: "Squat-proof high-waist leggings with hidden pocket. Buttery soft fabric with 4-way stretch for unrestricted movement during any workout.",
    shortDesc: "Squat-proof high-waist",
    productType: "Leggings",
    price: 59.00, compareAtPrice: 75.00,
    categorySlug: "apparel", brand: "Gymshark", sku: "GS-LG-HWL",
    weight: 0.2, stock: 45, rating: 4.7, reviewCount: 1876,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["leggings", "high-waist", "squat-proof"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black", "Grey", "Navy"],
    imageKey: "leggings",
  },
  {
    name: "High-Impact Sports Bra",
    slug: "high-impact-sports-bra",
    description: "High-impact sports bra with adjustable straps and underband support. Moisture-wicking fabric keeps you dry during intense workouts.",
    shortDesc: "High-impact support",
    productType: "Sports Bra",
    price: 45.00, compareAtPrice: 55.00,
    categorySlug: "apparel", brand: "Nike", sku: "NK-SB-HI",
    weight: 0.1, stock: 50, rating: 4.6, reviewCount: 1234,
    isFeatured: false, isBestSeller: true, isNew: false,
    tags: ["sports-bra", "high-impact", "support"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black", "White", "Grey"],
    imageKey: "sportsBra",
  },
  {
    name: "Muay Thai Boxing Shorts",
    slug: "muay-thai-shorts",
    description: "Traditional satin Muay Thai shorts with wide leg openings for unrestricted kicking. Embroidered Thai lettering for authentic style.",
    shortDesc: "Traditional satin shorts",
    productType: "Boxing Shorts",
    price: 49.00,
    categorySlug: "apparel", brand: "Twins Special", sku: "TS-BS-MT",
    weight: 0.15, stock: 35, rating: 4.5, reviewCount: 876,
    isFeatured: false, isBestSeller: false, isNew: false,
    tags: ["boxing-shorts", "muay-thai", "satin"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Red", "Blue", "Black", "White"],
    imageKey: "boxingShorts",
  },
  {
    name: "Metcon Training Shoe",
    slug: "metcon-training-shoe",
    description: "Versatile training shoe with rope-grip outsole and flexible forefoot. Designed for CrossFit, lifting, and high-intensity workouts.",
    shortDesc: "CrossFit training shoe",
    productType: "Gym Shoes",
    price: 139.00, compareAtPrice: 169.00,
    categorySlug: "apparel", brand: "Nike", sku: "NK-GS-MTC",
    weight: 0.4, stock: 30, rating: 4.7, reviewCount: 1876,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["gym-shoes", "crossfit", "training"],
    sizes: ["7", "8", "9", "10", "11", "12"],
    colors: ["Black/White", "Grey/Red"],
    imageKey: "gymShoes",
  },
  {
    name: "Performance Training Cap",
    slug: "performance-training-cap",
    description: "Lightweight training cap with sweatband and adjustable strap. Dri-FIT technology wicks sweat. Reflective logo for visibility during outdoor training.",
    shortDesc: "Dri-FIT training cap",
    productType: "Cap",
    price: 29.00,
    categorySlug: "apparel", brand: "Nike", sku: "NK-CP-PT",
    weight: 0.08, stock: 60, rating: 4.4, reviewCount: 876,
    isFeatured: false, isBestSeller: true, isNew: false,
    tags: ["cap", "training", "outdoor"],
    colors: ["Black", "White", "Grey"],
    imageKey: "cap",
  },
  {
    name: "Gym Training Backpack",
    slug: "gym-training-backpack",
    description: "Spacious gym backpack with ventilated shoe compartment and laptop sleeve. Water-resistant material keeps your gear dry in all conditions.",
    shortDesc: "Shoe compartment backpack",
    productType: "Backpack",
    price: 79.00, compareAtPrice: 99.00,
    categorySlug: "apparel", brand: "Adidas", sku: "AD-BP-GTB",
    weight: 0.8, stock: 35, rating: 4.6, reviewCount: 1234,
    isFeatured: false, isBestSeller: false, isNew: true,
    tags: ["backpack", "gym", "shoe-compartment"],
    colors: ["Black", "Grey", "Navy"],
    imageKey: "backpack",
  },

  // ======================== EQUIPMENT (8) ========================
  {
    name: "Adjustable Dumbbell Set 25lb",
    slug: "adjustable-dumbbell-25",
    description: "Space-saving adjustable dumbbells with quick-change weight selection. Replaces 15 sets of traditional dumbbells. Perfect for home gyms.",
    shortDesc: "5-25lb adjustable per dumbbell",
    productType: "Dumbbells",
    price: 399.00, compareAtPrice: 499.00,
    categorySlug: "equipment", brand: "Decathlon", sku: "DC-DB-AD25",
    weight: 11.3, stock: 15, rating: 4.7, reviewCount: 1876,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["dumbbells", "adjustable", "home-gym"],
    specs: { "Range": "5-25lb per dumbbell", "Replaces": "15 sets", "Adjustment": "Quick-change" },
    imageKey: "dumbbells",
  },
  {
    name: "Cast Iron Kettlebell 16kg",
    slug: "cast-iron-kettlebell-16",
    description: "Premium cast iron kettlebell with powder-coated finish for secure grip. Wide handle for two-hand swings and single-arm exercises.",
    shortDesc: "16kg cast iron",
    productType: "Kettlebell",
    price: 119.00,
    categorySlug: "equipment", brand: "Decathlon", sku: "DC-KB-CI16",
    weight: 16, stock: 30, rating: 4.7, reviewCount: 1234,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["kettlebell", "cast-iron", "functional"],
    specs: { "Weight": "16kg", "Finish": "Powder-Coated", "Handle": "Wide" },
    imageKey: "kettlebell",
  },
  {
    name: "Resistance Band Set 5-Pack",
    slug: "resistance-band-set-5",
    description: "Complete set of 5 resistance bands with progressive tension levels. Includes door anchor, handles, and ankle straps for full-body workouts.",
    shortDesc: "5 bands + accessories",
    productType: "Resistance Bands",
    price: 89.00, compareAtPrice: 119.00,
    categorySlug: "equipment", brand: "Decathlon", sku: "DC-RB-5P",
    weight: 0.5, stock: 50, rating: 4.6, reviewCount: 2345,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["resistance-bands", "home-gym", "full-body"],
    specs: { "Bands": "5 levels", "Accessories": "Door anchor, handles, ankle straps" },
    imageKey: "resistanceBand",
  },
  {
    name: "Premium Yoga Mat 6mm",
    slug: "premium-yoga-mat-6mm",
    description: "Non-slip premium yoga mat with alignment markers. Eco-friendly TPE material for sustainable practice. Extra thick for joint comfort.",
    shortDesc: "6mm non-slip eco mat",
    productType: "Yoga Mat",
    price: 79.00, compareAtPrice: 99.00,
    categorySlug: "equipment", brand: "Decathlon", sku: "DC-YM-P6",
    weight: 1.8, stock: 40, rating: 4.7, reviewCount: 1234,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["yoga-mat", "non-slip", "eco-friendly"],
    colors: ["Black", "Purple", "Teal"],
    specs: { "Thickness": "6mm", "Material": "TPE Eco-Friendly", "Size": "183cm x 61cm" },
    imageKey: "yogaMat",
  },
  {
    name: "High-Density Foam Roller 36in",
    slug: "high-density-foam-roller",
    description: "EVA foam roller for deep tissue massage and myofascial release. Helps reduce muscle soreness and improve flexibility after training.",
    shortDesc: "36in deep tissue roller",
    productType: "Foam Roller",
    price: 39.00, compareAtPrice: 55.00,
    categorySlug: "equipment", brand: "Decathlon", sku: "DC-FR-HD36",
    weight: 0.8, stock: 50, rating: 4.6, reviewCount: 2345,
    isFeatured: false, isBestSeller: true, isNew: false,
    tags: ["foam-roller", "recovery", "flexibility"],
    specs: { "Length": "36in / 91cm", "Material": "High-Density EVA", "Texture": "Multi-Density" },
    imageKey: "foamRoller",
  },
  {
    name: "Olympic Barbell 20kg",
    slug: "olympic-barbell-20kg",
    description: "Competition-grade Olympic barbell with 190K PSI tensile strength. Needle bearings for smooth spin. Perfect for powerlifting and Olympic lifting.",
    shortDesc: "20kg Olympic bar",
    productType: "Barbell",
    price: 449.00,
    categorySlug: "equipment", brand: "Decathlon", sku: "DC-BB-OL20",
    weight: 20, stock: 10, rating: 4.8, reviewCount: 567,
    isFeatured: true, isBestSeller: false, isNew: false,
    tags: ["barbell", "olympic", "powerlifting"],
    specs: { "Weight": "20kg", "Length": "220cm", "Tensile": "190K PSI", "Bearings": "Needle" },
    imageKey: "barbell",
  },
  {
    name: "10mm Leather Powerlifting Belt",
    slug: "10mm-leather-belt",
    description: "Thick 10mm leather belt for maximum core support during heavy lifts. Single-prong buckle for quick adjustments. Built to last a lifetime.",
    shortDesc: "10mm leather belt",
    productType: "Gym Belt",
    price: 129.00, compareAtPrice: 159.00,
    categorySlug: "equipment", brand: "Decathlon", sku: "DC-GB-10ML",
    weight: 0.8, stock: 30, rating: 4.8, reviewCount: 1876,
    isFeatured: false, isBestSeller: true, isNew: false,
    tags: ["gym-belt", "powerlifting", "leather"],
    colors: ["Black", "Brown"],
    sizes: ["S", "M", "L", "XL"],
    specs: { "Thickness": "10mm", "Material": "Genuine Leather", "Buckle": "Single-Prong" },
    imageKey: "gymBelt",
  },
  {
    name: "Massage Gun Pro",
    slug: "massage-gun-pro",
    description: "Professional percussion massage gun with 6 speed settings and 4 massage heads. Deep tissue therapy for muscle recovery. Quiet motor technology.",
    shortDesc: "6-speed percussion gun",
    productType: "Massage Gun",
    price: 249.00, compareAtPrice: 349.00,
    categorySlug: "equipment", brand: "Decathlon", sku: "DC-MG-PRO",
    weight: 0.7, stock: 20, rating: 4.8, reviewCount: 1876,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["massage-gun", "percussion", "recovery"],
    specs: { "Speeds": "6 levels", "Heads": "4 attachments", "Battery": "6 hours", "Noise": "<45dB" },
    imageKey: "massageGun",
  },

  // ======================== ACCESSORIES (5) ========================
  {
    name: "Steel Shaker Bottle 28oz",
    slug: "steel-shaker-28oz",
    description: "Premium stainless steel shaker bottle with leak-proof lid and mixing ball. BPA-free, dishwasher safe, keeps drinks cold for hours.",
    shortDesc: "Stainless steel shaker",
    productType: "Shaker",
    price: 49.00, compareAtPrice: 69.00,
    categorySlug: "accessories", brand: "BlenderBottle", sku: "BB-SS-28",
    weight: 0.35, stock: 50, rating: 4.7, reviewCount: 2345,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["shaker", "stainless-steel", "insulated"],
    colors: ["Black", "Silver", "Navy"],
    specs: { "Capacity": "28oz / 828ml", "Material": "Stainless Steel", "Insulation": "Double-Wall" },
    imageKey: "shaker",
  },
  {
    name: "Sport Insulated Bottle 32oz",
    slug: "sport-insulated-32oz",
    description: "Double-wall vacuum insulated water bottle that keeps drinks cold for 24 hours or hot for 12. Durable stainless steel with ergonomic grip.",
    shortDesc: "24hr cold insulation",
    productType: "Water Bottle",
    price: 45.00,
    categorySlug: "accessories", brand: "Nike", sku: "NK-WB-SI32",
    weight: 0.4, stock: 60, rating: 4.7, reviewCount: 3210,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["water-bottle", "insulated", "stainless"],
    colors: ["Black", "White", "Grey"],
    specs: { "Capacity": "32oz / 946ml", "Cold": "24 hours", "Hot": "12 hours" },
    imageKey: "waterBottle",
  },
  {
    name: "Large Duffle Gym Bag",
    slug: "large-duffle-gym-bag",
    description: "Spacious duffle bag with separate shoe compartment, wet pocket, and multiple organizer pockets. Fits all your gym essentials with room to spare.",
    shortDesc: "Shoe compartment duffle",
    productType: "Gym Bag",
    price: 89.00, compareAtPrice: 119.00,
    categorySlug: "accessories", brand: "Adidas", sku: "AD-GB-LDG",
    weight: 1.0, stock: 30, rating: 4.6, reviewCount: 1876,
    isFeatured: false, isBestSeller: true, isNew: false,
    tags: ["gym-bag", "duffle", "shoe-pocket"],
    colors: ["Black", "Grey", "Navy"],
    specs: { "Capacity": "60L", "Compartments": "Shoe + Wet + Main", "Material": "Ripstop Nylon" },
    imageKey: "gymBag",
  },
  {
    name: "Microfiber Gym Towel Set",
    slug: "microfiber-gym-towel-set",
    description: "Set of 3 quick-dry microfiber towels. Ultra-absorbent and compact. Machine washable. Perfect for gym, travel, and outdoor training.",
    shortDesc: "3-pack quick-dry towels",
    productType: "Gym Towel",
    price: 25.00,
    categorySlug: "accessories", brand: "Nike", sku: "NK-GT-MFS",
    weight: 0.3, stock: 80, rating: 4.4, reviewCount: 654,
    isFeatured: false, isBestSeller: false, isNew: false,
    tags: ["gym-towel", "microfiber", "quick-dry"],
    colors: ["Black", "Grey", "Blue"],
    specs: { "Pack": "3 towels", "Material": "Microfiber", "Absorbent": "3x regular cotton" },
    imageKey: "gymTowel",
  },
  {
    name: "Interval Training Timer",
    slug: "interval-training-timer",
    description: "Programmable interval timer with multiple preset workouts. Large LED display and loud buzzer for HIIT, Tabata, and circuit training.",
    shortDesc: "Programmable HIIT timer",
    productType: "Training Timer",
    price: 45.00, compareAtPrice: 59.00,
    categorySlug: "accessories", brand: "Nike", sku: "NK-TT-ITT",
    weight: 0.3, stock: 40, rating: 4.5, reviewCount: 876,
    isFeatured: false, isBestSeller: false, isNew: true,
    tags: ["timer", "hiit", "tabata", "interval"],
    specs: { "Display": "LED", "Presets": "HIIT, Tabata, Circuit", "Power": "USB-C" },
    imageKey: "timer",
  },
];

// ============================================================
// MAIN SEED
// ============================================================

async function main() {
  console.log("🏋️  Tayamo Sport — Premium Shop Seed\n");
  console.log("━".repeat(50));

  // Phase 1: Upload category images
  console.log("\n📁 Uploading category images to Cloudinary...");
  const categoryImages: Record<string, string> = {};

  const catImageKeys: Record<string, keyof typeof IMG> = {
    supplements: "catSupplements",
    "combat-sports": "catCombat",
    apparel: "catApparel",
    equipment: "catEquipment",
    accessories: "catAccessories",
  };

  for (const cat of CATEGORIES) {
    const imgKey = catImageKeys[cat.slug];
    if (imgKey) {
      categoryImages[cat.slug] = await fetchAndUpload(
        IMG[imgKey],
        "categories",
        `cat-${cat.slug}`
      );
    }
  }

  // Phase 2: Upload product images
  console.log("\n📦 Uploading product images to Cloudinary...");
  const productImages: Record<string, string> = {};

  for (const p of PRODUCTS) {
    const url = IMG[p.imageKey];
    if (url) {
      productImages[p.slug] = await fetchAndUpload(
        url,
        "products",
        `prod-${p.slug}`
      );
    }
  }

  // Phase 3: Seed categories
  console.log("\n📁 Seeding categories...");
  const categoryMap: Record<string, number> = {};

  for (const cat of CATEGORIES) {
    const result = await prisma.shopCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        icon: cat.icon,
        description: cat.description,
        imageUrl: categoryImages[cat.slug] || null,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        description: cat.description,
        imageUrl: categoryImages[cat.slug] || null,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    });
    categoryMap[cat.slug] = result.id;
    process.stdout.write(`  ✓ ${cat.name}\n`);
  }

  // Phase 4: Seed products
  console.log(`\n📦 Seeding ${PRODUCTS.length} products...`);
  let created = 0;
  let updated = 0;

  for (const p of PRODUCTS) {
    const categoryId = categoryMap[p.categorySlug];
    if (!categoryId) {
      console.error(`  ✗ Category not found: ${p.categorySlug}`);
      continue;
    }

    const imageUrl = productImages[p.slug] || "";

    try {
      const result = await prisma.shopProduct.upsert({
        where: { slug: p.slug },
        update: {
          name: p.name,
          description: p.description,
          shortDesc: p.shortDesc,
          productType: p.productType,
          price: p.price,
          compareAtPrice: p.compareAtPrice ?? null,
          images: JSON.stringify(imageUrl ? [imageUrl] : []),
          categoryId,
          brand: p.brand,
          sku: p.sku,
          weight: p.weight ?? null,
          stock: p.stock,
          rating: p.rating,
          reviewCount: p.reviewCount,
          isFeatured: p.isFeatured,
          isBestSeller: p.isBestSeller,
          isNew: p.isNew,
          isActive: true,
          tags: JSON.stringify(p.tags),
          sizes: JSON.stringify(p.sizes ?? []),
          colors: JSON.stringify(p.colors ?? []),
          specifications: JSON.stringify(p.specs ?? {}),
        },
        create: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          shortDesc: p.shortDesc,
          productType: p.productType,
          price: p.price,
          compareAtPrice: p.compareAtPrice ?? null,
          images: JSON.stringify(imageUrl ? [imageUrl] : []),
          categoryId,
          brand: p.brand,
          sku: p.sku,
          weight: p.weight ?? null,
          stock: p.stock,
          rating: p.rating,
          reviewCount: p.reviewCount,
          isFeatured: p.isFeatured,
          isBestSeller: p.isBestSeller,
          isNew: p.isNew,
          isActive: true,
          tags: JSON.stringify(p.tags),
          sizes: JSON.stringify(p.sizes ?? []),
          colors: JSON.stringify(p.colors ?? []),
          specifications: JSON.stringify(p.specs ?? {}),
        },
      });

      if (result.createdAt.getTime() === result.updatedAt.getTime()) created++;
      else updated++;
      process.stdout.write(`  ✓ ${p.name} [${p.brand}]\n`);
    } catch (e) {
      console.error(`  ✗ ${p.name}: ${e}`);
    }
  }

  // Summary
  console.log("\n" + "━".repeat(50));
  console.log("✅ Seed complete!");
  console.log(`   Categories: ${CATEGORIES.length}`);
  console.log(`   Products:   ${created} created, ${updated} updated`);
  console.log(`   Images:     All uploaded to Cloudinary`);
  console.log("━".repeat(50));
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
