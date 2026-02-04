import { db } from "./db";
import { profile, socialLinks, sponsors, discountCodes } from "@shared/schema";

export async function seedDatabase() {
  const existingProfile = await db.select().from(profile).limit(1);
  
  if (existingProfile.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  console.log("Seeding database...");

  await db.insert(profile).values({
    name: "GameMaster Pro",
    title: "Kick & YouTube İçerik Üreticisi",
    bio: "Merhaba! Ben bir içerik üreticisiyim. Kick'te canlı yayınlar yapıyor, YouTube'da gaming ve eğlence içerikleri üretiyorum. Topluluğumuzla birlikte eğlenceli vakit geçiriyoruz. Beni sosyal medyadan takip edebilir, sponsorlarımın sunduğu özel indirim kodlarından yararlanabilirsiniz!",
    avatarUrl: null,
  });

  await db.insert(socialLinks).values([
    {
      platform: "Kick",
      url: "https://kick.com/gamemaster",
      displayOrder: 1,
      isActive: true,
    },
    {
      platform: "YouTube",
      url: "https://youtube.com/@gamemaster",
      displayOrder: 2,
      isActive: true,
    },
    {
      platform: "Twitter",
      url: "https://twitter.com/gamemaster",
      displayOrder: 3,
      isActive: true,
    },
    {
      platform: "Instagram",
      url: "https://instagram.com/gamemaster",
      displayOrder: 4,
      isActive: true,
    },
    {
      platform: "Discord",
      url: "https://discord.gg/gamemaster",
      displayOrder: 5,
      isActive: true,
    },
    {
      platform: "TikTok",
      url: "https://tiktok.com/@gamemaster",
      displayOrder: 6,
      isActive: true,
    },
  ]);

  const [techGear] = await db.insert(sponsors).values({
    name: "TechGear Pro",
    description: "Profesyonel gaming ekipmanları ve aksesuarlar. En yüksek performans için en iyi donanım.",
    logoUrl: null,
    websiteUrl: "https://techgearpro.com",
    displayOrder: 1,
    isActive: true,
  }).returning();

  const [gamingEnergy] = await db.insert(sponsors).values({
    name: "GamerFuel",
    description: "Oyuncular için özel formüllü enerji içecekleri. Maratonluk oyun seansları için güç kaynağı.",
    logoUrl: null,
    websiteUrl: "https://gamerfuel.com",
    displayOrder: 2,
    isActive: true,
  }).returning();

  const [streamSetup] = await db.insert(sponsors).values({
    name: "StreamPro Setup",
    description: "Yayıncılar için profesyonel ekipman çözümleri. Işık, mikrofon ve kamera setleri.",
    logoUrl: null,
    websiteUrl: "https://streamprosetup.com",
    displayOrder: 3,
    isActive: true,
  }).returning();

  await db.insert(discountCodes).values([
    {
      sponsorId: techGear.id,
      code: "GAMEMASTER15",
      description: "TechGear Pro'da tüm ürünlerde geçerli",
      discountPercent: 15,
      url: "https://techgearpro.com?ref=gamemaster",
      displayOrder: 1,
      isActive: true,
    },
    {
      sponsorId: gamingEnergy.id,
      code: "FUEL20",
      description: "GamerFuel enerji içeceklerinde özel indirim",
      discountPercent: 20,
      url: "https://gamerfuel.com?ref=gamemaster",
      displayOrder: 2,
      isActive: true,
    },
    {
      sponsorId: streamSetup.id,
      code: "STREAM25",
      description: "StreamPro Setup'ta yayıncı paketlerinde geçerli",
      discountPercent: 25,
      url: "https://streamprosetup.com?ref=gamemaster",
      displayOrder: 3,
      isActive: true,
    },
  ]);

  console.log("Database seeded successfully!");
}
