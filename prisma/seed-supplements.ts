/**
 * Tayamo Sport — Premium Sports Nutrition Store
 * 
 * 1. Deletes ALL existing shop products + categories
 * 2. Creates 6 supplement-only categories
 * 3. Seeds 25 premium products from real brands
 * 
 * Usage: npx tsx prisma/seed-supplements.ts
 */

import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import https from "https";

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
  process.stdout.write("\n🧹 Cleaning database...\n");

  // Delete in correct order (respect foreign keys)
  await prisma.shopReview.deleteMany();
  process.stdout.write("  ✓ Deleted all reviews\n");

  await prisma.shopOrderItem.deleteMany();
  process.stdout.write("  ✓ Deleted all order items\n");

  await prisma.shopOrder.deleteMany();
  process.stdout.write("  ✓ Deleted all orders\n");

  await prisma.shopProduct.deleteMany();
  process.stdout.write("  ✓ Deleted all products\n");

  await prisma.shopCategory.deleteMany();
  process.stdout.write("  ✓ Deleted all categories\n");
}

// ============================================================
// CATEGORIES (6 supplement-only)
// ============================================================

const CATEGORIES = [
  { name: "Whey Protein", slug: "whey-protein", icon: "🥛", description: "Premium whey protein for muscle growth and recovery", sortOrder: 1 },
  { name: "Isolate Protein", slug: "isolate-protein", icon: "💎", description: "Pure isolate protein with maximum absorption", sortOrder: 2 },
  { name: "Mass Gainer", slug: "mass-gainer", icon: "💪", description: "High-calorie gainers for serious mass building", sortOrder: 3 },
  { name: "Creatine", slug: "creatine", icon: "⚡", description: "Pure creatine for strength and power output", sortOrder: 4 },
  { name: "Pre Workout", slug: "pre-workout", icon: "🔥", description: "Explosive energy and focus for intense training", sortOrder: 5 },
  { name: "Keto & Healthy Snacks", slug: "keto-snacks", icon: "🥜", description: "Low-carb protein bars and healthy snack options", sortOrder: 6 },
];

