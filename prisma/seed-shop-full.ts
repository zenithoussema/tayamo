import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================================
// CATEGORIES
// ============================================================

const categories = [
  // Sports Nutrition
  { name: "Whey Protein", slug: "whey-protein", icon: "🥛", group: "Sports Nutrition", sortOrder: 1 },
  { name: "Isolate Protein", slug: "isolate-protein", icon: "🔬", group: "Sports Nutrition", sortOrder: 2 },
  { name: "Hydrolyzed Protein", slug: "hydrolyzed-protein", icon: "⚗️", group: "Sports Nutrition", sortOrder: 3 },
  { name: "Mass Gainer", slug: "mass-gainer", icon: "🏋️", group: "Sports Nutrition", sortOrder: 4 },
  { name: "Creatine", slug: "creatine", icon: "⚡", group: "Sports Nutrition", sortOrder: 5 },
  { name: "Pre-Workout", slug: "pre-workout", icon: "🔥", group: "Sports Nutrition", sortOrder: 6 },
  { name: "BCAA", slug: "bcaa", icon: "🧬", group: "Sports Nutrition", sortOrder: 7 },
  { name: "EAA", slug: "eaa", icon: "🧬", group: "Sports Nutrition", sortOrder: 8 },
  { name: "Glutamine", slug: "glutamine", icon: "💊", group: "Sports Nutrition", sortOrder: 9 },
  { name: "Casein", slug: "casein", icon: "🥛", group: "Sports Nutrition", sortOrder: 10 },
  { name: "Recovery", slug: "recovery", icon: "🔄", group: "Sports Nutrition", sortOrder: 11 },
  { name: "Electrolytes", slug: "electrolytes", icon: "💧", group: "Sports Nutrition", sortOrder: 12 },
  { name: "Vitamins", slug: "vitamins", icon: "💊", group: "Sports Nutrition", sortOrder: 13 },
  { name: "Minerals", slug: "minerals", icon: "🧪", group: "Sports Nutrition", sortOrder: 14 },
  { name: "Omega 3", slug: "omega-3", icon: "🐟", group: "Sports Nutrition", sortOrder: 15 },
  { name: "Fish Oil", slug: "fish-oil", icon: "🐟", group: "Sports Nutrition", sortOrder: 16 },
  { name: "Collagen", slug: "collagen", icon: "✨", group: "Sports Nutrition", sortOrder: 17 },
  { name: "Joint Support", slug: "joint-support", icon: "🦴", group: "Sports Nutrition", sortOrder: 18 },
  { name: "Fat Burners", slug: "fat-burners", icon: "🔥", group: "Sports Nutrition", sortOrder: 19 },
  { name: "Testosterone Support", slug: "testosterone-support", icon: "💪", group: "Sports Nutrition", sortOrder: 20 },
  { name: "Healthy Snacks", slug: "healthy-snacks", icon: "🥜", group: "Sports Nutrition", sortOrder: 21 },
  { name: "Protein Bars", slug: "protein-bars", icon: "🍫", group: "Sports Nutrition", sortOrder: 22 },
  { name: "Energy Drinks", slug: "energy-drinks", icon: "⚡", group: "Sports Nutrition", sortOrder: 23 },
  { name: "Shakers", slug: "shakers", icon: "🥤", group: "Sports Nutrition", sortOrder: 24 },
  { name: "Water Bottles", slug: "water-bottles", icon: "💧", group: "Sports Nutrition", sortOrder: 25 },

  // Combat Sports
  { name: "Boxing Gloves", slug: "boxing-gloves", icon: "🥊", group: "Combat Sports", sortOrder: 26 },
  { name: "Kickboxing Gloves", slug: "kickboxing-gloves", icon: "🥊", group: "Combat Sports", sortOrder: 27 },
  { name: "MMA Gloves", slug: "mma-gloves", icon: "🥊", group: "Combat Sports", sortOrder: 28 },
  { name: "Hand Wraps", slug: "hand-wraps", icon: "🤲", group: "Combat Sports", sortOrder: 29 },
  { name: "Punching Bags", slug: "punching-bags", icon: "🎯", group: "Combat Sports", sortOrder: 30 },
  { name: "Speed Bags", slug: "speed-bags", icon: "🎯", group: "Combat Sports", sortOrder: 31 },
  { name: "Double End Bags", slug: "double-end-bags", icon: "🎯", group: "Combat Sports", sortOrder: 32 },
  { name: "Focus Mitts", slug: "focus-mitts", icon: "🤾", group: "Combat Sports", sortOrder: 33 },
  { name: "Thai Pads", slug: "thai-pads", icon: "🤾", group: "Combat Sports", sortOrder: 34 },
  { name: "Shin Guards", slug: "shin-guards", icon: "🦵", group: "Combat Sports", sortOrder: 35 },
  { name: "Head Guards", slug: "head-guards", icon: "⛑️", group: "Combat Sports", sortOrder: 36 },
  { name: "Mouth Guards", slug: "mouth-guards", icon: "🦷", group: "Combat Sports", sortOrder: 37 },
  { name: "Groin Protectors", slug: "groin-protectors", icon: "🛡️", group: "Combat Sports", sortOrder: 38 },
  { name: "Jump Ropes", slug: "jump-ropes", icon: "🪢", group: "Combat Sports", sortOrder: 39 },
  { name: "Boxing Shoes", slug: "boxing-shoes", icon: "👟", group: "Combat Sports", sortOrder: 40 },

  // Gym Equipment
  { name: "Resistance Bands", slug: "resistance-bands", icon: "🔴", group: "Gym Equipment", sortOrder: 41 },
  { name: "Dumbbells", slug: "dumbbells", icon: "🏋️", group: "Gym Equipment", sortOrder: 42 },
  { name: "Kettlebells", slug: "kettlebells", icon: "🏋️", group: "Gym Equipment", sortOrder: 43 },
  { name: "Weight Plates", slug: "weight-plates", icon: "🏋️", group: "Gym Equipment", sortOrder: 44 },
  { name: "Barbells", slug: "barbells", icon: "🏋️", group: "Gym Equipment", sortOrder: 45 },
  { name: "Gym Belts", slug: "gym-belts", icon: "🔗", group: "Gym Equipment", sortOrder: 46 },
  { name: "Wrist Wraps", slug: "wrist-wraps", icon: "✋", group: "Gym Equipment", sortOrder: 47 },
  { name: "Knee Sleeves", slug: "knee-sleeves", icon: "🦵", group: "Gym Equipment", sortOrder: 48 },
  { name: "Lifting Straps", slug: "lifting-straps", icon: "💪", group: "Gym Equipment", sortOrder: 49 },
  { name: "Foam Rollers", slug: "foam-rollers", icon: "🧘", group: "Gym Equipment", sortOrder: 50 },
  { name: "Massage Guns", slug: "massage-guns", icon: "💆", group: "Gym Equipment", sortOrder: 51 },
  { name: "Yoga Mats", slug: "yoga-mats", icon: "🧘", group: "Gym Equipment", sortOrder: 52 },

  // Clothing
  { name: "T-Shirts", slug: "t-shirts", icon: "👕", group: "Clothing", sortOrder: 53 },
  { name: "Tank Tops", slug: "tank-tops", icon: "👕", group: "Clothing", sortOrder: 54 },
  { name: "Hoodies", slug: "hoodies", icon: "🧥", group: "Clothing", sortOrder: 55 },
  { name: "Shorts", slug: "shorts", icon: "🩳", group: "Clothing", sortOrder: 56 },
  { name: "Joggers", slug: "joggers", icon: "👖", group: "Clothing", sortOrder: 57 },
  { name: "Compression Wear", slug: "compression-wear", icon: "👕", group: "Clothing", sortOrder: 58 },
  { name: "Leggings", slug: "leggings", icon: "👖", group: "Clothing", sortOrder: 59 },
  { name: "Sports Bras", slug: "sports-bras", icon: "👙", group: "Clothing", sortOrder: 60 },
  { name: "Boxing Shorts", slug: "boxing-shorts", icon: "🩳", group: "Clothing", sortOrder: 61 },
  { name: "Kickboxing Uniforms", slug: "kickboxing-uniforms", icon: "🥋", group: "Clothing", sortOrder: 62 },
  { name: "Gym Shoes", slug: "gym-shoes", icon: "👟", group: "Clothing", sortOrder: 63 },
  { name: "Caps", slug: "caps", icon: "🧢", group: "Clothing", sortOrder: 64 },
  { name: "Backpacks", slug: "backpacks", icon: "🎒", group: "Clothing", sortOrder: 65 },

  // Accessories
  { name: "Gym Towels", slug: "gym-towels", icon: "🧖", group: "Accessories", sortOrder: 66 },
  { name: "Gym Bags", slug: "gym-bags", icon: "💼", group: "Accessories", sortOrder: 67 },
  { name: "Smart Bottles", slug: "smart-bottles", icon: "📱", group: "Accessories", sortOrder: 68 },
  { name: "Training Timers", slug: "training-timers", icon: "⏱️", group: "Accessories", sortOrder: 69 },
  { name: "Fitness Trackers", slug: "fitness-trackers", icon: "⌚", group: "Accessories", sortOrder: 70 },
];

// ============================================================
// PRODUCT IMAGES — Real Unsplash photos by category keyword
// ============================================================

function img(keyword: string, id: string): string {
  return `https://images.unsplash.com/${id}?w=600&h=600&fit=crop&auto=format`;
}

