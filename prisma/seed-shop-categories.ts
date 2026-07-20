import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Protein", slug: "protein", icon: "💪", sortOrder: 1 },
  { name: "Whey Protein", slug: "whey-protein", icon: "🥛", sortOrder: 2 },
  { name: "Creatine", slug: "creatine", icon: "⚡", sortOrder: 3 },
  { name: "Pre Workout", slug: "pre-workout", icon: "🔥", sortOrder: 4 },
  { name: "Mass Gainer", slug: "mass-gainer", icon: "🏋️", sortOrder: 5 },
  { name: "BCAA", slug: "bcaa", icon: "🧬", sortOrder: 6 },
  { name: "Vitamins", slug: "vitamins", icon: "💊", sortOrder: 7 },
  { name: "Healthy Snacks", slug: "healthy-snacks", icon: "🥜", sortOrder: 8 },
  { name: "Boxing Gloves", slug: "boxing-gloves", icon: "🥊", sortOrder: 9 },
  { name: "Punching Bags", slug: "punching-bags", icon: "🎯", sortOrder: 10 },
  { name: "Hand Wraps", slug: "hand-wraps", icon: "🤲", sortOrder: 11 },
  { name: "Resistance Bands", slug: "resistance-bands", icon: "🔴", sortOrder: 12 },
  { name: "Gym Belts", slug: "gym-belts", icon: "🔗", sortOrder: 13 },
  { name: "Knee Supports", slug: "knee-supports", icon: "🦵", sortOrder: 14 },
  { name: "Wrist Supports", slug: "wrist-supports", icon: "✋", sortOrder: 15 },
  { name: "Shakers", slug: "shakers", icon: "🥤", sortOrder: 16 },
  { name: "Water Bottles", slug: "water-bottles", icon: "💧", sortOrder: 17 },
  { name: "Training Clothes", slug: "training-clothes", icon: "👕", sortOrder: 18 },
  { name: "Shoes", slug: "shoes", icon: "👟", sortOrder: 19 },
  { name: "Sports Bags", slug: "sports-bags", icon: "🎒", sortOrder: 20 },
  { name: "Foam Rollers", slug: "foam-rollers", icon: "🧘", sortOrder: 21 },
  { name: "Massage Guns", slug: "massage-guns", icon: "💆", sortOrder: 22 },
  { name: "Gym Accessories", slug: "gym-accessories", icon: "🛠️", sortOrder: 23 },
  { name: "Fitness Equipment", slug: "fitness-equipment", icon: "🏋️‍♂️", sortOrder: 24 },
];

async function main() {
  console.log("Seeding shop categories...");

  for (const cat of categories) {
    await prisma.shopCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    });
    console.log(`  ✓ ${cat.name}`);
  }

  console.log(`\nDone! ${categories.length} categories seeded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
