/**
 * Fix broken product images — re-uploads with working Unsplash URLs
 */
import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";
import https from "https";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

function download(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location).then(resolve).catch(reject);
      }
      const chunks: Buffer[] = [];
      res.on("data", (c: Buffer) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function upload(buffer: Buffer, folder: string, id: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `tayamo/shop/${folder}`, public_id: id, resource_type: "image",
        transformation: [{ width: 600, height: 600, crop: "fill", quality: "auto", format: "auto" }] },
      (err, result) => { if (err) reject(err); else resolve(result!.secure_url); }
    );
    stream.end(buffer);
  });
}

// Replacement URLs for broken images
const FIXES: Record<string, string> = {
  // Supplements
  "gold-standard-100-whey": "https://images.unsplash.com/photo-1593095948071-474c5cc2b1aa?w=600&h=600&fit=crop",
  "iso-100-hydrolyzed": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop",
  "applied-nutrition-whey": "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&h=600&fit=crop",
  "micronized-creatine": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop",
  "serious-mass-gainer": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop",
  "gold-standard-casein": "https://images.unsplash.com/photo-1593095948071-474c5cc2b1aa?w=600&h=600&fit=crop&q=80",
  // Accessories
  "steel-shaker-28oz": "https://images.unsplash.com/photo-1570831597283-31a5a8d1e28c?w=600&h=600&fit=crop",
  // Apparel
  "performance-training-cap": "https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=600&h=600&fit=crop",
  // Equipment
  "premium-yoga-mat-6mm": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop",
};

// Alternative working URLs
const ALT_URLS: Record<string, string> = {
  "gold-standard-100-whey": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop",
  "iso-100-hydrolyzed": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop",
  "applied-nutrition-whey": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop",
  "micronized-creatine": "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&h=600&fit=crop",
  "serious-mass-gainer": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop&q=80",
  "gold-standard-casein": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop&q=90",
  "steel-shaker-28oz": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop",
  "performance-training-cap": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
  "premium-yoga-mat-6mm": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop&q=80",
};

async function main() {
  console.log("🔧 Fixing broken product images...\n");

  for (const [slug, url] of Object.entries(ALT_URLS)) {
    try {
      const buffer = await download(url);
      const cloudUrl = await upload(buffer, "products", `prod-${slug}`);

      // Update database
      await prisma.shopProduct.update({
        where: { slug },
        data: { images: JSON.stringify([cloudUrl]) },
      });
      console.log(`  ✓ ${slug} → ${cloudUrl.substring(0, 60)}...`);
    } catch (e) {
      console.log(`  ✗ ${slug}: ${e}`);
    }
  }

  console.log("\n✅ Done!");
}

main().finally(() => prisma.$disconnect());
