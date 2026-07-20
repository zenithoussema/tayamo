/**
 * Tayamo Sport — Premium Sports Nutrition Store v3
 *
 * Cleans ALL shop data and reseeds with:
 * - 8 categories (Whey Protein, Whey Isolate, Hydrolyzed Whey, Mass Gainer, Creatine, Pre Workout, Keto Snacks, Combat Gear)
 * - 25 products from real brands
 *
 * Usage: npx tsx prisma/seed-supplements-v3.ts
 */

import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import https from "https";
import http from "http";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ============================================================
// STEP 1: CLEAN DATABASE
// ============================================================

async function cleanDatabase() {
  process.stdout.write("\n  Cleaning database...\n");
  await prisma.shopReview.deleteMany();
  await prisma.shopOrderItem.deleteMany();
  await prisma.shopOrder.deleteMany();
  await prisma.shopProduct.deleteMany();
  await prisma.shopCategory.deleteMany();
  process.stdout.write("  All shop data deleted.\n");
}

// ============================================================
// STEP 2: CATEGORIES
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
// STEP 3: PRODUCTS
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
  imageUrl: string;
};

const PRODUCTS: ProductDef[] = [
  // ======================== WHEY PROTEIN (5) ========================
  {
    name: "Optimum Nutrition Gold Standard 100% Whey",
    slug: "optimum-nutrition-gold-standard-whey",
    description: "The world's best-selling whey protein with 24g of pure whey protein per serving. Contains 5.5g of naturally occurring BCAAs and 4g of glutamine. Trusted by athletes for over 30 years. Ideal for muscle recovery and lean muscle growth.",
    shortDesc: "24g protein per serving | 5.5g BCAAs",
    productType: "Whey Protein",
    price: 289.00, compareAtPrice: 349.00,
    categorySlug: "whey-protein", brand: "Optimum Nutrition", sku: "ON-GSW-2.27",
    weight: 2.27, stock: 45, rating: 4.8, reviewCount: 2341,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["whey", "protein", "gold-standard", "best-seller"],
    colors: ["Double Rich Chocolate", "Vanilla Ice Cream", "Strawberry Cream"],
    specs: { "Protein": "24g", "BCAAs": "5.5g", "Servings": "29", "Sugar": "1g" },
    imageUrl: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&h=600&fit=crop",
  },
  {
    name: "Dymatize Elite Whey Protein",
    slug: "dymatize-elite-whey",
    description: "Premium whey protein blend with 25g of protein per serving. Features a blend of whey concentrate and isolate for sustained amino acid delivery. Great taste and mixability.",
    shortDesc: "25g protein blend | Great taste",
    productType: "Whey Protein",
    price: 249.00,
    categorySlug: "whey-protein", brand: "Dymatize", sku: "DYM-EW-2.27",
    weight: 2.27, stock: 35, rating: 4.6, reviewCount: 1567,
    isFeatured: false, isBestSeller: true, isNew: false,
    tags: ["whey", "protein", "blend", "elite"],
    colors: ["Rich Chocolate", "Vanilla Bean"],
    specs: { "Protein": "25g", "BCAAs": "5.5g", "Servings": "32" },
    imageUrl: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&h=600&fit=crop",
  },
  {
    name: "MyProtein Impact Whey Protein",
    slug: "myprotein-impact-whey",
    description: "Award-winning whey protein concentrate with 21g of protein per serving. Informed Sport certified. Over 40 flavours available. The best value whey protein on the market.",
    shortDesc: "21g protein | Informed Sport certified",
    productType: "Whey Protein",
    price: 189.00, compareAtPrice: 229.00,
    categorySlug: "whey-protein", brand: "MyProtein", sku: "MP-IWP-2.5",
    weight: 2.5, stock: 60, rating: 4.5, reviewCount: 3210,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["whey", "protein", "value", "informed-sport"],
    colors: ["Chocolate", "Strawberry Cream", "Banana"],
    specs: { "Protein": "21g", "BCAAs": "4.5g", "Servings": "50" },
    imageUrl: "https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600&h=600&fit=crop",
  },
  {
    name: "Rule 1 R1 Whey Blend",
    slug: "rule1-r1-whey-blend",
    description: "High-quality whey protein blend with fast-acting whey isolate as the primary source. 24g of protein per scoop with a delicious taste. Perfect for any time of day.",
    shortDesc: "24g protein | Isolate-first blend",
    productType: "Whey Protein",
    price: 259.00,
    categorySlug: "whey-protein", brand: "Rule 1", sku: "R1-RWB-2.27",
    weight: 2.27, stock: 35, rating: 4.6, reviewCount: 876,
    isFeatured: false, isBestSeller: false, isNew: false,
    tags: ["whey", "protein", "blend", "rule1"],
    colors: ["Chocolate Fudge", "Vanilla Cream"],
    specs: { "Protein": "24g", "BCAAs": "5g", "Servings": "30" },
    imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop",
  },
  {
    name: "Isopure Zero Carb Whey Protein",
    slug: "isopure-zero-carb-whey",
    description: "100% whey protein isolate with zero carbs. Perfect for low-carb and ketogenic diets. 25g of pure protein per serving with added vitamins and minerals.",
    shortDesc: "Zero carb | 25g protein",
    productType: "Whey Protein",
    price: 329.00,
    categorySlug: "whey-protein", brand: "Isopure", sku: "IS-ZC-2.27",
    weight: 2.27, stock: 20, rating: 4.5, reviewCount: 876,
    isFeatured: false, isBestSeller: false, isNew: false,
    tags: ["whey", "zero-carb", "keto", "isolate"],
    colors: ["Creamy Vanilla", "Dutch Chocolate"],
    specs: { "Protein": "25g", "Carbs": "0g", "Sugar": "0g", "Servings": "29" },
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=600&fit=crop",
  },

  // ======================== WHEY ISOLATE (3) ========================
  {
    name: "Optimum Nutrition Gold Standard Isolate",
    slug: "on-gold-standard-isolate",
    description: "Pure whey protein isolate with 25g of protein and less than 1g of sugar per serving. Micro-filtered for maximum purity. The cleanest protein from ON.",
    shortDesc: "25g isolate | Less than 1g sugar",
    productType: "Whey Isolate",
    price: 349.00, compareAtPrice: 399.00,
    categorySlug: "whey-isolate", brand: "Optimum Nutrition", sku: "ON-GSI-1.36",
    weight: 1.36, stock: 30, rating: 4.7, reviewCount: 1234,
    isFeatured: true, isBestSeller: false, isNew: false,
    tags: ["isolate", "whey", "pure", "low-sugar"],
    colors: ["Chocolate Bliss", "Vanilla"],
    specs: { "Protein": "25g", "Sugar": "<1g", "Fat": "0.5g", "Servings": "31" },
    imageUrl: "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=600&h=600&fit=crop",
  },
  {
    name: "Dymatize ISO100 Hydrolyzed",
    slug: "dymatize-iso100-hydrolyzed",
    description: "100% hydrolyzed whey protein isolate filtered for maximum purity. Zero sugar, zero fat, and fast-absorbing for rapid post-workout recovery. The cleanest protein for serious athletes.",
    shortDesc: "Hydrolyzed isolate | Zero sugar & fat",
    productType: "Whey Isolate",
    price: 379.00, compareAtPrice: 429.00,
    categorySlug: "whey-isolate", brand: "Dymatize", sku: "DYM-ISO-2.27",
    weight: 2.27, stock: 25, rating: 4.7, reviewCount: 1567,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["isolate", "hydrolyzed", "zero-sugar", "premium"],
    colors: ["Gourmet Chocolate", "Birthday Cake"],
    specs: { "Protein": "25g", "Sugar": "0g", "Fat": "0g", "Servings": "28" },
    imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop&q=80",
  },
  {
    name: "Isopure Low Carb Protein",
    slug: "isopure-low-carb-protein",
    description: "100% whey protein isolate with only 3g net carbs per serving. Packed with 25g of protein and essential vitamins. Ideal for cutting phases and low-carb diets.",
    shortDesc: "25g isolate | 3g net carbs",
    productType: "Whey Isolate",
    price: 319.00,
    categorySlug: "whey-isolate", brand: "Isopure", sku: "IS-LC-3.18",
    weight: 3.18, stock: 20, rating: 4.5, reviewCount: 654,
    isFeatured: false, isBestSeller: false, isNew: true,
    tags: ["isolate", "low-carb", "cutting", "vitamins"],
    colors: ["Creamy Vanilla", "Apple Melon"],
    specs: { "Protein": "25g", "Net Carbs": "3g", "Vitamins": "21", "Servings": "44" },
    imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop",
  },

  // ======================== HYDROLYZED WHEY (2) ========================
  {
    name: "Optimum Nutrition Platinum Hydrowhey",
    slug: "on-platinum-hydrowhey",
    description: "Advanced hydrolyzed whey protein isolate with micronized peptides for ultra-fast absorption. 30g of protein per serving with minimal fat and carbs. Designed for serious athletes.",
    shortDesc: "30g hydrolyzed peptides | Ultra-fast",
    productType: "Hydrolyzed Whey",
    price: 399.00, compareAtPrice: 449.00,
    categorySlug: "hydrolyzed-whey", brand: "Optimum Nutrition", sku: "ON-PH-1.59",
    weight: 1.59, stock: 25, rating: 4.6, reviewCount: 987,
    isFeatured: true, isBestSeller: false, isNew: false,
    tags: ["hydrolyzed", "peptides", "fast-absorbing", "premium"],
    colors: ["Chocolate Supreme", "Vanilla Ice"],
    specs: { "Protein": "30g", "Fat": "1g", "Sugar": "0g", "Servings": "22" },
    imageUrl: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&h=600&fit=crop&q=85",
  },
  {
    name: "Dymatize ISO100 Hydrolyzed Gourmet Chocolate",
    slug: "dymatize-iso100-gourmet-chocolate",
    description: "The legendary ISO100 in gourmet chocolate flavour. Hydrolyzed whey isolate with 25g protein, zero sugar, and incredible taste. Fast-absorbing and easy to digest.",
    shortDesc: "Gourmet Chocolate | 25g isolate",
    productType: "Hydrolyzed Whey",
    price: 369.00,
    categorySlug: "hydrolyzed-whey", brand: "Dymatize", sku: "DYM-ISO100-GC",
    weight: 2.27, stock: 20, rating: 4.7, reviewCount: 1089,
    isFeatured: false, isBestSeller: true, isNew: false,
    tags: ["hydrolyzed", "chocolate", "gourmet", "iso100"],
    colors: ["Gourmet Chocolate"],
    specs: { "Protein": "25g", "Sugar": "0g", "Fat": "0g", "Servings": "28" },
    imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop&q=90",
  },

  // ======================== MASS GAINER (4) ========================
  {
    name: "Optimum Nutrition Serious Mass",
    slug: "on-serious-mass",
    description: "High-calorie weight gainer with 1250 calories and 50g of protein per serving. For hardgainers who need extra calories to build mass. Added glutamine and creatine.",
    shortDesc: "1250 cal | 50g protein",
    productType: "Mass Gainer",
    price: 269.00, compareAtPrice: 319.00,
    categorySlug: "mass-gainer", brand: "Optimum Nutrition", sku: "ON-SM-5.44",
    weight: 5.44, stock: 25, rating: 4.5, reviewCount: 1876,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["mass", "gainer", "calories", "weight-gain"],
    colors: ["Chocolate", "Vanilla"],
    specs: { "Calories": "1250", "Protein": "50g", "Carbs": "252g" },
    imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=600&fit=crop",
  },
  {
    name: "MuscleTech Mass Tech Elite",
    slug: "muscletech-mass-tech-elite",
    description: "Advanced mass gainer with 1000 calories, 80g of multi-source protein, and added creatine for maximum muscle building. Enhanced with MCTs for sustained energy.",
    shortDesc: "1000 cal | 80g protein | Creatine",
    productType: "Mass Gainer",
    price: 349.00, compareAtPrice: 399.00,
    categorySlug: "mass-gainer", brand: "MuscleTech", sku: "MT-MTE-6.8",
    weight: 6.8, stock: 15, rating: 4.4, reviewCount: 654,
    isFeatured: false, isBestSeller: false, isNew: false,
    tags: ["mass", "gainer", "creatine", "mct"],
    colors: ["Chocolate", "Vanilla"],
    specs: { "Calories": "1000", "Protein": "80g", "Creatine": "10g" },
    imageUrl: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&h=600&fit=crop&q=70",
  },
  {
    name: "BSN True Mass",
    slug: "bsn-true-mass",
    description: "Premium mass gainer with 1230 calories, 50g of multi-source protein, and MCTs for sustained energy. BSN's flagship weight gainer for serious athletes.",
    shortDesc: "1230 cal | Multi-source protein",
    productType: "Mass Gainer",
    price: 299.00,
    categorySlug: "mass-gainer", brand: "BSN", sku: "BSN-TM-5.84",
    weight: 5.84, stock: 20, rating: 4.5, reviewCount: 987,
    isFeatured: false, isBestSeller: true, isNew: false,
    tags: ["mass", "gainer", "multi-source", "mct"],
    colors: ["Chocolate Milkshake", "Vanilla Ice Cream"],
    specs: { "Calories": "1230", "Protein": "50g", "Carbs": "215g" },
    imageUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=600&fit=crop",
  },
  {
    name: "Mutant Mass",
    slug: "mutant-mass",
    description: "Extreme mass gainer with 1060 calories and 56g of protein per serving. Built for true hardgainers. Features a 10-source protein blend with complex carbs.",
    shortDesc: "1060 cal | 10-source protein blend",
    productType: "Mass Gainer",
    price: 329.00,
    categorySlug: "mass-gainer", brand: "Mutant", sku: "MU-MM-6.8",
    weight: 6.8, stock: 15, rating: 4.3, reviewCount: 432,
    isFeatured: false, isBestSeller: false, isNew: true,
    tags: ["mass", "gainer", "extreme", "hardgainer"],
    colors: ["Chocolate", "Vanilla"],
    specs: { "Calories": "1060", "Protein": "56g", "Sources": "10" },
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop",
  },

  // ======================== CREATINE (4) ========================
  {
    name: "Optimum Nutrition Micronized Creatine",
    slug: "on-micronized-creatine",
    description: "Pure micronized creatine monohydrate for increased strength, power, and muscle endurance. The most researched supplement in sports nutrition history.",
    shortDesc: "5g pure creatine | 120 servings",
    productType: "Creatine",
    price: 89.00, compareAtPrice: 119.00,
    categorySlug: "creatine", brand: "Optimum Nutrition", sku: "ON-CR-600",
    weight: 0.63, stock: 80, rating: 4.7, reviewCount: 3456,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["creatine", "strength", "power", "micronized"],
    specs: { "Creatine": "5g per serving", "Servings": "120" },
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop&q=80",
  },
  {
    name: "Creapure Creatine Monohydrate",
    slug: "creapure-creatine-monohydrate",
    description: "Pure Creapure creatine monohydrate from Germany. The highest quality creatine available. Unflavored, micronized, and lab-tested for purity.",
    shortDesc: "German Creapure | Lab-tested",
    productType: "Creatine",
    price: 119.00,
    categorySlug: "creatine", brand: "Creapure", sku: "CP-CM-1",
    weight: 1.0, stock: 50, rating: 4.6, reviewCount: 1234,
    isFeatured: true, isBestSeller: false, isNew: false,
    tags: ["creatine", "creapure", "pure", "german"],
    specs: { "Creatine": "5g", "Source": "Creapure", "Servings": "200" },
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop",
  },
  {
    name: "MyProtein Creatine Monohydrate",
    slug: "myprotein-creatine-monohydrate",
    description: "Pure creatine monohydrate powder. Lab-tested for purity. Unflavored and micronized for easy mixing. Enhances strength and power output during high-intensity training.",
    shortDesc: "Pure creatine | Unflavored | Lab-tested",
    productType: "Creatine",
    price: 69.00, compareAtPrice: 89.00,
    categorySlug: "creatine", brand: "MyProtein", sku: "MP-CM-1",
    weight: 1.0, stock: 70, rating: 4.5, reviewCount: 2345,
    isFeatured: false, isBestSeller: true, isNew: false,
    tags: ["creatine", "pure", "value", "lab-tested"],
    specs: { "Creatine": "5g", "Servings": "200" },
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&h=600&fit=crop",
  },
  {
    name: "Dymatize Creatine Monohydrate",
    slug: "dymatize-creatine",
    description: "Micronized creatine monohydrate for increased muscle strength and power. Pure, unflavored, and easily mixes into any beverage. HPLC tested for purity.",
    shortDesc: "Micronized | HPLC tested",
    productType: "Creatine",
    price: 79.00,
    categorySlug: "creatine", brand: "Dymatize", sku: "DYM-CM-454",
    weight: 0.45, stock: 40, rating: 4.5, reviewCount: 654,
    isFeatured: false, isBestSeller: false, isNew: false,
    tags: ["creatine", "micronized", "hplc", "pure"],
    specs: { "Creatine": "5g", "HPLC": "Tested", "Servings": "90" },
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop",
  },

  // ======================== PRE WORKOUT (3) ========================
  {
    name: "Cellucor C4 Original Pre Workout",
    slug: "cellucor-c4-original",
    description: "America's #1 pre-workout with explosive energy, focus, and endurance. Features CarnoSyn beta-alanine and caffeine for maximum performance.",
    shortDesc: "150mg caffeine | Explosive energy",
    productType: "Pre Workout",
    price: 149.00, compareAtPrice: 179.00,
    categorySlug: "pre-workout", brand: "Cellucor", sku: "CC-C4-30",
    weight: 0.27, stock: 55, rating: 4.5, reviewCount: 3210,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["pre-workout", "energy", "focus", "caffeine"],
    colors: ["Fruit Punch", "Blue Raspberry", "Watermelon"],
    specs: { "Caffeine": "150mg", "Beta-Alanine": "1.6g", "Servings": "30" },
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop&q=90",
  },
  {
    name: "Ghost Legend Pre Workout",
    slug: "ghost-legend-preworkout",
    description: "Premium pre-workout with AlphaSize, S7, and NeuroFactor for energy, pumps, and focus. Full transparency and amazing flavours.",
    shortDesc: "250mg caffeine | Energy + Pumps + Focus",
    productType: "Pre Workout",
    price: 169.00,
    categorySlug: "pre-workout", brand: "Ghost", sku: "GH-LEG-30",
    weight: 0.3, stock: 25, rating: 4.6, reviewCount: 876,
    isFeatured: false, isBestSeller: true, isNew: true,
    tags: ["pre-workout", "pumps", "focus", "premium"],
    colors: ["Sour Keys", "Warheads Watermelon"],
    specs: { "Caffeine": "250mg", "AlphaSize": "300mg", "Servings": "30" },
    imageUrl: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&h=600&fit=crop",
  },
  {
    name: "Pre JYM",
    slug: "pre-jym",
    description: "Science-backed pre-workout with 13 active ingredients at clinically effective doses. Transparent label with no proprietary blends. Created by Dr. Jim Stoppani.",
    shortDesc: "13 ingredients | No proprietary blends",
    productType: "Pre Workout",
    price: 179.00, compareAtPrice: 209.00,
    categorySlug: "pre-workout", brand: "JYM Supplement Science", sku: "JYM-Pre-30",
    weight: 0.35, stock: 30, rating: 4.7, reviewCount: 987,
    isFeatured: true, isBestSeller: false, isNew: false,
    tags: ["pre-workout", "transparent", "clinical", "science"],
    colors: ["Blue Raspberry", "Orange Mango"],
    specs: { "Caffeine": "300mg", "Beta-Alanine": "3.2g", "Creatine": "5g" },
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop",
  },

  // ======================== KETO SNACKS (2) ========================
  {
    name: "Quest Protein Bar",
    slug: "quest-protein-bar",
    description: "High-fiber, low-sugar protein bar with 21g of protein and only 1g of sugar. Perfect meal replacement or post-workout snack. Tastes like a candy bar.",
    shortDesc: "21g protein | 1g sugar | 14g fiber",
    productType: "Keto Snack",
    price: 129.00,
    categorySlug: "keto-snacks", brand: "Quest Nutrition", sku: "QN-PB-12",
    weight: 0.7, stock: 80, rating: 4.6, reviewCount: 3456,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["protein-bar", "keto", "low-sugar", "fiber"],
    colors: ["Chocolate Chip", "Peanut Butter", "Cookies & Cream"],
    specs: { "Protein": "21g", "Sugar": "1g", "Fiber": "14g" },
    imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&h=600&fit=crop",
  },
  {
    name: "Grenade Protein Bar",
    slug: "grenade-protein-bar",
    description: "Ultra-low sugar protein bar with 22g of protein and crispy texture. Triple-layered for maximum taste. Less than 1g of sugar per bar.",
    shortDesc: "22g protein | Triple-layered | <1g sugar",
    productType: "Keto Snack",
    price: 139.00, compareAtPrice: 159.00,
    categorySlug: "keto-snacks", brand: "Grenade", sku: "GR-CK-12",
    weight: 0.72, stock: 60, rating: 4.7, reviewCount: 1876,
    isFeatured: true, isBestSeller: false, isNew: false,
    tags: ["protein-bar", "low-sugar", "triple-layer", "crispy"],
    colors: ["Fudge Brownie", "White Chocolate Cookie", "Salted Caramel"],
    specs: { "Protein": "22g", "Sugar": "<1g", "Calories": "216" },
    imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&h=600&fit=crop&q=80",
  },

  // ======================== COMBAT GEAR (2) ========================
  {
    name: "Venum Challenger Boxing Gloves",
    slug: "venum-challenger-boxing-gloves",
    description: "Premium synthetic leather boxing gloves with multi-density foam padding. Suitable for training and sparring. Secure velcro closure with breathable lining.",
    shortDesc: "Synthetic leather | Multi-density foam",
    productType: "Boxing Gloves",
    price: 159.00, compareAtPrice: 199.00,
    categorySlug: "combat-gear", brand: "Venum", sku: "VN-CH-BG",
    weight: 0.9, stock: 30, rating: 4.6, reviewCount: 876,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["boxing", "gloves", "training", "sparring"],
    colors: ["Black/Red", "All Black", "Green/Black"],
    sizes: ["10oz", "12oz", "14oz", "16oz"],
    specs: { "Material": "Synthetic Leather", "Padding": "Multi-Density Foam", "Closure": "Velcro" },
    imageUrl: "https://images.unsplash.com/photo-1517438322307-e67111335449?w=600&h=600&fit=crop",
  },
  {
    name: "Everlast Pro Boxing Gloves",
    slug: "everlast-pro-boxing-gloves",
    description: "Professional-grade boxing gloves with EverCool ventilation technology. Premium leather construction with dense foam padding. Designed for all levels of boxing training.",
    shortDesc: "Premium leather | EverCool ventilation",
    productType: "Boxing Gloves",
    price: 139.00,
    categorySlug: "combat-gear", brand: "Everlast", sku: "EV-PRO-BG",
    weight: 0.85, stock: 25, rating: 4.4, reviewCount: 567,
    isFeatured: false, isBestSeller: false, isNew: false,
    tags: ["boxing", "gloves", "professional", "leather"],
    colors: ["Black", "Red"],
    sizes: ["12oz", "14oz", "16oz"],
    specs: { "Material": "Premium Leather", "Ventilation": "EverCool", "Padding": "Dense Foam" },
    imageUrl: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&h=600&fit=crop&q=80",
  },
];

