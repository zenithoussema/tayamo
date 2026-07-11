import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const API_KEY = process.env.PEXELS_API_KEY;
if (!API_KEY) {
  console.error("❌ PEXELS_API_KEY is not set. Add it to .env.local or export it.");
  process.exit(1);
}

const searches = [
  // Hero + Activities (existing)
  { query: "martial arts training gym", save: "public/images/hero/hero-main.jpg" },
  { query: "karate kids training", save: "public/images/activities/karate.jpg" },
  { query: "taekwondo kick", save: "public/images/activities/taekwondo.jpg" },
  { query: "kids gymnastics", save: "public/images/activities/gymnastique.jpg" },
  { query: "weightlifting gym", save: "public/images/activities/musculation.jpg" },
  { query: "crossfit training", save: "public/images/activities/crossfit.jpg" },
  { query: "kickboxing gloves training", save: "public/images/activities/kick-boxing.jpg" },
  { query: "cardio workout gym", save: "public/images/activities/cardio.jpg" },
  { query: "fitness training gym", save: "public/images/activities/fitness.jpg" },
  { query: "aerobic class group", save: "public/images/activities/aerobic.jpg" },
  // Gallery
  { query: "gym interior modern", save: "public/images/gallery/gallery-1.jpg" },
  { query: "group fitness class", save: "public/images/gallery/gallery-2.jpg" },
  { query: "karate class kids", save: "public/images/gallery/gallery-3.jpg" },
  { query: "weight room gym", save: "public/images/gallery/gallery-4.jpg" },
  { query: "crossfit box training", save: "public/images/gallery/gallery-5.jpg" },
  { query: "gymnastics training children", save: "public/images/gallery/gallery-6.jpg" },
  { query: "sports club community", save: "public/images/gallery/gallery-7.jpg" },
  { query: "sports tournament event", save: "public/images/gallery/gallery-8.jpg" },
  // Coaches
  { query: "male fitness coach portrait", save: "public/images/coaches/coach-1.jpg" },
  { query: "personal trainer portrait male", save: "public/images/coaches/coach-2.jpg" },
  { query: "martial arts instructor portrait", save: "public/images/coaches/coach-3.jpg" },
  { query: "female fitness instructor portrait", save: "public/images/coaches/coach-4.jpg" },
];

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function searchPexels(query) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
  const res = await fetch(url, { headers: { Authorization: API_KEY } });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  const data = await res.json();
  if (!data.photos || data.photos.length === 0) throw new Error("No results");
  return data.photos[0];
}

async function downloadImage(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download ${res.status}: ${res.statusText}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, buffer);
}

async function main() {
  console.log(`Downloading ${searches.length} images from Pexels...\n`);
  let ok = 0;
  let fail = 0;

  for (const { query, save } of searches) {
    try {
      const photo = await searchPexels(query);
      const imageUrl = photo.src.large;
      await downloadImage(imageUrl, save);
      console.log(`✅ ${save}  ← "${query}"  (photo ${photo.id})`);
      ok++;
    } catch (err) {
      console.error(`❌ ${save}  ← "${query}"  — ${err.message}`);
      fail++;
    }
    await delay(300);
  }

  console.log(`\nDone: ${ok} succeeded, ${fail} failed.`);
}

main();