// ============================================================
// PRODUCTS (25 premium supplement products)
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
    name: "Gold Standard 100% Whey",
    slug: "gold-standard-100-whey",
    description: "The world's best-selling whey protein. 24g of pure whey protein per serving with 5.5g of naturally occurring BCAAs. Supports muscle recovery and lean muscle growth. Trusted by athletes worldwide for over 30 years.",
    shortDesc: "24g protein per serving",
    productType: "Whey Protein",
    price: 289.00, compareAtPrice: 349.00,
    categorySlug: "whey-protein", brand: "Optimum Nutrition", sku: "ON-GSW-2.27",
    weight: 2.27, stock: 45, rating: 4.8, reviewCount: 2341,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["whey", "protein", "muscle", "recovery"],
    colors: ["Double Rich Chocolate", "Vanilla Ice Cream", "Strawberry Cream"],
    specs: { "Protein": "24g", "BCAAs": "5.5g", "Servings": "29", "Sugar": "1g" },
    imageUrl: "https://images.unsplash.com/photo-1622485831930-11d0f57f5b1f?w=600&h=600&fit=crop",
  },
  {
    name: "Rule 1 R1 Whey Blend",
    slug: "rule1-r1-whey",
    description: "High-quality whey protein blend with fast-acting whey isolate as the primary source. 24g of protein per scoop with a delicious taste. Perfect for any time of day.",
    shortDesc: "24g protein blend",
    productType: "Whey Protein",
    price: 259.00,
    categorySlug: "whey-protein", brand: "Rule 1", sku: "R1-RWB-2.27",
    weight: 2.27, stock: 35, rating: 4.6, reviewCount: 876,
    isFeatured: false, isBestSeller: true, isNew: false,
    tags: ["whey", "protein", "blend", "tasty"],
    colors: ["Chocolate Fudge", "Vanilla Cream"],
    specs: { "Protein": "24g", "BCAAs": "5g", "Servings": "30" },
    imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop",
  },
  {
    name: "Impact Whey Protein",
    slug: "impact-whey-protein",
    description: "Premium whey protein concentrate with 21g of protein per serving. Informed Sport certified and available in a wide range of flavours. Great value without compromising quality.",
    shortDesc: "21g protein per serving",
    productType: "Whey Protein",
    price: 189.00, compareAtPrice: 229.00,
    categorySlug: "whey-protein", brand: "MyProtein", sku: "MP-IWP-2.5",
    weight: 2.5, stock: 60, rating: 4.5, reviewCount: 3210,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["whey", "protein", "value", "informed-sport"],
    colors: ["Chocolate", "Strawberry Cream", "Banana"],
    specs: { "Protein": "21g", "BCAAs": "4.5g", "Servings": "50" },
    imageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2b1aa?w=600&h=600&fit=crop",
  },
  {
    name: "Applied Nutrition Critical Whey",
    slug: "applied-nutrition-whey",
    description: "Premium whey protein concentrate with added vitamins and minerals. Tastes incredible mixed with water or milk. Informed Sport certified for competitive athletes.",
    shortDesc: "Informed Sport certified",
    productType: "Whey Protein",
    price: 199.00, compareAtPrice: 249.00,
    categorySlug: "whey-protein", brand: "Applied Nutrition", sku: "AN-CW-2.27",
    weight: 2.27, stock: 40, rating: 4.5, reviewCount: 654,
    isFeatured: false, isBestSeller: false, isNew: true,
    tags: ["whey", "protein", "certified", "vitamins"],
    colors: ["Chocolate", "Strawberry", "Cookies & Cream"],
    specs: { "Protein": "23g", "BCAAs": "4.5g", "Servings": "30" },
    imageUrl: "https://images.unsplash.com/photo-1541783245753-14ad98823717?w=600&h=600&fit=crop",
  },
  {
    name: "Nitro-Tech Whey Gold",
    slug: "nitro-tech-whey-gold",
    description: "Performance whey protein with 24g of whey protein isolate and peptides for enhanced recovery. Enhanced with creatine for strength gains.",
    shortDesc: "24g whey isolate + peptides",
    productType: "Whey Protein",
    price: 249.00, compareAtPrice: 299.00,
    categorySlug: "whey-protein", brand: "MuscleTech", sku: "MT-NTWG-2.5",
    weight: 2.5, stock: 30, rating: 4.6, reviewCount: 1234,
    isFeatured: true, isBestSeller: false, isNew: false,
    tags: ["whey", "isolate", "creatine", "strength"],
    colors: ["Vanilla", "Chocolate"],
    specs: { "Protein": "24g", "Creatine": "3g", "Servings": "40" },
    imageUrl: "https://images.unsplash.com/photo-1583454110551-24f2fa695769?w=600&h=600&fit=crop",
  },

  // ======================== ISOLATE PROTEIN (4) ========================
  {
    name: "ISO 100 Hydrolyzed Whey Isolate",
    slug: "iso-100-hydrolyzed",
    description: "100% hydrolyzed whey protein isolate filtered for maximum purity. Zero sugar, zero fat, and fast-absorbing for rapid post-workout recovery. The cleanest protein for serious athletes.",
    shortDesc: "Pure hydrolyzed isolate",
    productType: "Isolate Protein",
    price: 349.00, compareAtPrice: 399.00,
    categorySlug: "isolate-protein", brand: "Dymatize", sku: "DYM-ISO-2.27",
    weight: 2.27, stock: 30, rating: 4.7, reviewCount: 1567,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["isolate", "whey", "pure", "low-carb"],
    colors: ["Gourmet Chocolate", "Birthday Cake"],
    specs: { "Protein": "25g", "Sugar": "0g", "Fat": "0g", "Servings": "28" },
    imageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2b1aa?w=600&h=600&fit=crop&q=80",
  },
  {
    name: "Platinum Hydrowhey Peptides",
    slug: "platinum-hydrowhey",
    description: "Advanced hydrolyzed whey protein isolate with micronized peptides for ultra-fast absorption. 30g of protein per serving with minimal fat and carbs.",
    shortDesc: "30g hydrolyzed peptides",
    productType: "Isolate Protein",
    price: 379.00, compareAtPrice: 429.00,
    categorySlug: "isolate-protein", brand: "Optimum Nutrition", sku: "ON-PH-1.59",
    weight: 1.59, stock: 25, rating: 4.6, reviewCount: 987,
    isFeatured: true, isBestSeller: false, isNew: false,
    tags: ["hydrolyzed", "peptides", "fast-absorbing"],
    colors: ["Chocolate Supreme", "Vanilla Ice"],
    specs: { "Protein": "30g", "Fat": "1g", "Sugar": "0g", "Servings": "22" },
    imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop&q=80",
  },
  {
    name: "Isopure Zero Carb Protein",
    slug: "isopure-zero-carb",
    description: "100% whey protein isolate with zero carbs. Perfect for low-carb and ketogenic diets. 25g of pure protein per serving with added vitamins and minerals.",
    shortDesc: "Zero carb whey isolate",
    productType: "Isolate Protein",
    price: 329.00,
    categorySlug: "isolate-protein", brand: "Isopure", sku: "IS-ZC-2.27",
    weight: 2.27, stock: 20, rating: 4.5, reviewCount: 876,
    isFeatured: false, isBestSeller: false, isNew: true,
    tags: ["zero-carb", "keto", "isolate"],
    colors: ["Creamy Vanilla", "Dutch Chocolate"],
    specs: { "Protein": "25g", "Carbs": "0g", "Sugar": "0g", "Servings": "29" },
    imageUrl: "https://images.unsplash.com/photo-1541783245753-14ad98823717?w=600&h=600&fit=crop&q=80",
  },
  {
    name: "Clear Whey Isolate",
    slug: "clear-whey-isolate",
    description: "Refreshing clear whey protein isolate that drinks like juice. Light, fruity, and refreshing with 20g of protein. Perfect for post-workout or anytime hydration.",
    shortDesc: "Juice-style protein drink",
    productType: "Isolate Protein",
    price: 199.00,
    categorySlug: "isolate-protein", brand: "MyProtein", sku: "MP-CWI-1.6",
    weight: 1.6, stock: 35, rating: 4.4, reviewCount: 654,
    isFeatured: false, isBestSeller: false, isNew: true,
    tags: ["clear", "refreshing", "juice", "light"],
    colors: ["Tropical", "Lemon & Lime", "Peach Tea"],
    specs: { "Protein": "20g", "Sugar": "0g", "Calories": "82", "Servings": "24" },
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=600&fit=crop",
  },

  // ======================== MASS GAINER (3) ========================
  {
    name: "Serious Mass Weight Gainer",
    slug: "serious-mass-gainer",
    description: "High-calorie weight gainer with 1250 calories and 50g of protein per serving. For hardgainers who need extra calories to build mass. Added glutamine and creatine.",
    shortDesc: "1250 calories per serving",
    productType: "Mass Gainer",
    price: 269.00, compareAtPrice: 319.00,
    categorySlug: "mass-gainer", brand: "Optimum Nutrition", sku: "ON-SM-5.44",
    weight: 5.44, stock: 25, rating: 4.5, reviewCount: 1876,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["mass", "gainer", "calories", "weight-gain"],
    colors: ["Chocolate", "Vanilla"],
    specs: { "Calories": "1250", "Protein": "50g", "Carbs": "252g" },
    imageUrl: "https://images.unsplash.com/photo-1583454110551-24f2fa695769?w=600&h=600&fit=crop&q=80",
  },
  {
    name: "Mass Tech Extreme 2000",
    slug: "mass-tech-extreme-2000",
    description: "Advanced mass gainer with 2000 calories, 80g of protein, and 316g of carbs per serving. Enhanced with Creatine and glutamine for maximum muscle building.",
    shortDesc: "2000 calories, 80g protein",
    productType: "Mass Gainer",
    price: 349.00, compareAtPrice: 399.00,
    categorySlug: "mass-gainer", brand: "MuscleTech", sku: "MT-MTE-6.8",
    weight: 6.8, stock: 15, rating: 4.4, reviewCount: 654,
    isFeatured: false, isBestSeller: false, isNew: false,
    tags: ["mass", "gainer", "high-calorie", "strength"],
    colors: ["Chocolate", "Vanilla"],
    specs: { "Calories": "2000", "Protein": "80g", "Creatine": "10g" },
    imageUrl: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&h=600&fit=crop",
  },
  {
    name: "True-Mass 1200",
    slug: "true-mass-1200",
    description: "Premium mass gainer with 1230 calories, 50g of multi-source protein, and MCTs for sustained energy. BSN's flagship weight gainer for serious athletes.",
    shortDesc: "1230 calories, multi-source protein",
    productType: "Mass Gainer",
    price: 299.00,
    categorySlug: "mass-gainer", brand: "BSN", sku: "BSN-TM12-5.84",
    weight: 5.84, stock: 20, rating: 4.5, reviewCount: 987,
    isFeatured: false, isBestSeller: true, isNew: false,
    tags: ["mass", "gainer", "multi-source", "mct"],
    colors: ["Chocolate Milkshake", "Vanilla Ice Cream"],
    specs: { "Calories": "1230", "Protein": "50g", "Carbs": "215g" },
    imageUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=600&fit=crop",
  },

  // ======================== CREATINE (4) ========================
  {
    name: "Micronized Creatine Powder",
    slug: "micronized-creatine",
    description: "Pure micronized creatine monohydrate for increased strength, power, and muscle endurance. The most researched supplement in sports nutrition history.",
    shortDesc: "5g pure creatine",
    productType: "Creatine",
    price: 89.00, compareAtPrice: 119.00,
    categorySlug: "creatine", brand: "Optimum Nutrition", sku: "ON-CR-600",
    weight: 0.63, stock: 80, rating: 4.7, reviewCount: 3456,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["creatine", "strength", "power"],
    specs: { "Creatine": "5g per serving", "Servings": "120" },
    imageUrl: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&h=600&fit=crop&q=80",
  },
  {
    name: "Creatine Monohydrate (Creapure)",
    slug: "creapure-creatine",
    description: "Pure Creapure creatine monohydrate from Germany. The highest quality creatine available. Unflavored, micronized, and lab-tested for purity.",
    shortDesc: "German Creapure formula",
    productType: "Creatine",
    price: 119.00,
    categorySlug: "creatine", brand: "MyProtein", sku: "MP-CM-1",
    weight: 1.0, stock: 50, rating: 4.6, reviewCount: 1234,
    isFeatured: true, isBestSeller: false, isNew: false,
    tags: ["creatine", "creapure", "pure", "german"],
    specs: { "Creatine": "5g", "Source": "Creapure", "Servings": "200" },
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop",
  },
  {
    name: "Creatine HCL",
    slug: "creatine-hcl",
    description: "Highly soluble creatine HCL for maximum absorption with less bloating. Only 1.5g needed per serving compared to 5g for monohydrate.",
    shortDesc: "Ultra-soluble creatine HCL",
    productType: "Creatine",
    price: 139.00, compareAtPrice: 159.00,
    categorySlug: "creatine", brand: "MuscleTech", sku: "MT-CRH-90",
    weight: 0.17, stock: 40, rating: 4.5, reviewCount: 654,
    isFeatured: false, isBestSeller: false, isNew: true,
    tags: ["creatine", "hcl", "soluble", "absorption"],
    specs: { "Creatine HCL": "1.5g", "Servings": "90" },
    imageUrl: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600&h=600&fit=crop",
  },
  {
    name: "Con-Creat Creatine Matrix",
    slug: "con-creat-creatine",
    description: "Advanced creatine matrix combining creatine monohydrate, creatine HCL, and buffered creatine for maximum strength and endurance.",
    shortDesc: "Triple creatine matrix",
    productType: "Creatine",
    price: 99.00,
    categorySlug: "creatine", brand: "Kevin Levrone", sku: "KL-CC-120",
    weight: 0.3, stock: 35, rating: 4.4, reviewCount: 432,
    isFeatured: false, isBestSeller: false, isNew: false,
    tags: ["creatine", "matrix", "triple", "strength"],
    specs: { "Creatine Blend": "3.5g", "Servings": "120" },
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop",
  },

  // ======================== PRE WORKOUT (4) ========================
  {
    name: "C4 Original Pre-Workout",
    slug: "c4-original-preworkout",
    description: "America's #1 pre-workout with explosive energy, focus, and endurance. Features CarnoSyn beta-alanine and caffeine for maximum performance.",
    shortDesc: "Explosive energy boost",
    productType: "Pre-Workout",
    price: 149.00, compareAtPrice: 179.00,
    categorySlug: "pre-workout", brand: "Cellucor", sku: "CC-C4-30srv",
    weight: 0.27, stock: 55, rating: 4.5, reviewCount: 3210,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["pre-workout", "energy", "focus", "caffeine"],
    colors: ["Fruit Punch", "Blue Raspberry", "Watermelon"],
    specs: { "Caffeine": "150mg", "Beta-Alanine": "1.6g", "Servings": "30" },
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop&q=80",
  },
  {
    name: "Pre JYM Pre-Workout",
    slug: "pre-jym-preworkout",
    description: "Science-backed pre-workout with 13 active ingredients at clinically effective doses. Transparent label with no proprietary blends. Created by Dr. Jim Stoppani.",
    shortDesc: "13 active ingredients, transparent label",
    productType: "Pre-Workout",
    price: 179.00, compareAtPrice: 209.00,
    categorySlug: "pre-workout", brand: "JYM", sku: "JYM-Pre-30",
    weight: 0.35, stock: 30, rating: 4.7, reviewCount: 987,
    isFeatured: true, isBestSeller: false, isNew: false,
    tags: ["pre-workout", "transparent", "clinical", "science"],
    colors: ["Blue Raspberry", "Orange Mango"],
    specs: { "Caffeine": "300mg", "Beta-Alanine": "3.2g", "Creatine": "5g" },
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop",
  },
  {
    name: "Ghost Legend V4",
    slug: "ghost-legend-v4",
    description: "Premium pre-workout with AlphaSize, S7, and NeuroFactor for energy, pumps, and focus. Full transparency and amazing flavours. Collaborative with huge brands.",
    shortDesc: "Energy + Pumps + Focus",
    productType: "Pre-Workout",
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
    name: "Thavage Pre-Workout",
    slug: "thavage-preworkout",
    description: "Chris Bumstead's own pre-workout formula with high-dose caffeine, L-Citrulline for pumps, and Beta-Alanine for endurance. Premium quality, insane flavours.",
    shortDesc: "CBum's premium pre-workout",
    productType: "Pre-Workout",
    price: 189.00,
    categorySlug: "pre-workout", brand: "Raw Nutrition", sku: "RN-THV-30",
    weight: 0.3, stock: 20, rating: 4.8, reviewCount: 654,
    isFeatured: false, isBestSeller: false, isNew: true,
    tags: ["pre-workout", "cbum", "premium", "pumps"],
    colors: ["Cotton Candy", "Rain Sherbet"],
    specs: { "Caffeine": "350mg", "L-Citrulline": "8g", "Beta-Alanine": "3.2g" },
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&h=600&fit=crop",
  },

  // ======================== KETO & HEALTHY SNACKS (5) ========================
  {
    name: "Quest Protein Bar (12 Pack)",
    slug: "quest-protein-bar",
    description: "High-fiber, low-sugar protein bar with 21g of protein and only 1g of sugar. Perfect meal replacement or post-workout snack. Tastes like a candy bar.",
    shortDesc: "21g protein, 1g sugar",
    productType: "Protein Bar",
    price: 129.00,
    categorySlug: "keto-snacks", brand: "Quest Nutrition", sku: "QN-PB-12pk",
    weight: 0.7, stock: 80, rating: 4.6, reviewCount: 3456,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["protein-bar", "snack", "low-sugar"],
    colors: ["Chocolate Chip", "Peanut Butter", "Cookies & Cream"],
    specs: { "Protein": "21g", "Sugar": "1g", "Fiber": "14g" },
    imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&h=600&fit=crop",
  },
  {
    name: "Grenade Carb Killa Bar (12 Pack)",
    slug: "grenade-carb-killa",
    description: "Ultra-low sugar protein bar with 22g of protein and crispy texture. Triple-layered for maximum taste. Less than 1g of sugar per bar.",
    shortDesc: "22g protein, triple-layered",
    productType: "Protein Bar",
    price: 139.00, compareAtPrice: 159.00,
    categorySlug: "keto-snacks", brand: "Grenade", sku: "GR-CK-12pk",
    weight: 0.72, stock: 60, rating: 4.7, reviewCount: 1876,
    isFeatured: true, isBestSeller: true, isNew: false,
    tags: ["protein-bar", "low-sugar", "triple-layer"],
    colors: ["Fudge Brownie", "White Chocolate Cookie", "Salted Caramel"],
    specs: { "Protein": "22g", "Sugar": "<1g", "Calories": "216" },
    imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&h=600&fit=crop&q=80",
  },
  {
    name: "Keto Protein Peanut Butter",
    slug: "keto-peanut-butter",
    description: "High-protein, low-carb peanut butter fortified with whey protein isolate. Perfect for keto diets. No added sugar, no palm oil. Smooth and creamy.",
    shortDesc: "High-protein keto PB",
    productType: "Keto Snack",
    price: 49.00,
    categorySlug: "keto-snacks", brand: "PBFit", sku: "PBF-KP-454",
    weight: 0.45, stock: 50, rating: 4.5, reviewCount: 876,
    isFeatured: false, isBestSeller: false, isNew: true,
    tags: ["peanut-butter", "keto", "high-protein", "low-carb"],
    specs: { "Protein": "8g", "Sugar": "2g", "Fat": "12g" },
    imageUrl: "https://images.unsplash.com/photo-1612164979979-823614504470?w=600&h=600&fit=crop",
  },
  {
    name: "ONE Protein Bars (12 Pack)",
    slug: "one-protein-bars",
    description: "High-protein bars with 20g of protein and only 1g of sugar. Soft, chewy texture that tastes like dessert. Gluten-free and keto-friendly.",
    shortDesc: "20g protein, 1g sugar",
    productType: "Protein Bar",
    price: 119.00,
    categorySlug: "keto-snacks", brand: "ONE Brands", sku: "ONE-PB-12pk",
    weight: 0.65, stock: 45, rating: 4.4, reviewCount: 654,
    isFeatured: false, isBestSeller: false, isNew: false,
    tags: ["protein-bar", "keto", "gluten-free", "chewy"],
    colors: ["Peanut Butter Cup", "Birthday Cake", "Maple Glazed Donut"],
    specs: { "Protein": "20g", "Sugar": "1g", "Fiber": "8g" },
    imageUrl: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=600&h=600&fit=crop",
  },
  {
    name: "Low Carb Protein Cookies (12 Pack)",
    slug: "low-carb-protein-cookies",
    description: "Soft-baked protein cookies with 15g of protein and only 2g net carbs. Tastes like a real cookie with real chocolate chips. Perfect keto-friendly treat.",
    shortDesc: "15g protein, 2g net carbs",
    productType: "Keto Snack",
    price: 99.00, compareAtPrice: 119.00,
    categorySlug: "keto-snacks", brand: "Lenny & Larry", sku: "LL-PC-12pk",
    weight: 0.84, stock: 40, rating: 4.3, reviewCount: 567,
    isFeatured: false, isBestSeller: false, isNew: true,
    tags: ["protein-cookie", "keto", "low-carb", "snack"],
    colors: ["Double Chocolate", "Peanut Butter", "Snickerdoodle"],
    specs: { "Protein": "15g", "Net Carbs": "2g", "Fiber": "10g" },
    imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=600&fit=crop",
  },
];