const IMAGES: Record<string, string[]> = {
  "whey-protein": [
    img("whey", "photo-1593095948071-474c5cc2b1aa"),
    img("protein", "photo-1622485831930-11d0f57f5b1f"),
  ],
  "isolate-protein": [
    img("isolate", "photo-1593095948071-474c5cc2b1aa"),
    img("protein", "photo-1622485831930-11d0f57f5b1f"),
  ],
  "hydrolyzed-protein": [
    img("protein", "photo-1622485831930-11d0f57f5b1f"),
  ],
  "mass-gainer": [
    img("gainer", "photo-1579722821273-0f6c7d44362f"),
    img("muscle", "photo-1583454110551-24f2fa695769"),
  ],
  "creatine": [
    img("creatine", "photo-1556228578-0d85b1a4d571"),
    img("supplement", "photo-1541783245753-14ad98823717"),
  ],
  "pre-workout": [
    img("preworkout", "photo-1556228578-0d85b1a4d571"),
    img("energy", "photo-1517836357463-d25dfeac3438"),
  ],
  "bcaa": [
    img("bcaa", "photo-1556228578-0d85b1a4d571"),
    img("amino", "photo-1541783245753-14ad98823717"),
  ],
  "eaa": [
    img("amino", "photo-1541783245753-14ad98823717"),
  ],
  "glutamine": [
    img("supplement", "photo-1541783245753-14ad98823717"),
  ],
  "casein": [
    img("casein", "photo-1593095948071-474c5cc2b1aa"),
    img("protein", "photo-1622485831930-11d0f57f5b1f"),
  ],
  "recovery": [
    img("recovery", "photo-1544367567-0f2fcb009e0b"),
    img("stretch", "photo-1518611012118-696072aa579a"),
  ],
  "electrolytes": [
    img("electrolyte", "photo-1534438327276-14e5300c3a48"),
    img("hydration", "photo-1559839734-2b71ea197ec2"),
  ],
  "vitamins": [
    img("vitamins", "photo-1550572017-edd951b55104"),
    img("supplement", "photo-1584308666744-24d5c474f2ae"),
  ],
  "minerals": [
    img("minerals", "photo-1550572017-edd951b55104"),
  ],
  "omega-3": [
    img("omega", "photo-1559757175-5700dde675bc"),
    img("fish", "photo-1519708227418-c8fd9a32b7a2"),
  ],
  "fish-oil": [
    img("fish-oil", "photo-1559757175-5700dde675bc"),
  ],
  "collagen": [
    img("collagen", "photo-1556228578-0d85b1a4d571"),
  ],
  "joint-support": [
    img("joint", "photo-1544367567-0f2fcb009e0b"),
  ],
  "fat-burners": [
    img("fatburner", "photo-1517836357463-d25dfeac3438"),
    img("thermo", "photo-1556228578-0d85b1a4d571"),
  ],
  "testosterone-support": [
    img("testosterone", "photo-1517836357463-d25dfeac3438"),
  ],
  "healthy-snacks": [
    img("snack", "photo-1599599810769-bcde5a160d32"),
    img("nuts", "photo-1536590819755-53e40e486393"),
  ],
  "protein-bars": [
    img("proteinbar", "photo-1599599810769-bcde5a160d32"),
    img("bar", "photo-1622483767028-3f66f32aef97"),
  ],
  "energy-drinks": [
    img("energydrink", "photo-1534438327276-14e5300c3a48"),
    img("drink", "photo-1559839734-2b71ea197ec2"),
  ],
  "shakers": [
    img("shaker", "photo-1570831597283-31a5a8d1e28c"),
    img("bottle", "photo-1602143407151-7111542de6e8"),
  ],
  "water-bottles": [
    img("waterbottle", "photo-1602143407151-7111542de6e8"),
    img("bottle", "photo-1523362628745-0c100fc988ac"),
  ],
  "boxing-gloves": [
    img("boxinggloves", "photo-1549719386-74dfcbf7dbed"),
    img("boxing", "photo-1517438322307-e67111335449"),
  ],
  "kickboxing-gloves": [
    img("kickboxing", "photo-1549719386-74dfcbf7dbed"),
    img("gloves", "photo-1517438322307-e67111335449"),
  ],
  "mma-gloves": [
    img("mma", "photo-1549719386-74dfcbf7dbed"),
    img("fight", "photo-1517438322307-e67111335449"),
  ],
  "hand-wraps": [
    img("handwraps", "photo-1549719386-74dfcbf7dbed"),
    img("wrap", "photo-1517438322307-e67111335449"),
  ],
  "punching-bags": [
    img("punchingbag", "photo-1517438322307-e67111335449"),
    img("heavybag", "photo-1549719386-74dfcbf7dbed"),
  ],
  "speed-bags": [
    img("speedbag", "photo-1517438322307-e67111335449"),
  ],
  "double-end-bags": [
    img("doubleend", "photo-1517438322307-e67111335449"),
  ],
  "focus-mitts": [
    img("focusmitts", "photo-1549719386-74dfcbf7dbed"),
  ],
  "thai-pads": [
    img("thaipads", "photo-1549719386-74dfcbf7dbed"),
  ],
  "shin-guards": [
    img("shinguards", "photo-1549719386-74dfcbf7dbed"),
    img("muaythai", "photo-1517438322307-e67111335449"),
  ],
  "head-guards": [
    img("headguard", "photo-1549719386-74dfcbf7dbed"),
  ],
  "mouth-guards": [
    img("mouthguard", "photo-1549719386-74dfcbf7dbed"),
  ],
  "groin-protectors": [
    img("groinprotector", "photo-1549719386-74dfcbf7dbed"),
  ],
  "jump-ropes": [
    img("jumprope", "photo-1517836357463-d25dfeac3438"),
    img("cardio", "photo-1434682881908-b43d0467b798"),
  ],
  "boxing-shoes": [
    img("boxingshoes", "photo-1542291026-7eec264c27ff"),
    img("shoe", "photo-1556906781-9a412961c28c"),
  ],
  "resistance-bands": [
    img("resistanceband", "photo-1598289431512-b97b0917affc"),
    img("band", "photo-1571019614242-c5c5dee9f50b"),
  ],
  "dumbbells": [
    img("dumbbell", "photo-1534438327276-14e5300c3a48"),
    img("weights", "photo-1526506118085-60ce8714f8c5"),
  ],
  "kettlebells": [
    img("kettlebell", "photo-1517963879433-6ad2b056d712"),
    img("kettle", "photo-1526506118085-60ce8714f8c5"),
  ],
  "weight-plates": [
    img("weightplates", "photo-1534438327276-14e5300c3a48"),
    img("plates", "photo-1526506118085-60ce8714f8c5"),
  ],
  "barbells": [
    img("barbell", "photo-1534438327276-14e5300c3a48"),
    img("deadlift", "photo-1526506118085-60ce8714f8c5"),
  ],
  "gym-belts": [
    img("gymbelt", "photo-1534438327276-14e5300c3a48"),
    img("lifting", "photo-1526506118085-60ce8714f8c5"),
  ],
  "wrist-wraps": [
    img("wristwraps", "photo-1534438327276-14e5300c3a48"),
  ],
  "knee-sleeves": [
    img("kneesleeves", "photo-1534438327276-14e5300c3a48"),
    img("knee", "photo-1526506118085-60ce8714f8c5"),
  ],
  "lifting-straps": [
    img("liftingstraps", "photo-1534438327276-14e5300c3a48"),
  ],
  "foam-rollers": [
    img("foamroller", "photo-1544367567-0f2fcb009e0b"),
    img("yoga", "photo-1575052814086-f385e2e2ad33"),
  ],
  "massage-guns": [
    img("massagegun", "photo-1544367567-0f2fcb009e0b"),
    img("massage", "photo-1519823551278-64ac92734fb1"),
  ],
  "yoga-mats": [
    img("yogamat", "photo-1575052814086-f385e2e2ad33"),
    img("yoga", "photo-1544367567-0f2fcb009e0b"),
  ],
  "t-shirts": [
    img("gymtshirt", "photo-1521572163474-6864f9cf17ab"),
    img("tee", "photo-1583743814966-8936f5b7be1a"),
  ],
  "tank-tops": [
    img("tanktop", "photo-1521572163474-6864f9cf17ab"),
    img("gym", "photo-1571945153237-4929e783af4a"),
  ],
  "hoodies": [
    img("hoodie", "photo-1556821840-3a63f95609a7"),
    img("sweat", "photo-1578587018452-892bacefd9f2"),
  ],
  "shorts": [
    img("gymshorts", "photo-1591195853828-11db59a44f6b"),
    img("short", "photo-1562183241-b937e95585b6"),
  ],
  "joggers": [
    img("jogger", "photo-1552902865-b72c031ac5ea"),
    img("sweat", "photo-1556906781-9a412961c28c"),
  ],
  "compression-wear": [
    img("compression", "photo-1506629082955-511b1aa562c8"),
    img("tight", "photo-1571019614242-c5c5dee9f50b"),
  ],
  "leggings": [
    img("leggings", "photo-1506629082955-511b1aa562c8"),
    img("yoga", "photo-1575052814086-f385e2e2ad33"),
  ],
  "sports-bras": [
    img("sportsbra", "photo-1506629082955-511b1aa562c8"),
    img("activewear", "photo-1571019614242-c5c5dee9f50b"),
  ],
  "boxing-shorts": [
    img("boxingshorts", "photo-1549719386-74dfcbf7dbed"),
    img("muaythai", "photo-1517438322307-e67111335449"),
  ],
  "kickboxing-uniforms": [
    img("uniform", "photo-1549719386-74dfcbf7dbed"),
    img("karate", "photo-1517438322307-e67111335449"),
  ],
  "gym-shoes": [
    img("trainers", "photo-1542291026-7eec264c27ff"),
    img("nike", "photo-1556906781-9a412961c28c"),
  ],
  "caps": [
    img("cap", "photo-1588850561407-ed78c334e67a"),
    img("hat", "photo-1575428652377-a2d80e2277fc"),
  ],
  "backpacks": [
    img("backpack", "photo-1553062407-98eeb64c6a62"),
    img("bag", "photo-1581605405669-fcdf81165afa"),
  ],
  "gym-towels": [
    img("towel", "photo-1600369672770-985fd30004eb"),
    img("gym", "photo-1534438327276-14e5300c3a48"),
  ],
  "gym-bags": [
    img("gymbag", "photo-1553062407-98eeb64c6a62"),
    img("duffle", "photo-1581605405669-fcdf81165afa"),
  ],
  "smart-bottles": [
    img("smartbottle", "photo-1602143407151-7111542de6e8"),
    img("tech", "photo-1523362628745-0c100fc988ac"),
  ],
  "training-timers": [
    img("timer", "photo-1517836357463-d25dfeac3438"),
    img("clock", "photo-1434682881908-b43d0467b798"),
  ],
  "fitness-trackers": [
    img("fitnesstracker", "photo-1575311373937-040b8e1fd5b6"),
    img("watch", "photo-1557438159-51eec7a6c9e9"),
  ],
};

// ============================================================
// PRODUCTS DATA
// ============================================================

type ProductInput = {
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
};

