import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🏪 Seeding shop categories and products...");

  // ── Categories ──
  const categories = await Promise.all(
    [
      { name: "Protein & Supplements", slug: "protein-supplements", description: "High-quality protein powders, BCAAs, and performance supplements", icon: "flask-conical", sortOrder: 1 },
      { name: "Boxing Equipment", slug: "boxing-equipment", description: "Professional boxing gear for training and competition", icon: "swords", sortOrder: 2 },
      { name: "Gym Accessories", slug: "gym-accessories", description: "Essential accessories for your gym sessions", icon: "dumbbell", sortOrder: 3 },
      { name: "Resistance Bands", slug: "resistance-bands", description: "Versatile training bands for all fitness levels", icon: "activity", sortOrder: 4 },
      { name: "Shakers & Bottles", slug: "shakers-bottles", description: "Premium shakers and water bottles", icon: "cup-soda", sortOrder: 5 },
      { name: "Sports Bags", slug: "sports-bags", description: "Durable bags for your gym essentials", icon: "briefcase", sortOrder: 6 },
      { name: "Training Clothing", slug: "training-clothing", description: "Performance apparel for training", icon: "shirt", sortOrder: 7 },
      { name: "Fitness Equipment", slug: "fitness-equipment", description: "Equipment for home and gym workouts", icon: "bike", sortOrder: 8 },
      { name: "Recovery & Massage", slug: "recovery-massage", description: "Tools for muscle recovery and massage", icon: "heart-pulse", sortOrder: 9 },
      { name: "Healthy Snacks", slug: "healthy-snacks", description: "Nutritious snacks for active lifestyles", icon: "apple", sortOrder: 10 },
      { name: "Gloves & Wraps", slug: "gloves-wraps", description: "Hand protection for combat sports", icon: "hand", sortOrder: 11 },
      { name: "Fitness Accessories", slug: "fitness-accessories", description: "Miscellaneous fitness gear and accessories", icon: "settings", sortOrder: 12 },
    ].map((c) =>
      prisma.shopCategory.create({
        data: c,
      })
    )
  );

  console.log(`✅ ${categories.length} categories created`);

  const catMap = new Map(categories.map((c) => [c.slug, c.id]));

  // ── Products ──
  const products = [
    // Protein & Supplements
    { name: "Whey Protein Isolate 1kg", slug: "whey-protein-isolate-1kg", description: "Premium whey protein isolate with 27g protein per serving. Fast-absorbing, low carb formula for lean muscle building.", shortDesc: "27g protein per serving, low carb", price: 89.9, compareAtPrice: 109.9, categoryId: catMap.get("protein-supplements")!, brand: "Tayamo Nutrition", stock: 45, rating: 4.8, reviewCount: 124, isFeatured: true, isBestSeller: true, tags: JSON.stringify(["protein", "whey", "supplement", "muscle"]), specifications: JSON.stringify({ weight: "1kg", flavor: "Chocolate", servings: 30, protein: "27g" }) },
    { name: "Creatine Monohydrate 500g", slug: "creatine-monohydrate-500g", description: "Pure creatine monohydrate for enhanced strength and power output. Micronized for better absorption.", shortDesc: "Pure creatine, micronized", price: 34.9, compareAtPrice: null, categoryId: catMap.get("protein-supplements")!, brand: "Tayamo Nutrition", stock: 80, rating: 4.7, reviewCount: 89, isFeatured: true, tags: JSON.stringify(["creatine", "strength", "power"]), specifications: JSON.stringify({ weight: "500g", servings: 100, type: "Monohydrate" }) },
    { name: "Pre-Workout Extreme", slug: "pre-workout-extreme", description: "High-energy pre-workout formula with caffeine, beta-alanine, and citrulline for maximum performance.", shortDesc: "Maximum energy & focus", price: 49.9, compareAtPrice: 59.9, categoryId: catMap.get("protein-supplements")!, brand: "Tayamo Nutrition", stock: 35, rating: 4.6, reviewCount: 67, isNew: true, tags: JSON.stringify(["pre-workout", "energy", "focus"]), specifications: JSON.stringify({ weight: "300g", flavor: "Blue Raspberry", servings: 30 }) },
    { name: "BCAA Recovery Powder", slug: "bcaa-recovery-powder", description: "Branched-chain amino acids for faster muscle recovery and reduced soreness.", shortDesc: "Fast recovery formula", price: 42.9, compareAtPrice: null, categoryId: catMap.get("protein-supplements")!, brand: "Tayamo Nutrition", stock: 50, rating: 4.5, reviewCount: 43, tags: JSON.stringify(["bcaa", "recovery", "amino"]), specifications: JSON.stringify({ weight: "300g", flavor: "Tropical Fruit", servings: 30 }) },
    { name: "Multivitamin Complex", slug: "multivitamin-complex", description: "Complete daily multivitamin with 25 essential vitamins and minerals for active individuals.", shortDesc: "25 essential vitamins", price: 29.9, compareAtPrice: null, categoryId: catMap.get("protein-supplements")!, brand: "Tayamo Nutrition", stock: 60, rating: 4.4, reviewCount: 56, tags: JSON.stringify(["vitamin", "health", "daily"]), specifications: JSON.stringify({ count: 60, type: "Capsules" }) },

    // Boxing Equipment
    { name: "Pro Boxing Gloves 14oz", slug: "pro-boxing-gloves-14oz", description: "Professional-grade leather boxing gloves with multi-layer foam padding for maximum hand protection.", shortDesc: "Premium leather, 14oz", price: 79.9, compareAtPrice: 99.9, categoryId: catMap.get("boxing-equipment")!, brand: "Tayamo Fight", stock: 25, rating: 4.9, reviewCount: 78, isFeatured: true, isBestSeller: true, tags: JSON.stringify(["boxing", "gloves", "fight"]), specifications: JSON.stringify({ weight: "14oz", material: "Genuine Leather", color: "Black/Gold" }) },
    { name: "Punching Bag 50kg", slug: "punching-bag-50kg", description: "Heavy-duty filled punching bag with reinforced chains and premium synthetic leather cover.", shortDesc: "Heavy-duty, 50kg", price: 149.9, compareAtPrice: 189.9, categoryId: catMap.get("boxing-equipment")!, brand: "Tayamo Fight", stock: 15, rating: 4.7, reviewCount: 45, isFeatured: true, tags: JSON.stringify(["punching-bag", "boxing", "heavy-bag"]), specifications: JSON.stringify({ weight: "50kg", height: "120cm", material: "Synthetic Leather" }) },
    { name: "Speed Jump Rope Pro", slug: "speed-jump-rope-pro", description: "Ultra-fast ball bearing jump rope with adjustable cable. Perfect for boxing conditioning.", shortDesc: "Ball bearing, adjustable", price: 24.9, compareAtPrice: null, categoryId: catMap.get("boxing-equipment")!, brand: "Tayamo Fight", stock: 70, rating: 4.6, reviewCount: 92, isBestSeller: true, tags: JSON.stringify(["jump-rope", "speed", "conditioning"]), specifications: JSON.stringify({ length: "3m adjustable", material: "Steel Cable" }) },

    // Gym Accessories
    { name: "Lifting Gloves Pro", slug: "lifting-gloves-pro", description: "Premium leather lifting gloves with wrist support and anti-slip palm padding.", shortDesc: "Leather, wrist support", price: 29.9, compareAtPrice: null, categoryId: catMap.get("gym-accessories")!, brand: "Tayamo Gear", stock: 40, rating: 4.5, reviewCount: 65, tags: JSON.stringify(["gloves", "lifting", "gym"]), specifications: JSON.stringify({ material: "Genuine Leather", sizes: "S/M/L/XL" }) },
    { name: "Gym Towel Premium", slug: "gym-towel-premium", description: "Ultra-absorbent microfiber gym towel with Tayamo branding. Quick-dry technology.", shortDesc: "Microfiber, quick-dry", price: 14.9, compareAtPrice: null, categoryId: catMap.get("gym-accessories")!, brand: "Tayamo Gear", stock: 100, rating: 4.3, reviewCount: 34, tags: JSON.stringify(["towel", "gym", "microfiber"]), specifications: JSON.stringify({ size: "80x40cm", material: "Microfiber" }) },

    // Resistance Bands
    { name: "Resistance Band Set (5 levels)", slug: "resistance-band-set-5", description: "Complete set of 5 resistance bands from light to heavy. Includes door anchor and carry bag.", shortDesc: "5 levels, full set", price: 34.9, compareAtPrice: 44.9, categoryId: catMap.get("resistance-bands")!, brand: "Tayamo Gear", stock: 55, rating: 4.7, reviewCount: 88, isFeatured: true, isBestSeller: true, tags: JSON.stringify(["resistance", "bands", "flexibility"]), specifications: JSON.stringify({ levels: "5 (5-50 lbs)", includes: "Door anchor, carry bag" }) },
    { name: "Fabric Booty Band Set", slug: "fabric-booty-band-set", description: "Premium fabric resistance bands for glute and leg workouts. Non-slip design.", shortDesc: "Fabric, non-slip", price: 24.9, compareAtPrice: null, categoryId: catMap.get("resistance-bands")!, brand: "Tayamo Gear", stock: 45, rating: 4.6, reviewCount: 56, tags: JSON.stringify(["booty-band", "glute", "fabric"]), specifications: JSON.stringify({ levels: "3 (Light/Medium/Heavy)", material: "Fabric" }) },

    // Shakers & Bottles
    { name: "Tayamo Shaker Bottle 700ml", slug: "tayamo-shaker-700ml", description: "BPA-free shaker bottle with mixing ball and storage compartment. Premium Tayamo branding.", shortDesc: "BPA-free, 700ml", price: 14.9, compareAtPrice: null, categoryId: catMap.get("shakers-bottles")!, brand: "Tayamo Gear", stock: 120, rating: 4.4, reviewCount: 112, isBestSeller: true, tags: JSON.stringify(["shaker", "bottle", "drink"]), specifications: JSON.stringify({ capacity: "700ml", material: "BPA-free Plastic", color: "Black/Gold" }) },
    { name: "Insulated Water Bottle 1L", slug: "insulated-water-bottle-1l", description: "Double-wall insulated stainless steel water bottle. Keeps drinks cold for 24 hours.", shortDesc: "Steel, insulated 24h", price: 24.9, compareAtPrice: null, categoryId: catMap.get("shakers-bottles")!, brand: "Tayamo Gear", stock: 65, rating: 4.7, reviewCount: 78, tags: JSON.stringify(["bottle", "insulated", "steel"]), specifications: JSON.stringify({ capacity: "1000ml", material: "Stainless Steel", insulation: "24h cold / 12h hot" }) },

    // Sports Bags
    { name: "Gym Duffle Bag XL", slug: "gym-duffle-bag-xl", description: "Spacious gym duffle bag with shoe compartment and wet pocket. Water-resistant material.", shortDesc: "XL, shoe compartment", price: 59.9, compareAtPrice: 74.9, categoryId: catMap.get("sports-bags")!, brand: "Tayamo Gear", stock: 30, rating: 4.8, reviewCount: 67, isFeatured: true, tags: JSON.stringify(["bag", "duffle", "gym"]), specifications: JSON.stringify({ capacity: "65L", material: "Water-resistant Nylon", compartments: "3" }) },

    // Training Clothing
    { name: "Performance Training Tee", slug: "performance-training-tee", description: "Moisture-wicking training t-shirt with Tayamo logo. Breathable mesh panels.", shortDesc: "Moisture-wicking, breathable", price: 34.9, compareAtPrice: null, categoryId: catMap.get("training-clothing")!, brand: "Tayamo Apparel", stock: 80, rating: 4.5, reviewCount: 94, isNew: true, tags: JSON.stringify(["shirt", "training", "apparel"]), specifications: JSON.stringify({ sizes: "S/M/L/XL/XXL", material: "Polyester Blend", colors: "Black, White, Gold" }) },
    { name: "Compression Shorts", slug: "compression-shorts", description: "High-performance compression shorts for training and recovery. Anti-odor technology.", shortDesc: "Compression, anti-odor", price: 29.9, compareAtPrice: null, categoryId: catMap.get("training-clothing")!, brand: "Tayamo Apparel", stock: 60, rating: 4.6, reviewCount: 56, tags: JSON.stringify(["shorts", "compression", "training"]), specifications: JSON.stringify({ sizes: "S/M/L/XL", material: "Spandex/Nylon" }) },

    // Fitness Equipment
    { name: "Adjustable Dumbbell Set", slug: "adjustable-dumbbell-set", description: "Space-saving adjustable dumbbells from 2-20kg. Quick-lock mechanism.", shortDesc: "2-20kg adjustable", price: 199.9, compareAtPrice: 249.9, categoryId: catMap.get("fitness-equipment")!, brand: "Tayamo Pro", stock: 12, rating: 4.9, reviewCount: 34, isFeatured: true, tags: JSON.stringify(["dumbbell", "adjustable", "weights"]), specifications: JSON.stringify({ weight: "2-20kg each", mechanism: "Quick-lock", material: "Steel/Rubber" }) },
    { name: "Yoga Mat Premium 6mm", slug: "yoga-mat-premium-6mm", description: "Non-slip eco-friendly yoga mat with alignment marks. Extra thick 6mm cushioning.", shortDesc: "Non-slip, eco-friendly", price: 39.9, compareAtPrice: null, categoryId: catMap.get("fitness-equipment")!, brand: "Tayamo Gear", stock: 45, rating: 4.7, reviewCount: 78, tags: JSON.stringify(["yoga", "mat", "eco"]), specifications: JSON.stringify({ thickness: "6mm", size: "183x61cm", material: "TPE Eco-friendly" }) },

    // Recovery & Massage
    { name: "Massage Gun Pro", slug: "massage-gun-pro", description: "Professional percussion massage gun with 6 heads and 30 speed levels. Deep tissue recovery.", shortDesc: "6 heads, 30 speeds", price: 89.9, compareAtPrice: 119.9, categoryId: catMap.get("recovery-massage")!, brand: "Tayamo Recovery", stock: 20, rating: 4.8, reviewCount: 56, isFeatured: true, isBestSeller: true, isNew: true, tags: JSON.stringify(["massage", "gun", "recovery"]), specifications: JSON.stringify({ speeds: "30 levels", heads: "6 attachments", battery: "6 hours" }) },
    { name: "Foam Roller 45cm", slug: "foam-roller-45cm", description: "High-density EVA foam roller for muscle recovery and myofascial release.", shortDesc: "High-density EVA", price: 19.9, compareAtPrice: null, categoryId: catMap.get("recovery-massage")!, brand: "Tayamo Recovery", stock: 55, rating: 4.5, reviewCount: 43, tags: JSON.stringify(["foam-roller", "recovery", "massage"]), specifications: JSON.stringify({ length: "45cm", density: "High", material: "EVA Foam" }) },

    // Healthy Snacks
    { name: "Protein Bar Box (12x)", slug: "protein-bar-box-12", description: "Box of 12 premium protein bars with 20g protein each. Multiple flavors.", shortDesc: "12 bars, 20g protein each", price: 34.9, compareAtPrice: 42.9, categoryId: catMap.get("healthy-snacks")!, brand: "Tayamo Nutrition", stock: 40, rating: 4.4, reviewCount: 67, tags: JSON.stringify(["protein-bar", "snack", "protein"]), specifications: JSON.stringify({ count: 12, protein: "20g each", flavors: "Mixed" }) },

    // Gloves & Wraps
    { name: "Hand Wraps 4m (Pair)", slug: "hand-wraps-4m-pair", description: "Premium cotton hand wraps with thumb loop. Provides wrist and knuckle support.", shortDesc: "Cotton, thumb loop", price: 12.9, compareAtPrice: null, categoryId: catMap.get("gloves-wraps")!, brand: "Tayamo Fight", stock: 90, rating: 4.6, reviewCount: 112, isBestSeller: true, tags: JSON.stringify(["wraps", "hand", "boxing"]), specifications: JSON.stringify({ length: "4m", material: "Cotton", includes: "1 pair" }) },
    { name: "MMA Grappling Gloves", slug: "mma-grappling-gloves", description: "Open-palm MMA gloves for grappling and cage training. Premium leather.", shortDesc: "Open-palm, leather", price: 49.9, compareAtPrice: null, categoryId: catMap.get("gloves-wraps")!, brand: "Tayamo Fight", stock: 25, rating: 4.7, reviewCount: 34, tags: JSON.stringify(["mma", "gloves", "grappling"]), specifications: JSON.stringify({ weight: "7oz", material: "Genuine Leather", color: "Black" }) },

    // Fitness Accessories
    { name: "Gym Belt Leather", slug: "gym-belt-leather", description: "Heavy-duty leather weightlifting belt for core support during heavy lifts.", shortDesc: "Leather, heavy-duty", price: 44.9, compareAtPrice: null, categoryId: catMap.get("fitness-accessories")!, brand: "Tayamo Pro", stock: 30, rating: 4.8, reviewCount: 56, tags: JSON.stringify(["belt", "lifting", "support"]), specifications: JSON.stringify({ width: "10cm", material: "Genuine Leather", sizes: "S/M/L/XL" }) },
    { name: "Ab Wheel Roller", slug: "ab-wheel-roller", description: "Dual-wheel ab roller with ergonomic grip for core strengthening.", shortDesc: "Dual-wheel, ergonomic", price: 19.9, compareAtPrice: null, categoryId: catMap.get("fitness-accessories")!, brand: "Tayamo Gear", stock: 50, rating: 4.5, reviewCount: 45, tags: JSON.stringify(["ab-wheel", "core", "roller"]), specifications: JSON.stringify({ wheels: "Dual", grip: "Ergonomic foam" }) },
  ];

  for (const p of products) {
    await prisma.shopProduct.create({
      data: {
        ...p,
        images: JSON.stringify([`/images/shop/${p.slug}.jpg`]),
      },
    });
  }

  console.log(`✅ ${products.length} products created`);
  console.log("🏪 Shop seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Shop seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
