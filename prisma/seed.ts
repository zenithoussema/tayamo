import { PrismaClient, DayOfWeek, ScheduleCategory, ScheduleSeason } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.booking.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.activity.deleteMany();

  // ── Activities ──
  const activities = await Promise.all(
    [
      {
        nameAr: "كاراتيه",
        nameFr: "Karaté",
        slug: "karate",
        descriptionAr:
          "فن قتالي ياباني يركز على الانضباط والتركيز وتقوية الشخصية. مناسب لجميع الأعمار والمستويات.",
        descriptionFr:
          "Art martial japonax qui développe la discipline, la concentration et la confiance en soi. Accessible à tous les âges.",
        ageRangeMin: 5,
        ageRangeMax: 60,
        iconName: "karate",
        coverImageUrl: null,
      },
      {
        nameAr: "تاي كون دو",
        nameFr: "Taekwondo",
        slug: "taekwondo",
        descriptionAr:
          "فن قتالي كوري يتميز بالركلات السريعة والحركات الديناميكية. ينمي اللياقة والثقة بالنفس.",
        descriptionFr:
          "Art martial coréen aux coups de pied spectaculaires. Développe la souplesse, la rapidité et l'esprit combatif.",
        ageRangeMin: 5,
        ageRangeMax: 50,
        iconName: "taekwondo",
        coverImageUrl: null,
      },
      {
        nameAr: "كيك بوكسينغ",
        nameFr: "Kick Boxing",
        slug: "kick-boxing",
        descriptionAr:
          "رياضة قتالية تجمع بين اللكمات والركلات. مثالية لتقوية الجسم وحرق السعرات الحرارية وتعلم الدفاع عن النفس.",
        descriptionFr:
          "Sport de combat complet mêlant coups de poing et coups de pied. Idéal pour se défouler, se muscler et apprendre à se défendre.",
        ageRangeMin: 12,
        ageRangeMax: 55,
        iconName: "kickboxing",
        coverImageUrl: null,
      },
      {
        nameAr: "جمباز",
        nameFr: "Gymnastique",
        slug: "gymnastique",
        descriptionAr:
          "رياضة تتضمن حركات بهلوانية وتمارين مرونة وتوازن. رائعة للأطفال لبناء القوة والثقة.",
        descriptionFr:
          "Discipline complète alliant souplesse, équilibre et agilité. Parfaite pour l'éveil corporel des enfants.",
        ageRangeMin: 3,
        ageRangeMax: 25,
        iconName: "gymnastics",
        coverImageUrl: null,
      },
      {
        nameAr: "أيروبيك",
        nameFr: "Aérobic",
        slug: "aerobic",
        descriptionAr:
          "تمارين إيقاعية لتحسين اللياقة القلبية والتنفسية وحرق الدهون. أجواء مليئة بالطاقة والموسيقى.",
        descriptionFr:
          "Exercices rythmés pour améliorer l'endurance et brûler des calories. Une ambiance pleine d'énergie et de musique !",
        ageRangeMin: 12,
        ageRangeMax: 60,
        iconName: "aerobic",
        coverImageUrl: null,
      },
      {
        nameAr: "كارديو",
        nameFr: "Cardio",
        slug: "cardio",
        descriptionAr:
          "تمارين كارديو مكثفة لتقوية القلب وتحسين الدورة الدموية وحرق السعرات الحرارية بسرعة.",
        descriptionFr:
          "Séance intense de cardio pour renforcer le cœur et améliorer la circulation sanguine. Résultats rapides !",
        ageRangeMin: 14,
        ageRangeMax: 65,
        iconName: "cardio",
        coverImageUrl: null,
      },
      {
        nameAr: "فيتنيس",
        nameFr: "Fitness",
        slug: "fitness",
        descriptionAr:
          "برنامج لياقة متكامل يجمع بين تقوية العضلات والتمارين الهوائية لتحسين اللياقة العامة.\n\nملائم للجنسين.",
        descriptionFr:
          "Programme de remise en forme complet alliant renforcement musculaire et cardio. Accessible à tous les niveaux.",
        ageRangeMin: 12,
        ageRangeMax: 70,
        iconName: "fitness",
        coverImageUrl: null,
      },
      {
        nameAr: "موسكلاسيون",
        nameFr: "Musculation",
        slug: "musculation",
        descriptionAr:
          "صالة أجهزة متكاملة لبناء العضلات وتقوية الجسم تحت إشراف مدربين مختصين.",
        descriptionFr:
          "Salle de musculation équipée pour le renforcement musculaire avec encadrement par des coachs diplômés.",
        ageRangeMin: 14,
        ageRangeMax: 70,
        iconName: "musculation",
        coverImageUrl: null,
      },
      {
        nameAr: "كروس فيت",
        nameFr: "CrossFit",
        slug: "crossfit",
        descriptionAr:
          "تمارين وظيفية عالية الكثافة تجمع بين رفع الأثقال والتمارين الهوائية والجمباز. تحدي حقيقي للجسم والعقل.",
        descriptionFr:
          "Entraînement fonctionnel à haute intensité mêlant haltérophilie, cardio et gymnastique. Un vrai défi !",
        ageRangeMin: 16,
        ageRangeMax: 50,
        iconName: "crossfit",
        coverImageUrl: null,
      },
    ].map((a) => prisma.activity.create({ data: a })),
  );

  console.log(`✅ ${activities.length} activities created`);

  // ── Summer Schedules ──
  const scheduleData: {
    activitySlug: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    coachName: string;
    category: ScheduleCategory;
    season: ScheduleSeason;
  }[] = [
    // Karaté — Kids (Mon/Wed/Fri 10:00)
    { activitySlug: "karate", dayOfWeek: "MONDAY", startTime: "10:00", endTime: "11:30", coachName: "Ahmed Ben Salem", category: "KIDS", season: "SUMMER" },
    { activitySlug: "karate", dayOfWeek: "WEDNESDAY", startTime: "10:00", endTime: "11:30", coachName: "Ahmed Ben Salem", category: "KIDS", season: "SUMMER" },
    { activitySlug: "karate", dayOfWeek: "FRIDAY", startTime: "10:00", endTime: "11:30", coachName: "Ahmed Ben Salem", category: "KIDS", season: "SUMMER" },

    // Karaté — Adults (Tue/Thu/Sat 17:00)
    { activitySlug: "karate", dayOfWeek: "TUESDAY", startTime: "17:00", endTime: "18:30", coachName: "Ahmed Ben Salem", category: "ADULTS", season: "SUMMER" },
    { activitySlug: "karate", dayOfWeek: "THURSDAY", startTime: "17:00", endTime: "18:30", coachName: "Ahmed Ben Salem", category: "ADULTS", season: "SUMMER" },
    { activitySlug: "karate", dayOfWeek: "SATURDAY", startTime: "17:00", endTime: "18:30", coachName: "Sami Mejri", category: "ADULTS", season: "SUMMER" },

    // Taekwondo — Adults (Tue/Thu/Sat 09:00)
    { activitySlug: "taekwondo", dayOfWeek: "TUESDAY", startTime: "09:00", endTime: "10:30", coachName: "Mehdi Trabelsi", category: "ADULTS", season: "SUMMER" },
    { activitySlug: "taekwondo", dayOfWeek: "THURSDAY", startTime: "09:00", endTime: "10:30", coachName: "Mehdi Trabelsi", category: "ADULTS", season: "SUMMER" },
    { activitySlug: "taekwondo", dayOfWeek: "SATURDAY", startTime: "09:00", endTime: "10:30", coachName: "Mehdi Trabelsi", category: "ADULTS", season: "SUMMER" },

    // Kick Boxing — Adults (Tue/Thu/Sat 18:00)
    { activitySlug: "kick-boxing", dayOfWeek: "TUESDAY", startTime: "18:00", endTime: "19:30", coachName: "Oussama Gharbi", category: "ADULTS", season: "SUMMER" },
    { activitySlug: "kick-boxing", dayOfWeek: "THURSDAY", startTime: "18:00", endTime: "19:30", coachName: "Oussama Gharbi", category: "ADULTS", season: "SUMMER" },
    { activitySlug: "kick-boxing", dayOfWeek: "SATURDAY", startTime: "18:00", endTime: "19:30", coachName: "Oussama Gharbi", category: "ADULTS", season: "SUMMER" },

    // Fitness Women — Women (Mon/Wed/Fri 06:30)
    { activitySlug: "fitness", dayOfWeek: "MONDAY", startTime: "06:30", endTime: "07:30", coachName: "Ines Jribi", category: "WOMEN", season: "SUMMER" },
    { activitySlug: "fitness", dayOfWeek: "WEDNESDAY", startTime: "06:30", endTime: "07:30", coachName: "Ines Jribi", category: "WOMEN", season: "SUMMER" },
    { activitySlug: "fitness", dayOfWeek: "FRIDAY", startTime: "06:30", endTime: "07:30", coachName: "Ines Jribi", category: "WOMEN", season: "SUMMER" },

    // Gymnastique — Kids (Mon/Wed/Fri 08:00)
    { activitySlug: "gymnastique", dayOfWeek: "MONDAY", startTime: "08:00", endTime: "09:30", coachName: "Nour Ben Ali", category: "KIDS", season: "SUMMER" },
    { activitySlug: "gymnastique", dayOfWeek: "WEDNESDAY", startTime: "08:00", endTime: "09:30", coachName: "Nour Ben Ali", category: "KIDS", season: "SUMMER" },
    { activitySlug: "gymnastique", dayOfWeek: "FRIDAY", startTime: "08:00", endTime: "09:30", coachName: "Nour Ben Ali", category: "KIDS", season: "SUMMER" },

    // Musculation — Adults (Every day 08:00-22:00)
    { activitySlug: "musculation", dayOfWeek: "MONDAY", startTime: "08:00", endTime: "22:00", coachName: "Coach Musculation", category: "ADULTS", season: "SUMMER" },
    { activitySlug: "musculation", dayOfWeek: "TUESDAY", startTime: "08:00", endTime: "22:00", coachName: "Coach Musculation", category: "ADULTS", season: "SUMMER" },
    { activitySlug: "musculation", dayOfWeek: "WEDNESDAY", startTime: "08:00", endTime: "22:00", coachName: "Coach Musculation", category: "ADULTS", season: "SUMMER" },
    { activitySlug: "musculation", dayOfWeek: "THURSDAY", startTime: "08:00", endTime: "22:00", coachName: "Coach Musculation", category: "ADULTS", season: "SUMMER" },
    { activitySlug: "musculation", dayOfWeek: "FRIDAY", startTime: "08:00", endTime: "22:00", coachName: "Coach Musculation", category: "ADULTS", season: "SUMMER" },
    { activitySlug: "musculation", dayOfWeek: "SATURDAY", startTime: "08:00", endTime: "22:00", coachName: "Coach Musculation", category: "ADULTS", season: "SUMMER" },
    { activitySlug: "musculation", dayOfWeek: "SUNDAY", startTime: "08:00", endTime: "22:00", coachName: "Coach Musculation", category: "ADULTS", season: "SUMMER" },
  ];

  const activityMap = new Map(activities.map((a) => [a.slug, a.id]));

  for (const s of scheduleData) {
    await prisma.schedule.create({
      data: {
        activityId: activityMap.get(s.activitySlug)!,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        coachName: s.coachName,
        category: s.category,
        season: s.season,
        isActive: true,
      },
    });
  }

  console.log(`✅ ${scheduleData.length} summer schedules created`);

  // ── Testimonials ──
  const testimonials = [
    {
      authorName: "Mohamed & Saloua",
      content:
        "منذ ما سجلنا ولدنا إياد في نادي تايامو، صار عندو ثقة في روحو بزاف. المدربين متاعهم محترمين يحبو الصغار ويخدموهم بالطريقة الصحيحة. ننصح بيهم الكل. ♥️",
      rating: 5,
      approved: true,
    },
    {
      authorName: "Fatma Zaïbi",
      content:
        "تربية بنتي مريم في الجيمناز من عمر 4 سنين، الحمد لله تقدمت بزاف وصارت عندها مرونة وقوة. شكر خاص للمدربة نور على صبرها وحنانها مع الصغار. ♥️🤸‍♀️",
      rating: 5,
      approved: true,
    },
    {
      authorName: "Karim & Nadia",
      content:
        "Un grand merci à toute l'équipe de Tayamo Sport ! Notre fils Youssef a commencé le karité l'année dernière et il a tellement changé — plus discipliné, plus concentré à l'école, et il s'est fait plein de copains. Le cadre est familial et bienveillant. On recommande les yeux fermés !",
      rating: 5,
      approved: true,
    },
    {
      authorName: "Haythem Gharbi",
      content:
        "الكيك بوكسينغ مع المدرب أسامة تحفة. جيت في البداية باش نحسّن لياقتي، لكن اللي لقيته كان أكبر — روح رياضية، صحاب جداد، وثقة في النفس. شكراً تايامو سبورت. 🔥",
      rating: 5,
      approved: true,
    },
    {
      authorName: "Samira & Fathi",
      content:
        "Nous sommes une famille nombreuse et chacun a trouvé son activité chez Tayamo : les petits font la gymnastique, l'adolescent fait du crossfit avec Houssem, et moi j'ai repris le fitness après 40 ans. L'ambiance est chaleureuse, on se sent comme chez soi. Merci pour tout !",
      rating: 5,
      approved: true,
    },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }

  console.log(`✅ ${testimonials.length} testimonials created`);

  // ── Contact Settings ──
  const contactSettings: Record<string, string> = {
    phone: "+216 54 103 087",
    whatsapp: "+21654103087",
    email: "",
    address: "",
    facebook: "https://www.facebook.com/raisyassine.abidi",
    instagram: "https://www.instagram.com/tayamo_sport?igsh=dzd4Zm5ibHVkYXNn",
    tiktok: "",
    youtube: "",
    openingHour: "08:00",
    closingHour: "22:00",
    workingDays: "1-6",
    mapEmbedUrl: "",
  };

  for (const [key, value] of Object.entries(contactSettings)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  console.log(`✅ ${Object.keys(contactSettings).length} contact settings created`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