// ============================================================
// IMAGE UPLOAD HELPER
// ============================================================

function downloadImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "TayamoBot/1.0" } }, (res) => {
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
    }).on("error", reject);
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
    process.stdout.write(`  ✓ ${filename}\n`);
    return cloudUrl;
  } catch (err) {
    process.stdout.write(`  ✗ ${filename}: ${err}\n`);
    return url; // fallback to original URL
  }
}

// ============================================================
// SEED CATEGORIES
// ============================================================

async function seedCategories() {
  process.stdout.write("\n📁 Creating categories...\n");
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
    process.stdout.write(`  ✓ ${cat.name} (${cat.slug})\n`);
  }

  return categoryMap;
}

// ============================================================
// SEED PRODUCTS
// ============================================================

async function seedProducts(categoryMap: Record<string, number>) {
  process.stdout.write("\n📦 Uploading images & seeding products...\n");

  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const categoryId = categoryMap[p.categorySlug];

    if (!categoryId) {
      process.stdout.write(`  ✗ ${p.name}: category '${p.categorySlug}' not found\n`);
      continue;
    }

    // Upload image to Cloudinary
    const cloudUrl = await fetchAndUpload(
      p.imageUrl,
      p.categorySlug,
      p.slug
    );

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

    process.stdout.write(`  ✓ [${i + 1}/${PRODUCTS.length}] ${p.name}\n`);
  }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  process.stdout.write("=".repeat(60) + "\n");
  process.stdout.write("  Tayamo Sport — Premium Sports Nutrition Store\n");
  process.stdout.write("  Seed Script v2.0\n");
  process.stdout.write("=".repeat(60) + "\n");

  await cleanDatabase();
  const categoryMap = await seedCategories();
  await seedProducts(categoryMap);

  process.stdout.write("\n" + "=".repeat(60) + "\n");
  process.stdout.write("  ✅ Done! 6 categories + 25 products seeded.\n");
  process.stdout.write("=".repeat(60) + "\n\n");
}

main()
  .catch((e) => {
    process.stderr.write("❌ Seed failed:\n" + String(e) + "\n");
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