const products: ProductInput[] = [
  // ===================== WHEY PROTEIN =====================
  { name: "Gold Standard 100% Whey", slug: "gold-standard-whey", description: "The world's best-selling whey protein powder. Packed with 24g of protein per serving, low in sugar, and fortified with amino acids for optimal muscle recovery and growth.", shortDesc: "24g protein per serving", productType: "Protein Powder", price: 289.00, compareAtPrice: 349.00, categorySlug: "whey-protein", brand: "Optimum Nutrition", sku: "ON-WP-GS-001", weight: 2.27, stock: 45, rating: 4.8, reviewCount: 2341, isFeatured: true, isBestSeller: true, isNew: false, tags: ["protein", "whey", "muscle", "recovery"], colors: ["Double Rich Chocolate", "Vanilla Ice Cream", "Strawberry Cream"], specs: { "Protein": "24g per serving", "BCAAs": "5.5g", "Servings": "29" } },
  { name: "Nitro-Tech Whey Gold", slug: "nitro-tech-whey-gold", description: "Premium whey protein isolate with added creatine and BCAAs. Engineered for serious athletes who demand the highest quality protein for lean muscle gains.", shortDesc: "Whey isolate + creatine", productType: "Protein Powder", price: 319.00, categorySlug: "whey-protein", brand: "MuscleTech", sku: "MT-WP-NTG-001", weight: 2.5, stock: 30, rating: 4.6, reviewCount: 876, isFeatured: false, isBestSeller: true, isNew: false, tags: ["protein", "whey", "creatine", "muscle"] },
  { name: "Syntha-6 Edge Protein", slug: "syntha-6-edge", description: "Slow-digesting protein blend designed to fuel muscle growth over extended periods. Perfect for between meals or before bed to keep your muscles nourished around the clock.", shortDesc: "Extended release protein", productType: "Protein Powder", price: 279.00, compareAtPrice: 329.00, categorySlug: "whey-protein", brand: "BSN", sku: "BSN-WP-S6E-001", weight: 2.27, stock: 25, rating: 4.5, reviewCount: 654, isFeatured: false, isBestSeller: false, isNew: false, tags: ["protein", "whey", "slow-digesting", "recovery"] },
  { name: "Elite Whey Protein", slug: "elite-whey", description: "High-quality whey protein concentrate at an unbeatable value. Perfect for beginners and intermediate lifters looking to increase their daily protein intake.", shortDesc: "Value whey protein", productType: "Protein Powder", price: 189.00, categorySlug: "whey-protein", brand: "Dymatize", sku: "DYM-WP-EL-001", weight: 1.81, stock: 60, rating: 4.4, reviewCount: 1203, isFeatured: false, isBestSeller: true, isNew: false, tags: ["protein", "whey", "value", "budget"] },

  // ===================== ISOLATE PROTEIN =====================
  { name: "ISO 100 Hydrolyzed Whey Isolate", slug: "iso-100-hydrolyzed", description: "100% hydrolyzed whey protein isolate, filtered to remove excess fat, carbs, and lactose. Fast-absorbing formula ideal for post-workout nutrition.", shortDesc: "Pure whey isolate", productType: "Protein Powder", price: 349.00, compareAtPrice: 399.00, categorySlug: "isolate-protein", brand: "Dymatize", sku: "DYM-WPI-100-001", weight: 2.27, stock: 35, rating: 4.7, reviewCount: 1567, isFeatured: true, isBestSeller: true, isNew: false, tags: ["protein", "isolate", "whey", "low-carb"] },
  { name: "Isopure Zero Carb Protein", slug: "isopure-zero-carb", description: "100% pure whey protein isolate with zero carbs and zero sugar. Ideal for keto diets and cutting phases where every gram of carb counts.", shortDesc: "Zero carb whey isolate", productType: "Protein Powder", price: 369.00, categorySlug: "isolate-protein", brand: "Isopure", sku: "ISP-WPI-ZC-001", weight: 1.36, stock: 20, rating: 4.6, reviewCount: 934, isFeatured: true, isBestSeller: false, isNew: false, tags: ["protein", "isolate", "zero-carb", "keto"] },
  { name: "Advanced Whey Isolate", slug: "advanced-whey-isolate", description: "Micro-filtered whey protein isolate delivering 27g of pure protein per serving with minimal fat and carbs. Perfect for lean muscle building.", shortDesc: "27g protein, low fat", productType: "Protein Powder", price: 299.00, categorySlug: "isolate-protein", brand: "Gaspari Nutrition", sku: "GN-WPI-ADV-001", weight: 2.0, stock: 18, rating: 4.3, reviewCount: 412, isFeatured: false, isBestSeller: false, isNew: true, tags: ["protein", "isolate", "lean", "low-fat"] },

  // ===================== HYDROLYZED PROTEIN =====================
  { name: "Platinum Hydrowhey Protein", slug: "platinum-hydrowhey", description: "100% hydrolyzed whey protein peptides for ultra-fast absorption. The most advanced whey protein for rapid muscle recovery after intense training sessions.", shortDesc: "Fastest absorbing whey", productType: "Protein Powder", price: 399.00, compareAtPrice: 449.00, categorySlug: "hydrolyzed-protein", brand: "Optimum Nutrition", sku: "ON-WPH-PL-001", weight: 1.59, stock: 15, rating: 4.7, reviewCount: 789, isFeatured: true, isBestSeller: false, isNew: false, tags: ["protein", "hydrolyzed", "fast-absorbing", "premium"] },

  // ===================== MASS GAINER =====================
  { name: "Serious Mass Weight Gainer", slug: "serious-mass", description: "High-calorie weight gainer with 1250 calories and 50g of protein per serving. Ideal for hardgainers who struggle to put on weight through diet alone.", shortDesc: "1250 calories per serving", productType: "Mass Gainer", price: 269.00, compareAtPrice: 319.00, categorySlug: "mass-gainer", brand: "Optimum Nutrition", sku: "ON-MG-SM-001", weight: 5.44, stock: 40, rating: 4.5, reviewCount: 1876, isFeatured: true, isBestSeller: true, isNew: false, tags: ["mass", "gainer", "calories", "weight-gain"] },
  { name: "Mega Mass 4000", slug: "mega-mass-4000", description: "Premium mass gainer delivering 4000 calories per serving with a blend of complex carbs and whey protein. Designed for extreme hardgainers.", shortDesc: "4000 calories per serving", productType: "Mass Gainer", price: 319.00, categorySlug: "mass-gainer", brand: "Weider", sku: "WDR-MG-MM4-001", weight: 7.0, stock: 22, rating: 4.3, reviewCount: 543, isFeatured: false, isBestSeller: false, isNew: true, tags: ["mass", "gainer", "extreme", "calories"] },
  { name: "True-Mass Recovery Shake", slug: "true-mass", description: "Balanced mass gainer with quality protein and complex carbs. Supports muscle recovery and growth without excessive sugar or fat.", shortDesc: "Balanced mass gainer", productType: "Mass Gainer", price: 249.00, categorySlug: "mass-gainer", brand: "BSN", sku: "BSN-MG-TM-001", weight: 3.2, stock: 28, rating: 4.4, reviewCount: 678, isFeatured: false, isBestSeller: true, isNew: false, tags: ["mass", "gainer", "recovery", "balanced"] },

  // ===================== CREATINE =====================
  { name: "Micronized Creatine Powder", slug: "micronized-creatine", description: "Pure micronized creatine monohydrate for increased strength, power, and muscle endurance. The most researched and proven supplement in sports nutrition.", shortDesc: "Pure creatine monohydrate", productType: "Creatine", price: 89.00, compareAtPrice: 119.00, categorySlug: "creatine", brand: "Optimum Nutrition", sku: "ON-CR-MC-001", weight: 0.63, stock: 80, rating: 4.7, reviewCount: 3456, isFeatured: true, isBestSeller: true, isNew: false, tags: ["creatine", "strength", "power", "endurance"] },
  { name: "Creatine HCL Capsules", slug: "creatine-hcl", description: "Creatine hydrochloride for superior solubility and absorption. No bloating, no loading phase required. Just pure creatine performance.", shortDesc: "HCL creatine capsules", productType: "Creatine", price: 129.00, categorySlug: "creatine", brand: "CON-CRET", sku: "CC-CR-HCL-001", weight: 0.15, stock: 45, rating: 4.5, reviewCount: 892, isFeatured: false, isBestSeller: false, isNew: false, tags: ["creatine", "hcl", "capsules", "absorption"] },
  { name: "Creatine Monohydrate Capsules", slug: "creatine-mono-caps", description: "Convenient creatine monohydrate capsules for on-the-go supplementation. 5g of pure creatine per serving for consistent muscle performance.", shortDesc: "Convenient creatine caps", productType: "Creatine", price: 99.00, categorySlug: "creatine", brand: "Optimum Nutrition", sku: "ON-CR-MC-002", weight: 0.3, stock: 55, rating: 4.6, reviewCount: 1234, isFeatured: false, isBestSeller: true, isNew: false, tags: ["creatine", "capsules", "convenience", "strength"] },

  // ===================== PRE-WORKOUT =====================
  { name: "Gold Standard Pre-Workout", slug: "gold-standard-pre-workout", description: "Explosive energy, focus, and endurance with 175mg caffeine, CarnoSyn beta-alanine, and L-theanine. Clean energy without the crash.", shortDesc: "175mg caffeine energy boost", productType: "Pre-Workout", price: 159.00, compareAtPrice: 189.00, categorySlug: "pre-workout", brand: "Optimum Nutrition", sku: "ON-PWO-GS-001", weight: 0.3, stock: 50, rating: 4.6, reviewCount: 2134, isFeatured: true, isBestSeller: true, isNew: false, tags: ["pre-workout", "energy", "focus", "endurance"] },
  { name: "N.O.-XPLODE Pre-Workout", slug: "no-xplode", description: "Legendary pre-workout formula for extreme energy and muscle pumps. Featuring explosive energy blend with creatine, beta-alanine, and caffeine.", shortDesc: "Explosive pre-workout", productType: "Pre-Workout", price: 179.00, categorySlug: "pre-workout", brand: "BSN", sku: "BSN-PWO-NX-001", weight: 0.52, stock: 35, rating: 4.4, reviewCount: 1567, isFeatured: false, isBestSeller: true, isNew: false, tags: ["pre-workout", "energy", "pump", "explosive"] },
  { name: "C4 Original Pre-Workout", slug: "c4-original", description: "America's number one pre-workout with explosive energy, endurance, and focus. Features CarnoSyn beta-alanine for fatigue resistance.", shortDesc: "#1 pre-workout in US", productType: "Pre-Workout", price: 149.00, compareAtPrice: 179.00, categorySlug: "pre-workout", brand: "Cellucor", sku: "CC-PWO-C4O-001", weight: 0.3, stock: 60, rating: 4.5, reviewCount: 3210, isFeatured: true, isBestSeller: true, isNew: false, tags: ["pre-workout", "energy", "endurance", "focus"] },

  // ===================== BCAA =====================
  { name: "BCAA Powder 2200", slug: "bcaa-2200", description: "Instantized BCAA powder with a 2:1:1 ratio of leucine, isoleucine, and valine. Supports muscle recovery and reduces exercise-induced soreness.", shortDesc: "2:1:1 BCAA ratio", productType: "BCAA", price: 119.00, compareAtPrice: 149.00, categorySlug: "bcaa", brand: "Optimum Nutrition", sku: "ON-BCAA-22-001", weight: 0.28, stock: 40, rating: 4.5, reviewCount: 1234, isFeatured: false, isBestSeller: true, isNew: false, tags: ["bcaa", "recovery", "soreness", "amino-acids"] },
  { name: "Amino Build Next Gen BCAA", slug: "amino-build", description: "Advanced BCAA formula with electrolytes and betaine for enhanced performance and hydration. Supports muscle endurance during prolonged training.", shortDesc: "BCAA + electrolytes", productType: "BCAA", price: 139.00, categorySlug: "bcaa", brand: "MuscleTech", sku: "MT-BCAA-AB-001", weight: 0.3, stock: 25, rating: 4.3, reviewCount: 567, isFeatured: false, isBestSeller: false, isNew: true, tags: ["bcaa", "electrolytes", "endurance", "hydration"] },

  // ===================== EAA =====================
  { name: "EAA + BCAA Complete Amino", slug: "eaa-bcaa-complete", description: "Full spectrum essential amino acid formula with all 9 EAAs plus additional BCAAs. Supports maximum muscle protein synthesis and recovery.", shortDesc: "Complete EAA blend", productType: "EAA", price: 149.00, categorySlug: "eaa", brand: "Xtend", sku: "XT-EAA-CMP-001", weight: 0.3, stock: 30, rating: 4.6, reviewCount: 876, isFeatured: true, isBestSeller: false, isNew: true, tags: ["eaa", "bcaa", "amino-acids", "recovery"] },

  // ===================== GLUTAMINE =====================
  { name: "Glutamine Powder", slug: "glutamine-powder", description: "Pure L-Glutamine for enhanced muscle recovery and immune system support. Helps reduce muscle breakdown during intense training periods.", shortDesc: "L-Glutamine recovery", productType: "Glutamine", price: 79.00, categorySlug: "glutamine", brand: "Optimum Nutrition", sku: "ON-GLUT-PW-001", weight: 0.63, stock: 50, rating: 4.4, reviewCount: 892, isFeatured: false, isBestSeller: false, isNew: false, tags: ["glutamine", "recovery", "immune", "amino-acids"] },

  // ===================== CASEIN =====================
  { name: "Gold Standard Casein", slug: "gold-standard-casein", description: "Slow-digesting micellar casein protein for sustained amino acid release overnight. Perfect before bed to prevent muscle breakdown during sleep.", shortDesc: "Slow-release casein", productType: "Protein Powder", price: 299.00, compareAtPrice: 349.00, categorySlug: "casein", brand: "Optimum Nutrition", sku: "ON-CS-GS-001", weight: 2.27, stock: 20, rating: 4.6, reviewCount: 987, isFeatured: true, isBestSeller: false, isNew: false, tags: ["casein", "slow-digesting", "overnight", "recovery"] },

  // ===================== RECOVERY =====================
  { name: "Pro-GT Recovery Formula", slug: "progt-recovery", description: "Advanced post-workout recovery blend with fast-absorbing whey isolate, glutamine, and electrolytes. Designed for rapid muscle repair after intense sessions.", shortDesc: "Post-workout recovery", productType: "Recovery", price: 199.00, categorySlug: "recovery", brand: "CytoSport", sku: "CS-REC-PGT-001", weight: 1.0, stock: 25, rating: 4.4, reviewCount: 456, isFeatured: false, isBestSeller: false, isNew: false, tags: ["recovery", "post-workout", "glutamine", "electrolytes"] },

  // ===================== ELECTROLYTES =====================
  { name: "Hydra-Major Electrolyte Mix", slug: "hydra-major", description: "Complete electrolyte formula with sodium, potassium, magnesium, and calcium. Keeps you hydrated during intense workouts and competitions.", shortDesc: "Full electrolyte blend", productType: "Electrolytes", price: 69.00, categorySlug: "electrolytes", brand: "Optimum Nutrition", sku: "ON-ELEC-HM-001", weight: 0.2, stock: 70, rating: 4.3, reviewCount: 654, isFeatured: false, isBestSeller: true, isNew: false, tags: ["electrolytes", "hydration", "minerals", "endurance"] },

  // ===================== VITAMINS =====================
  { name: "Opti-Men Daily Multivitamin", slug: "opti-men-multi", description: "Comprehensive multivitamin designed for active men with 75+ ingredients including vitamins, minerals, and amino blends for optimal performance.", shortDesc: "75+ ingredients multivitamin", productType: "Vitamin", price: 149.00, compareAtPrice: 179.00, categorySlug: "vitamins", brand: "Optimum Nutrition", sku: "ON-VIT-OM-001", weight: 0.4, stock: 55, rating: 4.5, reviewCount: 1876, isFeatured: true, isBestSeller: true, isNew: false, tags: ["vitamins", "multivitamin", "health", "daily"] },
  { name: "Opti-Women Daily Multivitamin", slug: "opti-women-multi", description: "Tailored multivitamin for active women with essential vitamins, minerals, and botanical extracts. Supports overall health and athletic performance.", shortDesc: "Women's multivitamin", productType: "Vitamin", price: 139.00, categorySlug: "vitamins", brand: "Optimum Nutrition", sku: "ON-VIT-OW-001", weight: 0.35, stock: 45, rating: 4.5, reviewCount: 1234, isFeatured: false, isBestSeller: true, isNew: false, tags: ["vitamins", "women", "health", "daily"] },

  // ===================== MINERALS =====================
  { name: "ZMA Recovery Complex", slug: "zma-recovery", description: "Zinc, Magnesium, and Vitamin B6 blend for enhanced recovery, improved sleep quality, and natural testosterone support.", shortDesc: "ZMA recovery blend", productType: "Mineral", price: 89.00, categorySlug: "minerals", brand: "Optimum Nutrition", sku: "ON-MIN-ZMA-001", weight: 0.15, stock: 60, rating: 4.4, reviewCount: 987, isFeatured: false, isBestSeller: false, isNew: false, tags: ["minerals", "zma", "recovery", "sleep"] },

  // ===================== OMEGA 3 =====================
  { name: "Triple Strength Fish Oil", slug: "triple-strength-fish-oil", description: "Ultra-pure omega-3 fish oil with 900mg EPA/DHA per softgel. Supports heart health, joint flexibility, and brain function.", shortDesc: "900mg EPA/DHA per softgel", productType: "Omega 3", price: 129.00, compareAtPrice: 159.00, categorySlug: "omega-3", brand: "Optimum Nutrition", sku: "ON-OM3-TSF-001", weight: 0.2, stock: 40, rating: 4.6, reviewCount: 1567, isFeatured: true, isBestSeller: true, isNew: false, tags: ["omega-3", "fish-oil", "heart", "joints"] },

  // ===================== FISH OIL =====================
  { name: "Ultra Pure Fish Oil", slug: "ultra-pure-fish-oil", description: "Molecularly distilled fish oil for maximum purity and potency. Supports cardiovascular health, brain function, and joint mobility.", shortDesc: "Molecularly distilled", productType: "Fish Oil", price: 99.00, categorySlug: "fish-oil", brand: "NOW Foods", sku: "NF-FO-UPF-001", weight: 0.25, stock: 35, rating: 4.5, reviewCount: 876, isFeatured: false, isBestSeller: false, isNew: false, tags: ["fish-oil", "omega-3", "heart", "purity"] },

  // ===================== COLLAGEN =====================
  { name: "Collagen Peptides Powder", slug: "collagen-peptides", description: "Hydrolyzed collagen peptides for healthy skin, hair, nails, and joints. Dissolves easily in hot or cold liquids for convenient daily supplementation.", shortDesc: "Hydrolyzed collagen for joints & skin", productType: "Collagen", price: 159.00, categorySlug: "collagen", brand: "Vital Proteins", sku: "VP-COL-PP-001", weight: 0.45, stock: 30, rating: 4.7, reviewCount: 2345, isFeatured: false, isBestSeller: true, isNew: false, tags: ["collagen", "joints", "skin", "hair"] },

  // ===================== JOINT SUPPORT =====================
  { name: "Joint Support Complex", slug: "joint-support-complex", description: "Advanced joint support formula with glucosamine, chondroitin, and MSM. Helps maintain healthy cartilage and joint flexibility for active individuals.", shortDesc: "Glucosamine + Chondroitin + MSM", productType: "Joint Support", price: 119.00, compareAtPrice: 149.00, categorySlug: "joint-support", brand: "Optimum Nutrition", sku: "ON-JSC-001", weight: 0.25, stock: 45, rating: 4.4, reviewCount: 1234, isFeatured: false, isBestSeller: true, isNew: false, tags: ["joint", "glucosamine", "msm", "flexibility"] },

  // ===================== FAT BURNERS =====================
  { name: "Hydroxycut Hardcore Elite", slug: "hydroxycut-hardcore", description: "Advanced thermogenic fat burner with caffeine, green tea extract, and cayenne pepper. Boosts metabolism and energy for effective weight management.", shortDesc: "Thermogenic fat burner", productType: "Fat Burner", price: 139.00, compareAtPrice: 169.00, categorySlug: "fat-burners", brand: "MuscleTech", sku: "MT-FB-HHE-001", weight: 0.2, stock: 30, rating: 4.3, reviewCount: 987, isFeatured: true, isBestSeller: false, isNew: false, tags: ["fat-burner", "thermogenic", "metabolism", "weight-loss"] },

  // ===================== TESTOSTERONE SUPPORT =====================
  { name: "Testosterone Booster Elite", slug: "test-booster-elite", description: "Natural testosterone support with D-Aspartic Acid, Fenugreek, and Zinc. Supports healthy testosterone levels for improved strength and performance.", shortDesc: "Natural T-booster", productType: "Testosterone Support", price: 149.00, categorySlug: "testosterone-support", brand: "BSN", sku: "BSN-TB-ELE-001", weight: 0.18, stock: 25, rating: 4.2, reviewCount: 567, isFeatured: false, isBestSeller: false, isNew: true, tags: ["testosterone", "booster", "strength", "natural"] },

  // ===================== HEALTHY SNACKS =====================
  { name: "Protein Peanut Butter Cups", slug: "protein-peanut-butter-cups", description: "Delicious high-protein peanut butter cups with 20g of protein per pack. Guilt-free snacking that satisfies your sweet tooth while fueling your muscles.", shortDesc: "20g protein snack", productType: "Snack", price: 29.00, categorySlug: "healthy-snacks", brand: "Quest Nutrition", sku: "QN-HS-PBC-001", weight: 0.12, stock: 80, rating: 4.5, reviewCount: 1234, isFeatured: false, isBestSeller: true, isNew: false, tags: ["snack", "protein", "peanut-butter", "guilt-free"] },
  { name: "Mixed Nuts Protein Blend", slug: "mixed-nuts-protein", description: "Premium blend of almonds, cashews, walnuts, and pecans with added protein. Perfect energy-boosting snack for athletes on the go.", shortDesc: "Premium nut protein blend", productType: "Snack", price: 39.00, categorySlug: "healthy-snacks", brand: "KIND", sku: "KIND-HS-MNB-001", weight: 0.2, stock: 65, rating: 4.4, reviewCount: 876, isFeatured: false, isBestSeller: false, isNew: false, tags: ["snack", "nuts", "protein", "energy"] },

  // ===================== PROTEIN BARS =====================
  { name: "Quest Protein Bar", slug: "quest-protein-bar", description: "High-fiber, low-sugar protein bar with 21g of protein and only 1g of sugar. Perfect meal replacement or post-workout snack.", shortDesc: "21g protein, 1g sugar", productType: "Protein Bar", price: 12.00, categorySlug: "protein-bars", brand: "Quest Nutrition", sku: "QN-PB-QPB-001", weight: 0.06, stock: 120, rating: 4.6, reviewCount: 3456, isFeatured: true, isBestSeller: true, isNew: false, tags: ["protein-bar", "low-sugar", "fiber", "snack"] },
  { name: "Fit & Lean Protein Bar", slug: "fit-lean-bar", description: "Clean protein bar with 20g of plant-based protein, no artificial sweeteners, and real food ingredients. Healthy snacking made easy.", shortDesc: "20g plant protein bar", productType: "Protein Bar", price: 14.00, compareAtPrice: 16.00, categorySlug: "protein-bars", brand: "RXBAR", sku: "RX-PB-FLB-001", weight: 0.05, stock: 90, rating: 4.4, reviewCount: 1567, isFeatured: false, isBestSeller: false, isNew: true, tags: ["protein-bar", "plant-based", "natural", "clean"] },

  // ===================== ENERGY DRINKS =====================
  { name: "Pre-Workout Energy Shot", slug: "pre-workout-shot", description: "Concentrated pre-workout energy shot with 300mg caffeine. Zero sugar, zero calories, maximum energy for your training session.", shortDesc: "300mg caffeine energy shot", productType: "Energy Drink", price: 15.00, categorySlug: "energy-drinks", brand: "5-Hour Energy", sku: "5HE-ED-PWS-001", weight: 0.06, stock: 100, rating: 4.3, reviewCount: 876, isFeatured: false, isBestSeller: true, isNew: false, tags: ["energy", "caffeine", "shot", "pre-workout"] },

  // ===================== SHAKERS =====================
  { name: "Steel Shaker Bottle 28oz", slug: "steel-shaker-28", description: "Premium stainless steel shaker bottle with leak-proof lid and mixing ball. BPA-free, dishwasher safe, keeps drinks cold for hours.", shortDesc: "Stainless steel shaker", productType: "Shaker", price: 49.00, compareAtPrice: 69.00, categorySlug: "shakers", brand: "BlenderBottle", sku: "BB-SH-SS28-001", weight: 0.35, stock: 50, rating: 4.7, reviewCount: 2345, isFeatured: true, isBestSeller: true, isNew: false, tags: ["shaker", "stainless-steel", "bpa-free", "insulated"] },
  { name: "Classic Shaker Bottle 20oz", slug: "classic-shaker-20", description: "The original BlenderBottle with wire whisk for smooth protein shakes. BPA-free plastic with secure screw-on lid.", shortDesc: "Classic protein shaker", productType: "Shaker", price: 25.00, categorySlug: "shakers", brand: "BlenderBottle", sku: "BB-SH-CS20-001", weight: 0.15, stock: 80, rating: 4.5, reviewCount: 4567, isFeatured: false, isBestSeller: true, isNew: false, tags: ["shaker", "classic", "bpa-free", "mixer"] },
  { name: "Smart Shaker with Timer", slug: "smart-shaker-timer", description: "Innovative shaker with built-in LED timer to track mixing intervals. Features measurement markings and leak-proof design.", shortDesc: "Shaker with built-in timer", productType: "Shaker", price: 59.00, categorySlug: "shakers", brand: "SmartShake", sku: "SS-SH-ST-001", weight: 0.2, stock: 35, rating: 4.3, reviewCount: 345, isFeatured: false, isBestSeller: false, isNew: true, tags: ["shaker", "smart", "timer", "innovative"] },

  // ===================== WATER BOTTLES =====================
  { name: "Sport Insulated Bottle 32oz", slug: "sport-insulated-32", description: "Double-wall vacuum insulated water bottle that keeps drinks cold for 24 hours or hot for 12. Durable stainless steel with ergonomic grip.", shortDesc: "24hr cold insulation", productType: "Water Bottle", price: 45.00, categorySlug: "water-bottles", brand: "Hydro Flask", sku: "HF-WB-SI32-001", weight: 0.4, stock: 60, rating: 4.7, reviewCount: 3210, isFeatured: true, isBestSeller: true, isNew: false, tags: ["water-bottle", "insulated", "stainless-steel", "cold"] },
  { name: "Collapsible Running Bottle", slug: "collapsible-running", description: "Ultra-light collapsible water bottle for runners and hikers. Folds flat when empty, holds 500ml when full. BPA-free and dishwasher safe.", shortDesc: "Collapsible 500ml bottle", productType: "Water Bottle", price: 22.00, categorySlug: "water-bottles", brand: "Nathan", sku: "N-WB-CRB-001", weight: 0.05, stock: 70, rating: 4.4, reviewCount: 876, isFeatured: false, isBestSeller: false, isNew: false, tags: ["water-bottle", "collapsible", "running", "lightweight"] },

  // ===================== BOXING GLOVES =====================
  { name: "Pro Training Boxing Gloves 16oz", slug: "pro-training-gloves-16", description: "Premium leather boxing gloves with multi-layer foam padding for maximum hand protection. Breathable lining and secure velcro closure.", shortDesc: "Premium leather 16oz gloves", productType: "Boxing Gloves", price: 189.00, compareAtPrice: 249.00, categorySlug: "boxing-gloves", brand: "Hayabusa", sku: "HB-BG-PT16-001", weight: 0.9, stock: 30, rating: 4.8, reviewCount: 1876, isFeatured: true, isBestSeller: true, isNew: false, tags: ["boxing", "gloves", "training", "leather"] },
  { name: "Beginner Boxing Gloves 12oz", slug: "beginner-gloves-12", description: "Durable synthetic leather boxing gloves perfect for beginners. Lightweight design with adequate padding for light sparring and bag work.", shortDesc: "Entry-level 12oz gloves", productType: "Boxing Gloves", price: 79.00, categorySlug: "boxing-gloves", brand: "Everlast", sku: "EV-BG-BG12-001", weight: 0.5, stock: 45, rating: 4.2, reviewCount: 2345, isFeatured: false, isBestSeller: true, isNew: false, tags: ["boxing", "gloves", "beginner", "affordable"] },
  { name: "Elite Sparring Gloves 14oz", slug: "elite-sparring-14", description: "Professional sparring gloves with extended wrist support and gel-infused padding. Designed for safety during partner training sessions.", shortDesc: "14oz sparring gloves", productType: "Boxing Gloves", price: 159.00, categorySlug: "boxing-gloves", brand: "Cleto Reyes", sku: "CR-BG-ES14-001", weight: 0.7, stock: 20, rating: 4.6, reviewCount: 567, isFeatured: false, isBestSeller: false, isNew: false, tags: ["boxing", "gloves", "sparring", "professional"] },

  // ===================== KICKBOXING GLOVES =====================
  { name: "Muay Thai Training Gloves 14oz", slug: "muaythai-gloves-14", description: "Specialized Muay Thai gloves with open palm design for clinch work and pad training. Premium leather with reinforced stitching.", shortDesc: "Muay Thai specific gloves", productType: "Kickboxing Gloves", price: 169.00, categorySlug: "kickboxing-gloves", brand: "Fairtex", sku: "FT-KBG-MTT-001", weight: 0.65, stock: 25, rating: 4.7, reviewCount: 876, isFeatured: true, isBestSeller: false, isNew: false, tags: ["kickboxing", "muay-thai", "gloves", "clinch"] },

  // ===================== MMA GLOVES =====================
  { name: "Competition MMA Gloves 4oz", slug: "competition-mma-4", description: "UFC-approved competition gloves with open finger design for grappling. Minimal padding for authentic fight feel with adequate knuckle protection.", shortDesc: "UFC-approved 4oz MMA gloves", productType: "MMA Gloves", price: 119.00, categorySlug: "mma-gloves", brand: "Venum", sku: "VN-MMA-C4-001", weight: 0.2, stock: 35, rating: 4.6, reviewCount: 1234, isFeatured: true, isBestSeller: true, isNew: false, tags: ["mma", "gloves", "competition", "ufc"] },
  { name: "Training MMA Gloves 7oz", slug: "training-mma-7", description: "Padded training MMA gloves for sparring and bag work. More protection than competition gloves while maintaining finger mobility.", shortDesc: "7oz training MMA gloves", productType: "MMA Gloves", price: 89.00, compareAtPrice: 109.00, categorySlug: "mma-gloves", brand: "Hayabusa", sku: "HB-MMA-T7-001", weight: 0.3, stock: 40, rating: 4.5, reviewCount: 654, isFeatured: false, isBestSeller: false, isNew: true, tags: ["mma", "gloves", "training", "sparring"] },

  // ===================== HAND WRAPS =====================
  { name: "Mexican Style Hand Wraps 180in", slug: "mexican-hand-wraps-180", description: "Traditional Mexican-style hand wraps with optimal stretch and compression. Provides essential wrist and knuckle support during training.", shortDesc: "180in stretch hand wraps", productType: "Hand Wraps", price: 29.00, categorySlug: "hand-wraps", brand: "Cleto Reyes", sku: "CR-HW-M180-001", weight: 0.12, stock: 80, rating: 4.5, reviewCount: 2345, isFeatured: false, isBestSeller: true, isNew: false, tags: ["hand-wraps", "mexican", "wrist-support", "boxing"] },
  { name: "Quick-Wrap Inner Gloves", slug: "quick-wrap-gloves", description: "Easy-on inner gloves with hook-and-loop closure for quick wrist wrapping. Gel-padded knuckle area for extra protection.", shortDesc: "Quick-apply inner gloves", productType: "Hand Wraps", price: 35.00, categorySlug: "hand-wraps", brand: "Fairtex", sku: "FT-HW-QWG-001", weight: 0.1, stock: 55, rating: 4.3, reviewCount: 876, isFeatured: false, isBestSeller: false, isNew: false, tags: ["hand-wraps", "inner-gloves", "quick", "gel-padded"] },

  // ===================== PUNCHING BAGS =====================
  { name: "Heavy Bag 100lb Muay Thai", slug: "heavy-bag-100-muaythai", description: "Premium Muay Thai heavy bag with extra length for low kicks. Filled with shredded textile for realistic impact and reduced noise.", shortDesc: "100lb Muay Thai heavy bag", productType: "Punching Bag", price: 349.00, compareAtPrice: 449.00, categorySlug: "punching-bags", brand: "Fairtex", sku: "FT-PB-HB100-001", weight: 45, stock: 15, rating: 4.8, reviewCount: 987, isFeatured: true, isBestSeller: true, isNew: false, tags: ["punching-bag", "heavy-bag", "muay-thai", "kick"] },
  { name: "Beginner Heavy Bag 70lb", slug: "beginner-heavy-bag-70", description: "Durable vinyl heavy bag for beginners. Chain and swivel included for easy ceiling mounting. Perfect for home gym setups.", shortDesc: "70lb beginner heavy bag", productType: "Punching Bag", price: 149.00, categorySlug: "punching-bags", brand: "Everlast", sku: "EV-PB-BHB70-001", weight: 32, stock: 25, rating: 4.2, reviewCount: 1234, isFeatured: false, isBestSeller: true, isNew: false, tags: ["punching-bag", "heavy-bag", "beginner", "home-gym"] },
  { name: "Water-Filled Punching Bag", slug: "water-punching-bag", description: "Innovative water-filled bag that simulates real opponent impact. Adjustable water level for varying resistance. Indoor/outdoor use.", shortDesc: "Water-filled for real feel", productType: "Punching Bag", price: 279.00, categorySlug: "punching-bags", brand: "Aqua Bag", sku: "AQ-PB-WFB-001", weight: 30, stock: 18, rating: 4.5, reviewCount: 456, isFeatured: false, isBestSeller: false, isNew: true, tags: ["punching-bag", "water-filled", "innovative", "indoor-outdoor"] },

  // ===================== SPEED BAGS =====================
  { name: "Professional Speed Bag", slug: "pro-speed-bag", description: "Genuine leather speed bag with reinforced bladder for consistent rebound. Improves hand-eye coordination and punching speed.", shortDesc: "Leather speed bag", productType: "Speed Bag", price: 69.00, categorySlug: "speed-bags", brand: "Everlast", sku: "EV-SB-PSB-001", weight: 0.5, stock: 30, rating: 4.4, reviewCount: 876, isFeatured: false, isBestSeller: true, isNew: false, tags: ["speed-bag", "leather", "coordination", "boxing"] },

  // ===================== DOUBLE END BAGS =====================
  { name: "Floor-to-Ceiling Double End Bag", slug: "double-end-bag", description: "Classic double end bag with elastic cords for unpredictable movement. Develops timing, accuracy, and defensive reflexes.", shortDesc: "Elastic double end bag", productType: "Double End Bag", price: 79.00, categorySlug: "double-end-bags", brand: "Ringside", sku: "RS-DEB-FC-001", weight: 1.0, stock: 20, rating: 4.3, reviewCount: 456, isFeatured: false, isBestSeller: false, isNew: false, tags: ["double-end-bag", "timing", "accuracy", "reflexes"] },

  // ===================== FOCUS MITTSS =====================
  { name: "Pro Focus Mitts Pair", slug: "pro-focus-mitts", description: "Premium leather focus mitts with thick padding for coach comfort. Curved design catches punches naturally. Essential for pad work training.", shortDesc: "Leather focus mitts", productType: "Focus Mitts", price: 89.00, compareAtPrice: 119.00, categorySlug: "focus-mitts", brand: "Fairtex", sku: "FT-FM-PM-001", weight: 0.4, stock: 35, rating: 4.6, reviewCount: 987, isFeatured: true, isBestSeller: true, isNew: false, tags: ["focus-mitts", "pad-work", "coaching", "training"] },

  // ===================== THAI PADS =====================
  { name: "Premium Thai Pads Pair", slug: "premium-thai-pads", description: "Heavy-duty Thai pads with forearm protection and thick shock-absorbing foam. Designed for powerful kicks, knees, and elbow strikes.", shortDesc: "Heavy-duty Thai pads", productType: "Thai Pads", price: 129.00, categorySlug: "thai-pads", brand: "Fairtex", sku: "FT-TP-PP-001", weight: 1.5, stock: 25, rating: 4.7, reviewCount: 654, isFeatured: true, isBestSeller: false, isNew: false, tags: ["thai-pads", "kickboxing", "knees", "pad-work"] },

  // ===================== SHIN GUARDS =====================
  { name: "Pro Shin Guards", slug: "pro-shin-guards", description: "Premium leather shin guards with thick EVA foam padding. Full shin and instep protection for Muay Thai and kickboxing training.", shortDesc: "Full shin + instep protection", productType: "Shin Guards", price: 89.00, compareAtPrice: 109.00, categorySlug: "shin-guards", brand: "Hayabusa", sku: "HB-SG-PG-001", weight: 0.5, stock: 40, rating: 4.6, reviewCount: 1234, isFeatured: false, isBestSeller: true, isNew: false, tags: ["shin-guards", "muay-thai", "kickboxing", "protection"] },
  { name: "Lightweight Sparring Shin Guards", slug: "light-sparring-shin", description: "Lightweight shin guards with slip-on design for quick transitions. Ideal for light sparring and drilling techniques.", shortDesc: "Lightweight slip-on guards", productType: "Shin Guards", price: 59.00, categorySlug: "shin-guards", brand: "Venum", sku: "VN-SG-LSG-001", weight: 0.3, stock: 50, rating: 4.3, reviewCount: 876, isFeatured: false, isBestSeller: false, isNew: true, tags: ["shin-guards", "lightweight", "sparring", "drilling"] },

  // ===================== HEAD GUARDS =====================
  { name: "Competition Head Guard", slug: "competition-head-guard", description: "Lightweight competition head guard with open face design for maximum visibility. Adjustable chin strap and ear protection.", shortDesc: "Open face competition guard", productType: "Head Guard", price: 79.00, categorySlug: "head-guards", brand: "Hayabusa", sku: "HB-HG-CG-001", weight: 0.3, stock: 30, rating: 4.5, reviewCount: 567, isFeatured: false, isBestSeller: true, isNew: false, tags: ["head-guard", "competition", "protection", "lightweight"] },

  // ===================== MOUTH GUARDS =====================
  { name: "Boil & Bite Mouth Guard", slug: "boil-bite-mouthguard", description: "Custom-fit mouth guard with boil and bite technology. Provides reliable dental protection for all combat sports.", shortDesc: "Custom-fit dental protection", productType: "Mouth Guard", price: 19.00, categorySlug: "mouth-guards", brand: "Venum", sku: "VN-MG-BB-001", weight: 0.03, stock: 100, rating: 4.3, reviewCount: 2345, isFeatured: false, isBestSeller: true, isNew: false, tags: ["mouth-guard", "dental", "protection", "combat-sports"] },

  // ===================== GROIN PROTECTORS =====================
  { name: "Pro Groin Guard", slug: "pro-groin-guard", description: "Mandatory groin protector with hard shell cup and adjustable elastic waistband. Comfortable fit with maximum protection.", shortDesc: "Hard shell groin guard", productType: "Groin Protector", price: 35.00, categorySlug: "groin-protectors", brand: "Ringside", sku: "RS-GP-PG-001", weight: 0.15, stock: 45, rating: 4.4, reviewCount: 876, isFeatured: false, isBestSeller: false, isNew: false, tags: ["groin-protector", "protection", "mandatory", "combat-sports"] },

  // ===================== JUMP ROPES =====================
  { name: "Speed Jump Rope Pro", slug: "speed-jump-rope-pro", description: "Ultra-fast ball bearing jump rope with adjustable cable length. Lightweight aluminum handles for maximum speed and control.", shortDesc: "Ball bearing speed rope", productType: "Jump Rope", price: 39.00, compareAtPrice: 55.00, categorySlug: "jump-ropes", brand: "Rogue", sku: "RG-JR-SP-001", weight: 0.15, stock: 60, rating: 4.6, reviewCount: 1234, isFeatured: true, isBestSeller: true, isNew: false, tags: ["jump-rope", "speed", "cardio", "boxing"] },
  { name: "Weighted Jump Rope", slug: "weighted-jump-rope", description: "Weighted handles for added resistance during jump rope training. Burns more calories and builds shoulder endurance.", shortDesc: "Weighted handles for resistance", productType: "Jump Rope", price: 35.00, categorySlug: "jump-ropes", brand: "RPM", sku: "RPM-JR-WJR-001", weight: 0.3, stock: 40, rating: 4.4, reviewCount: 654, isFeatured: false, isBestSeller: false, isNew: false, tags: ["jump-rope", "weighted", "resistance", "calories"] },

  // ===================== BOXING SHOES =====================
  { name: "Pro Boxing Boots", slug: "pro-boxing-boots", description: "Lightweight boxing boots with ankle support and non-marking soles. Designed for quick footwork and lateral movement in the ring.", shortDesc: "Lightweight ankle-support boots", productType: "Boxing Shoes", price: 159.00, compareAtPrice: 199.00, categorySlug: "boxing-shoes", brand: "Nike", sku: "NK-BS-PBB-001", weight: 0.6, stock: 25, rating: 4.7, reviewCount: 876, isFeatured: true, isBestSeller: false, isNew: false, tags: ["boxing-shoes", "boots", "ankle-support", "footwork"] },

  // ===================== RESISTANCE BANDS =====================
  { name: "Resistance Band Set 5-Pack", slug: "resistance-band-set-5", description: "Complete set of 5 resistance bands with progressive tension levels. Includes door anchor, handles, and ankle straps for full-body workouts.", shortDesc: "5 bands + accessories", productType: "Resistance Bands", price: 89.00, compareAtPrice: 119.00, categorySlug: "resistance-bands", brand: "TheraBand", sku: "TB-RB-5P-001", weight: 0.5, stock: 50, rating: 4.6, reviewCount: 2345, isFeatured: true, isBestSeller: true, isNew: false, tags: ["resistance-bands", "home-gym", "full-body", "travel"] },
  { name: "Power Loop Bands", slug: "power-loop-bands", description: "Fabric loop resistance bands for glute activation and lower body training. Anti-snap design with 3 resistance levels.", shortDesc: "Fabric loop bands", productType: "Resistance Bands", price: 45.00, categorySlug: "resistance-bands", brand: "BFR Bands", sku: "BFR-RB-PLB-001", weight: 0.15, stock: 60, rating: 4.5, reviewCount: 1234, isFeatured: false, isBestSeller: true, isNew: false, tags: ["resistance-bands", "loop", "glute", "lower-body"] },

  // ===================== DUMBBELLS =====================
  { name: "Adjustable Dumbbell Set 25lb", slug: "adjustable-dumbbell-25", description: "Space-saving adjustable dumbbells with quick-change weight selection. Replaces 15 sets of traditional dumbbells.", shortDesc: "Adjustable 5-25lb per dumbbell", productType: "Dumbbells", price: 399.00, compareAtPrice: 499.00, categorySlug: "dumbbells", brand: "Bowflex", sku: "BF-DB-AD25-001", weight: 11.3, stock: 15, rating: 4.7, reviewCount: 1876, isFeatured: true, isBestSeller: true, isNew: false, tags: ["dumbbells", "adjustable", "home-gym", "space-saving"] },
  { name: "Rubber Hex Dumbbells 20lb Pair", slug: "rubber-hex-20", description: "Commercial-grade rubber hex dumbbells with chrome handles. Anti-roll hex design protects floors and stays in place.", shortDesc: "20lb rubber hex pair", productType: "Dumbbells", price: 89.00, categorySlug: "dumbbells", brand: "Rogue", sku: "RG-DB-RH20-001", weight: 9.1, stock: 30, rating: 4.6, reviewCount: 987, isFeatured: false, isBestSeller: true, isNew: false, tags: ["dumbbells", "rubber", "hex", "commercial"] },

  // ===================== KETTLEBELLS =====================
  { name: "Cast Iron Kettlebell 16kg", slug: "cast-iron-kettlebell-16", description: "Premium cast iron kettlebell with powder-coated finish for secure grip. Wide handle for two-hand swings and single-arm exercises.", shortDesc: "16kg cast iron kettlebell", productType: "Kettlebells", price: 119.00, categorySlug: "kettlebells", brand: "Rogue", sku: "RG-KB-CI16-001", weight: 16, stock: 35, rating: 4.7, reviewCount: 1234, isFeatured: true, isBestSeller: true, isNew: false, tags: ["kettlebell", "cast-iron", "functional", "strength"] },
  { name: "Competition Kettlebell 24kg", slug: "competition-kettlebell-24", description: "Standardized competition kettlebell with uniform size regardless of weight. Color-coded for easy identification during training.", shortDesc: "24kg competition standard", productType: "Kettlebells", price: 189.00, categorySlug: "kettlebells", brand: "Kettlebell Kings", sku: "KK-KB-CK24-001", weight: 24, stock: 20, rating: 4.8, reviewCount: 567, isFeatured: false, isBestSeller: false, isNew: false, tags: ["kettlebell", "competition", "standardized", "professional"] },

  // ===================== WEIGHT PLATES =====================
  { name: "Olympic Bumper Plate Set 160lb", slug: "olympic-bumper-plates-160", description: "Vulcanized rubber bumper plates with stainless steel inserts. Dead bounce design minimizes bar bounce during Olympic lifts.", shortDesc: "160lb Olympic bumper set", productType: "Weight Plates", price: 599.00, compareAtPrice: 749.00, categorySlug: "weight-plates", brand: "Rogue", sku: "RG-WP-OBP160-001", weight: 72.6, stock: 10, rating: 4.8, reviewCount: 456, isFeatured: true, isBestSeller: false, isNew: false, tags: ["weight-plates", "olympic", "bumper", "dead-bounce"] },

  // ===================== BARBELLS =====================
  { name: "Ohio Power Bar 20kg", slug: "ohio-power-bar", description: "Competition-grade power bar with aggressive knurling and 205K PSI tensile strength. The gold standard for powerlifting.", shortDesc: "20kg powerlifting bar", productType: "Barbells", price: 449.00, categorySlug: "barbells", brand: "Rogue", sku: "RG-BB-OPB-001", weight: 20, stock: 12, rating: 4.9, reviewCount: 876, isFeatured: true, isBestSeller: true, isNew: false, tags: ["barbell", "powerlifting", "competition", "steel"] },

  // ===================== GYM BELTS =====================
  { name: "10mm Leather Powerlifting Belt", slug: "10mm-leather-belt", description: "Thick 10mm leather belt for maximum core support during heavy lifts. Single-prong buckle for quick adjustments.", shortDesc: "10mm thick leather belt", productType: "Gym Belt", price: 129.00, compareAtPrice: 159.00, categorySlug: "gym-belts", brand: "Inzer", sku: "IZ-GB-10ML-001", weight: 0.8, stock: 30, rating: 4.8, reviewCount: 1876, isFeatured: true, isBestSeller: true, isNew: false, tags: ["gym-belt", "powerlifting", "leather", "core-support"] },
  { name: "Nylon Weightlifting Belt", slug: "nylon-wl-belt", description: "Flexible nylon belt with Velcro closure for Olympic lifting and CrossFit. Lightweight design allows full range of motion.", shortDesc: "Flexible nylon Velcro belt", productType: "Gym Belt", price: 59.00, categorySlug: "gym-belts", brand: "Harbinger", sku: "HB-GB-NWL-001", weight: 0.2, stock: 45, rating: 4.4, reviewCount: 987, isFeatured: false, isBestSeller: true, isNew: false, tags: ["gym-belt", "nylon", "olympic", "crossfit"] },

  // ===================== WRIST WRAPS =====================
  { name: "Professional Wrist Wraps 18in", slug: "professional-wrist-wraps", description: "Stiff competition-grade wrist wraps for heavy pressing movements. Provides maximum wrist stability during bench press and overhead press.", shortDesc: "18in stiff wrist wraps", productType: "Wrist Wraps", price: 29.00, categorySlug: "wrist-wraps", brand: "Gymreapers", sku: "GR-WW-P18-001", weight: 0.08, stock: 60, rating: 4.6, reviewCount: 1234, isFeatured: false, isBestSeller: true, isNew: false, tags: ["wrist-wraps", "powerlifting", "stability", "pressing"] },

  // ===================== KNEE SLEEVES =====================
  { name: "7mm Neoprene Knee Sleeves", slug: "7mm-neoprene-knee", description: "Competition-grade 7mm neoprene knee sleeves for maximum joint support and warmth. Helps prevent knee injuries during heavy squats.", shortDesc: "7mm neoprene knee support", productType: "Knee Sleeves", price: 69.00, compareAtPrice: 89.00, categorySlug: "knee-sleeves", brand: "SBD", sku: "SBD-KS-7NN-001", weight: 0.2, stock: 35, rating: 4.8, reviewCount: 1876, isFeatured: true, isBestSeller: true, isNew: false, tags: ["knee-sleeves", "neoprene", "squat", "protection"] },

  // ===================== LIFTING STRAPS =====================
  { name: "Padded Lifting Straps", slug: "padded-lifting-straps", description: "Heavy-duty cotton lifting straps with neoprene padding for comfort. Eliminates grip fatigue during deadlifts and rows.", shortDesc: "Padded cotton straps", productType: "Lifting Straps", price: 19.00, categorySlug: "lifting-straps", brand: "Harbinger", sku: "HB-LS-PL-001", weight: 0.08, stock: 70, rating: 4.5, reviewCount: 876, isFeatured: false, isBestSeller: false, isNew: false, tags: ["lifting-straps", "deadlift", "grip", "padded"] },

  // ===================== FOAM ROLLERS =====================
  { name: "High-Density Foam Roller 36in", slug: "high-density-foam-roller", description: "EVA foam roller for deep tissue massage and myofascial release. Helps reduce muscle soreness and improve flexibility.", shortDesc: "36in high-density roller", productType: "Foam Roller", price: 39.00, compareAtPrice: 55.00, categorySlug: "foam-rollers", brand: "Trigger Point", sku: "TP-FR-HD36-001", weight: 0.8, stock: 50, rating: 4.6, reviewCount: 2345, isFeatured: true, isBestSeller: true, isNew: false, tags: ["foam-roller", "recovery", "flexibility", "massage"] },
  { name: "Grid Vibration Foam Roller", slug: "grid-vibration-roller", description: "Battery-powered vibrating foam roller with 4 intensity levels. Deep tissue vibration therapy for enhanced recovery.", shortDesc: "Vibrating foam roller", productType: "Foam Roller", price: 89.00, categorySlug: "foam-rollers", brand: "Hyperice", sku: "HI-FR-GV-001", weight: 1.0, stock: 25, rating: 4.5, reviewCount: 567, isFeatured: false, isBestSeller: false, isNew: true, tags: ["foam-roller", "vibration", "recovery", "high-tech"] },

  // ===================== MASSAGE GUNS =====================
  { name: "Massage Gun Pro", slug: "massage-gun-pro", description: "Professional percussion massage gun with 6 speed settings and 4 massage heads. Deep tissue therapy for muscle recovery.", shortDesc: "6-speed percussion gun", productType: "Massage Gun", price: 249.00, compareAtPrice: 349.00, categorySlug: "massage-guns", brand: "Theragun", sku: "TG-MG-PRO-001", weight: 0.7, stock: 20, rating: 4.8, reviewCount: 1876, isFeatured: true, isBestSeller: true, isNew: false, tags: ["massage-gun", "percussion", "recovery", "deep-tissue"] },
  { name: "Mini Massage Gun", slug: "mini-massage-gun", description: "Compact portable massage gun with 3 speed settings. Perfect for travel and on-the-go muscle relief. 4-hour battery life.", shortDesc: "Portable mini massage gun", productType: "Massage Gun", price: 99.00, categorySlug: "massage-guns", brand: "Theragun", sku: "TG-MG-MINI-001", weight: 0.35, stock: 30, rating: 4.5, reviewCount: 987, isFeatured: false, isBestSeller: false, isNew: true, tags: ["massage-gun", "mini", "portable", "travel"] },

  // ===================== YOGA MATS =====================
  { name: "Premium Yoga Mat 6mm", slug: "premium-yoga-mat-6mm", description: "Non-slip premium yoga mat with alignment markers. Eco-friendly TPE material for sustainable practice. Extra thick for joint comfort.", shortDesc: "6mm non-slip eco mat", productType: "Yoga Mat", price: 79.00, compareAtPrice: 99.00, categorySlug: "yoga-mats", brand: "Manduka", sku: "MD-YM-P6-001", weight: 1.8, stock: 40, rating: 4.7, reviewCount: 1234, isFeatured: true, isBestSeller: true, isNew: false, tags: ["yoga-mat", "non-slip", "eco-friendly", "alignment"] },
  { name: "Travel Yoga Mat", slug: "travel-yoga-mat", description: "Ultra-thin foldable yoga mat for travel. Weighs under 1kg and fits in any suitcase. Non-slip surface even when wet.", shortDesc: "Foldable travel mat", productType: "Yoga Mat", price: 59.00, categorySlug: "yoga-mats", brand: "Liforme", sku: "LF-YM-TR-001", weight: 0.9, stock: 35, rating: 4.5, reviewCount: 654, isFeatured: false, isBestSeller: false, isNew: false, tags: ["yoga-mat", "travel", "foldable", "lightweight"] },

  // ===================== T-SHIRTS =====================
  { name: "Performance Training Tee", slug: "performance-training-tee", description: "Moisture-wicking training t-shirt with 4-way stretch fabric. Anti-odor technology keeps you fresh through intense workouts.", shortDesc: "Moisture-wicking training tee", productType: "T-Shirt", price: 45.00, compareAtPrice: 59.00, categorySlug: "t-shirts", brand: "Nike", sku: "NK-TS-PT-001", weight: 0.15, stock: 60, rating: 4.5, reviewCount: 2345, isFeatured: true, isBestSeller: true, isNew: false, tags: ["t-shirt", "training", "moisture-wicking", "performance"], sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Black", "White", "Grey", "Navy"] },
  { name: "Cotton Gym T-Shirt", slug: "cotton-gym-tee", description: "Classic 100% cotton training tee with relaxed fit. Breathable fabric for comfortable gym sessions. Available in multiple colors.", shortDesc: "Classic cotton gym tee", productType: "T-Shirt", price: 29.00, categorySlug: "t-shirts", brand: "Under Armour", sku: "UA-TS-CGT-001", weight: 0.2, stock: 80, rating: 4.3, reviewCount: 1234, isFeatured: false, isBestSeller: true, isNew: false, tags: ["t-shirt", "cotton", "classic", "gym"], sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Black", "White", "Grey"] },

  // ===================== TANK TOPS =====================
  { name: "Stringer Tank Top", slug: "stringer-tank-top", description: "Sleeveless stringer tank with deep armholes for unrestricted movement. Show off your gains during training.", shortDesc: "Deep-cut stringer tank", productType: "Tank Top", price: 35.00, categorySlug: "tank-tops", brand: "Gymshark", sku: "GS-TT-ST-001", weight: 0.12, stock: 50, rating: 4.5, reviewCount: 987, isFeatured: true, isBestSeller: true, isNew: false, tags: ["tank-top", "stringer", "sleeveless", "gym"], sizes: ["S", "M", "L", "XL"], colors: ["Black", "White", "Grey"] },

  // ===================== HOODIES =====================
  { name: "Zip-Up Training Hoodie", slug: "zip-up-training-hoodie", description: "Lightweight zip-up hoodie with kangaroo pockets and thumbholes. Perfect for warm-ups and post-workout cool-downs.", shortDesc: "Lightweight zip hoodie", productType: "Hoodie", price: 89.00, compareAtPrice: 109.00, categorySlug: "hoodies", brand: "Nike", sku: "NK-HD-ZUT-001", weight: 0.5, stock: 35, rating: 4.6, reviewCount: 1234, isFeatured: true, isBestSeller: false, isNew: false, tags: ["hoodie", "zip-up", "training", "warm-up"], sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Black", "Grey", "Navy"] },

  // ===================== SHORTS =====================
  { name: "Gym Training Shorts 7in", slug: "gym-training-shorts-7", description: "7-inch inseam training shorts with built-in brief liner. Side pockets and elastic waistband for secure fit during any workout.", shortDesc: "7in training shorts", productType: "Shorts", price: 39.00, categorySlug: "shorts", brand: "Under Armour", sku: "UA-SH-GTS7-001", weight: 0.15, stock: 70, rating: 4.5, reviewCount: 2345, isFeatured: true, isBestSeller: true, isNew: false, tags: ["shorts", "training", "7-inch", "brief-liner"], sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Black", "Grey", "Navy", "Red"] },

  // ===================== JOGGERS =====================
  { name: "Fleece Joggers", slug: "fleece-joggers", description: "Comfortable fleece joggers with tapered legs and ribbed cuffs. Perfect for warm-ups, cool-downs, and casual gym wear.", shortDesc: "Soft fleece joggers", productType: "Joggers", price: 69.00, compareAtPrice: 89.00, categorySlug: "joggers", brand: "Adidas", sku: "AD-JG-FJ-001", weight: 0.4, stock: 40, rating: 4.5, reviewCount: 1234, isFeatured: false, isBestSeller: true, isNew: false, tags: ["joggers", "fleece", "comfortable", "warm-up"], sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Black", "Grey", "Navy"] },

  // ===================== COMPRESSION WEAR =====================
  { name: "Compression Tights", slug: "compression-tights", description: "Graduated compression tights for enhanced blood flow and muscle support. Helps reduce fatigue and speeds up recovery.", shortDesc: "Graduated compression tights", productType: "Compression Wear", price: 79.00, compareAtPrice: 99.00, categorySlug: "compression-wear", brand: "Under Armour", sku: "UA-CW-CT-001", weight: 0.2, stock: 35, rating: 4.6, reviewCount: 876, isFeatured: true, isBestSeller: false, isNew: false, tags: ["compression", "tights", "recovery", "blood-flow"], sizes: ["S", "M", "L", "XL"], colors: ["Black", "Grey"] },

  // ===================== LEGGINGS =====================
  { name: "High-Waist Training Leggings", slug: "high-waist-leggings", description: "Squat-proof high-waist leggings with hidden pocket. Buttery soft fabric with 4-way stretch for unrestricted movement.", shortDesc: "Squat-proof high-waist", productType: "Leggings", price: 59.00, categorySlug: "leggings", brand: "Gymshark", sku: "GS-LG-HWL-001", weight: 0.2, stock: 45, rating: 4.7, reviewCount: 1876, isFeatured: true, isBestSeller: true, isNew: false, tags: ["leggings", "high-waist", "squat-proof", "training"], sizes: ["XS", "S", "M", "L", "XL"], colors: ["Black", "Grey", "Navy"] },

  // ===================== SPORTS BRAS =====================
  { name: "High-Impact Sports Bra", slug: "high-impact-sports-bra", description: "High-impact sports bra with adjustable straps and underband support. Moisture-wicking fabric keeps you dry during intense workouts.", shortDesc: "High-impact support", productType: "Sports Bra", price: 45.00, compareAtPrice: 55.00, categorySlug: "sports-bras", brand: "Nike", sku: "NK-SB-HI-001", weight: 0.1, stock: 50, rating: 4.6, reviewCount: 1234, isFeatured: true, isBestSeller: true, isNew: false, tags: ["sports-bra", "high-impact", "support", "moisture-wicking"], sizes: ["XS", "S", "M", "L", "XL"], colors: ["Black", "White", "Grey"] },

  // ===================== BOXING SHORTS =====================
  { name: "Muay Thai Boxing Shorts", slug: "muay-thai-boxing-shorts", description: "Traditional satin Muay Thai shorts with wide leg openings for unrestricted kicking. Embroidered Thai lettering.", shortDesc: "Traditional satin Muay Thai", productType: "Boxing Shorts", price: 49.00, categorySlug: "boxing-shorts", brand: "Fairtex", sku: "FT-BS-MTB-001", weight: 0.15, stock: 40, rating: 4.5, reviewCount: 876, isFeatured: true, isBestSeller: false, isNew: false, tags: ["boxing-shorts", "muay-thai", "satin", "traditional"], sizes: ["S", "M", "L", "XL"], colors: ["Red", "Blue", "Black", "White"] },

  // ===================== KICKBOXING UNIFORMS =====================
  { name: "Kickboxing Gi Uniform", slug: "kickboxing-gi-uniform", description: "Traditional cotton kickboxing gi with reinforced stitching. Lightweight and breathable for maximum comfort during training.", shortDesc: "Cotton kickboxing gi", productType: "Kickboxing Uniform", price: 79.00, compareAtPrice: 99.00, categorySlug: "kickboxing-uniforms", brand: "Venum", sku: "VN-KU-001", weight: 0.8, stock: 25, rating: 4.4, reviewCount: 456, isFeatured: false, isBestSeller: false, isNew: false, tags: ["kickboxing", "uniform", "gi", "cotton"], sizes: ["S", "M", "L", "XL"], colors: ["White", "Black", "Blue"] },

  // ===================== GYM SHOES =====================
  { name: "CrossFit Training Shoe", slug: "crossfit-training-shoe", description: "Versatile training shoe with rope-grip outsole and flexible forefoot. Designed for CrossFit, lifting, and HIIT workouts.", shortDesc: "Versatile CrossFit shoe", productType: "Gym Shoes", price: 139.00, compareAtPrice: 169.00, categorySlug: "gym-shoes", brand: "Nike", sku: "NK-GS-CFT-001", weight: 0.4, stock: 30, rating: 4.7, reviewCount: 1876, isFeatured: true, isBestSeller: true, isNew: false, tags: ["gym-shoes", "crossfit", "training", "rope-grip"], sizes: ["7", "8", "9", "10", "11", "12"], colors: ["Black/White", "Grey/Red", "Blue/White"] },
  { name: "Weightlifting Shoe", slug: "weightlifting-shoe", description: "Elevated heel weightlifting shoe with wooden heel for optimal squat depth. Non-compressible sole for maximum power transfer.", shortDesc: "Elevated heel lifting shoe", productType: "Gym Shoes", price: 199.00, categorySlug: "gym-shoes", brand: "Nike", sku: "NK-GS-WLS-001", weight: 0.5, stock: 20, rating: 4.8, reviewCount: 987, isFeatured: false, isBestSeller: false, isNew: false, tags: ["gym-shoes", "weightlifting", "squat", "elevated-heel"], sizes: ["7", "8", "9", "10", "11"], colors: ["White", "Black", "Red"] },

  // ===================== CAPS =====================
  { name: "Performance Training Cap", slug: "performance-training-cap", description: "Lightweight training cap with sweatband and adjustable strap. Reflective logo for visibility during outdoor training.", shortDesc: "Lightweight training cap", productType: "Cap", price: 29.00, categorySlug: "caps", brand: "Nike", sku: "NK-CAP-PT-001", weight: 0.08, stock: 60, rating: 4.4, reviewCount: 876, isFeatured: false, isBestSeller: true, isNew: false, tags: ["cap", "training", "lightweight", "outdoor"], colors: ["Black", "White", "Grey"] },

  // ===================== BACKPACKS =====================
  { name: "Gym Training Backpack", slug: "gym-training-backpack", description: "Spacious gym backpack with ventilated shoe compartment and laptop sleeve. Water-resistant material keeps your gear dry.", shortDesc: "Ventilated shoe compartment", productType: "Backpack", price: 79.00, compareAtPrice: 99.00, categorySlug: "backpacks", brand: "Nike", sku: "NK-BP-GTB-001", weight: 0.8, stock: 35, rating: 4.6, reviewCount: 1234, isFeatured: true, isBestSeller: true, isNew: false, tags: ["backpack", "gym", "shoe-compartment", "water-resistant"], colors: ["Black", "Grey", "Navy"] },

  // ===================== GYM TOWELS =====================
  { name: "Microfiber Gym Towel Set", slug: "microfiber-gym-towel-set", description: "Set of 3 quick-dry microfiber towels. Ultra-absorbent and compact. Machine washable for easy care.", shortDesc: "3-pack microfiber towels", productType: "Gym Towel", price: 25.00, categorySlug: "gym-towels", brand: "Yoga Design Lab", sku: "YDL-GT-MFS-001", weight: 0.3, stock: 80, rating: 4.4, reviewCount: 654, isFeatured: false, isBestSeller: true, isNew: false, tags: ["gym-towel", "microfiber", "quick-dry", "set"], colors: ["Black", "Grey", "Blue"] },

  // ===================== GYM BAGS =====================
  { name: "Large Duffle Gym Bag", slug: "large-duffle-gym-bag", description: "Spacious duffle bag with separate shoe compartment, wet pocket, and multiple organizer pockets. Fits all your gym essentials.", shortDesc: "Large duffle with shoe pocket", productType: "Gym Bag", price: 89.00, compareAtPrice: 119.00, categorySlug: "gym-bags", brand: "Under Armour", sku: "UA-GB-LDG-001", weight: 1.0, stock: 30, rating: 4.6, reviewCount: 1876, isFeatured: true, isBestSeller: true, isNew: false, tags: ["gym-bag", "duffle", "shoe-pocket", "spacious"], colors: ["Black", "Grey", "Navy"] },

  // ===================== SMART BOTTLES =====================
  { name: "LED Temperature Smart Bottle", slug: "led-smart-bottle", description: "Stainless steel smart bottle with LED temperature display. Insulated to keep drinks cold for 24 hours or hot for 12.", shortDesc: "LED temperature display", productType: "Smart Bottle", price: 49.00, categorySlug: "smart-bottles", brand: "Hydro Flask", sku: "HF-SB-LTB-001", weight: 0.4, stock: 25, rating: 4.5, reviewCount: 567, isFeatured: false, isBestSeller: false, isNew: true, tags: ["smart-bottle", "led", "temperature", "insulated"], colors: ["Black", "White", "Blue"] },

  // ===================== TRAINING TIMERS =====================
  { name: "Interval Training Timer", slug: "interval-training-timer", description: "Programmable interval timer with multiple preset workouts. Large LED display and loud buzzer for HIIT and Tabata training.", shortDesc: "Programmable HIIT timer", productType: "Training Timer", price: 45.00, compareAtPrice: 59.00, categorySlug: "training-timers", brand: "Rogue", sku: "RG-TT-ITT-001", weight: 0.3, stock: 40, rating: 4.5, reviewCount: 876, isFeatured: true, isBestSeller: true, isNew: false, tags: ["timer", "hiit", "tabata", "interval"], colors: ["Black", "Red"] },

  // ===================== FITNESS TRACKERS =====================
  { name: "Sport Fitness Watch", slug: "sport-fitness-watch", description: "Advanced fitness tracker with heart rate monitor, GPS, and 20+ sport modes. Water-resistant to 50 meters with 7-day battery life.", shortDesc: "GPS fitness watch", productType: "Fitness Tracker", price: 199.00, compareAtPrice: 249.00, categorySlug: "fitness-trackers", brand: "Garmin", sku: "GM-FT-SFW-001", weight: 0.05, stock: 25, rating: 4.7, reviewCount: 1876, isFeatured: true, isBestSeller: true, isNew: false, tags: ["fitness-tracker", "gps", "heart-rate", "sport-modes"], colors: ["Black", "White", "Blue"] },
];

// ============================================================
// MAIN SEED FUNCTION
// ============================================================

async function main() {
  console.log("🏋️  Starting shop seed...\n");

  // 1. Upsert all categories
  console.log(`📁 Creating ${categories.length} categories...`);
  const categoryMap: Record<string, number> = {};

  for (const cat of categories) {
    const created = await prisma.shopCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, sortOrder: cat.sortOrder, isActive: true },
      create: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        description: `${cat.group} — ${cat.name}`,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    });
    categoryMap[cat.slug] = created.id;
    process.stdout.write(`  ✓ ${cat.name}\n`);
  }

  // 2. Create all products
  console.log(`\n📦 Creating ${products.length} products...`);

  let created = 0;
  let updated = 0;

  for (const p of products) {
    const categoryId = categoryMap[p.categorySlug];
    if (!categoryId) {
      console.error(`  ✗ Category not found for slug: ${p.categorySlug} (product: ${p.name})`);
      continue;
    }

    const images = IMAGES[p.categorySlug] || [];

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
          images: JSON.stringify(images),
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
          images: JSON.stringify(images),
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

      if (result.createdAt.getTime() === result.updatedAt.getTime()) {
        created++;
      } else {
        updated++;
      }
      process.stdout.write(`  ✓ ${p.name}\n`);
    } catch (e) {
      console.error(`  ✗ ${p.name}: ${e}`);
    }
  }

  // 3. Summary
  console.log(`\n✅ Seed complete!`);
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Products:   ${created} created, ${updated} updated`);
  console.log(`   Total:      ${created + updated} products`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