// ============================================================
// IMAGE UPLOAD
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

async function uploadToCloudinary(buffer: Buffer, folder: string, filename: string): Promise<string> {
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

async function fetchAndUpload(url: string, folder: string, filename: string): Promise<string> {
  try {
    const buffer = await downloadImage(url);
    const cloudUrl = await uploadToCloudinary(buffer, folder, filename);
    process.stdout.write(`  [ok] ${filename}\n`);
    return cloudUrl;
  } catch (err) {
    process.stdout.write(`  [skip] ${filename}: ${err}\n`);
    return url;
  }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  process.stdout.write("\n");
  process.stdout.write("  ==========================================\n");
  process.stdout.write("   Tayamo Sport - Premium Supplements v3\n");
  process.stdout.write("  ==========================================\n");

  await cleanDatabase();

  process.stdout.write("\n  Creating 8 categories...\n");
  const categoryMap: Record<string, number> = {};
  for (const cat of CATEGORIES) {
    const created = await prisma.shopCategory.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        description: cat.description,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    });
    categoryMap[cat.slug] = created.id;
    process.stdout.write(`  [+] ${cat.name}\n`);
  }

  process.stdout.write(`\n  Seeding 25 products...\n\n`);
  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const categoryId = categoryMap[p.categorySlug];
    if (!categoryId) {
      process.stdout.write(`  [!] ${p.name}: category '${p.categorySlug}' not found\n`);
      continue;
    }

    const cloudUrl = await fetchAndUpload(p.imageUrl, p.categorySlug, p.slug);

    await prisma.shopProduct.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        shortDesc: p.shortDesc,
        productType: p.productType,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        images: JSON.stringify([cloudUrl]),
        categoryId,
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

    process.stdout.write(`  [${i + 1}/25] ${p.name}\n`);
  }

  process.stdout.write("\n  ==========================================\n");
  process.stdout.write("   Done! 8 categories + 25 products seeded\n");
  process.stdout.write("  ==========================================\n\n");
}

main()
  .catch((e) => {
    process.stderr.write("Seed failed: " + String(e) + "\n");
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
