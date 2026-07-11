import "server-only";
import { prisma } from "@/lib/db";

export interface ContactSettings {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  openingHour: string;
  closingHour: string;
  workingDays: string;
  mapEmbedUrl: string;
}

const defaults: ContactSettings = {
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

export async function getContactSettings(): Promise<ContactSettings> {
  const rows = await prisma.setting.findMany({
    where: {
      key: {
        in: Object.keys(defaults),
      },
    },
  });

  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }

  return {
    phone: map.phone || defaults.phone,
    whatsapp: map.whatsapp || defaults.whatsapp,
    email: map.email || defaults.email,
    address: map.address || defaults.address,
    facebook: map.facebook || defaults.facebook,
    instagram: map.instagram || defaults.instagram,
    tiktok: map.tiktok || defaults.tiktok,
    youtube: map.youtube || defaults.youtube,
    openingHour: map.openingHour || defaults.openingHour,
    closingHour: map.closingHour || defaults.closingHour,
    workingDays: map.workingDays || defaults.workingDays,
    mapEmbedUrl: map.mapEmbedUrl || defaults.mapEmbedUrl,
  };
}

export function whatsappLink(phone: string): string {
  const clean = phone.replace(/[^0-9+]/g, "");
  return `https://wa.me/${clean.startsWith("+") ? clean.slice(1) : clean}`;
}
