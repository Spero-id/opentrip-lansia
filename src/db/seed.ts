import "dotenv/config";
import crypto from "crypto";
import { db } from "../shared/db";
import {
  destinationCategories, destinations, horecaTypes, horeca,
  vendorTypes, vendors, trips, tripDepartures, tripPrices, itineraryItems,
  blogs, blogCategories, contactMessages, promotions
} from "../db/schema";
import { account } from "../modules/auth/better-auth.schema";
import { users } from "../modules/auth/auth.schema";

function hash(pw: string) {
  return crypto.createHash("sha256").update(pw).digest("hex");
}

async function seed() {
  console.log("Seeding database...");

  const adminId = crypto.randomUUID();
  const agentId = crypto.randomUUID();
  const userId = crypto.randomUUID();

  await db.insert(users).values([
    { id: adminId, email: "admin@otl.id", name: "Admin OTL", role: "admin", referralCode: "ADMIN-001", emailVerified: true },
    { id: agentId, email: "agent@otl.id", name: "Siti Agen", role: "agent", referralCode: "AGENT-001", emailVerified: true },
    { id: userId, email: "user@otl.id", name: "Budi Lansia", role: "user", referralCode: "USER-001", emailVerified: true },
  ]);
  console.log("  Users: Admin OTL, Siti Agen, Budi Lansia");

  await db.insert(account).values([
    { id: crypto.randomUUID(), userId: adminId, accountId: adminId, providerId: "credential", password: hash("admin") },
    { id: crypto.randomUUID(), userId: agentId, accountId: agentId, providerId: "credential", password: hash("agent") },
    { id: crypto.randomUUID(), userId: userId, accountId: userId, providerId: "credential", password: hash("user") },
  ]);
  console.log("  Credential accounts created");

  await db.insert(users).values({
    id: crypto.randomUUID(), email: "aminah@mail.com", name: "Aminah",
    role: "user", referredBy: agentId, emailVerified: true,
  });

  const [katAlam] = await db.insert(destinationCategories).values({ name: "Alam", slug: "alam", isActive: true }).returning();
  const [katBudaya] = await db.insert(destinationCategories).values({ name: "Budaya", slug: "budaya", isActive: true }).returning();
  const [katReligi] = await db.insert(destinationCategories).values({ name: "Religi", slug: "religi", isActive: true }).returning();
  const [katKuliner] = await db.insert(destinationCategories).values({ name: "Kuliner", slug: "kuliner", isActive: true }).returning();
  console.log("  Categories: alam, budaya, religi, kuliner");

  const dests = await db.insert(destinations).values([
    { name: "Candi Borobudur", slug: "candi-borobudur", description: "Candi Buddha terbesar di dunia, akses kursi roda tersedia.", categoryId: katBudaya.id, isSeniorFriendly: true, isActive: true, visitEstimateMinutes: 180, accessibilityInfo: "Tersedia jalur kursi roda, area istirahat setiap 100m" },
    { name: "Pantai Parangtritis", slug: "pantai-parangtritis", description: "Pantai pasir hitam yang legendaris. Medan landai cocok untuk lansia.", categoryId: katAlam.id, isSeniorFriendly: true, isActive: true, visitEstimateMinutes: 120, accessibilityInfo: "Area parkir dekat, jalur pejalan kaki rata" },
    { name: "Malioboro", slug: "malioboro", description: "Kawasan perbelanjaan dan kuliner ikonik Yogyakarta.", categoryId: katKuliner.id, isSeniorFriendly: true, isActive: true, visitEstimateMinutes: 150 },
    { name: "Masjid Istiqlal", slug: "masjid-istiqlal", description: "Masjid terbesar di Asia Tenggara.", categoryId: katReligi.id, isSeniorFriendly: true, isActive: true, visitEstimateMinutes: 90 },
    { name: "Taman Mini Indonesia Indah", slug: "tmii", description: "Taman budaya dengan anjungan daerah dari seluruh Indonesia.", categoryId: katBudaya.id, isSeniorFriendly: true, isActive: true, visitEstimateMinutes: 240, accessibilityInfo: "Tersedia kereta keliling, jalur khusus lansia" },
    { name: "Gunung Bromo", slug: "gunung-bromo", description: "Gunung berapi aktif dengan pemandangan matahari terbit yang spektakuler.", categoryId: katAlam.id, isSeniorFriendly: false, isActive: true, visitEstimateMinutes: 300, accessibilityInfo: "Medan berbatu, butuh kendaraan 4x4, tidak disarankan bagi lansia dengan masalah jantung" },
    { name: "Pulau Komodo", slug: "pulau-komodo", description: "Taman Nasional Komodo, habitat asli komodo.", categoryId: katAlam.id, isSeniorFriendly: false, isActive: true, visitEstimateMinutes: 360 },
    { name: "Danau Toba", slug: "danau-toba", description: "Danau vulkanik terbesar di Indonesia. Udara sejuk dan pemandangan memukau.", categoryId: katAlam.id, isSeniorFriendly: true, isActive: true, visitEstimateMinutes: 200, accessibilityInfo: "Akses mobil sampai pinggir danau, area duduk tersedia" },
  ]).returning();
  console.log(`  Destinations: ${dests.length} created`);

  const [htHotel] = await db.insert(horecaTypes).values({ name: "Hotel", slug: "hotel", isActive: true }).returning();
  const [htResto] = await db.insert(horecaTypes).values({ name: "Restaurant", slug: "restaurant", isActive: true }).returning();
  const [htCafe] = await db.insert(horecaTypes).values({ name: "Cafe", slug: "cafe", isActive: true }).returning();

  const horecaList = await db.insert(horeca).values([
    { typeId: htHotel.id, name: "Hotel Santika", starCategory: "bintang_4", isAccessibleForElderly: true, isActive: true },
    { typeId: htHotel.id, name: "Amaris Hotel", starCategory: "bintang_2", isAccessibleForElderly: true, isActive: true },
    { typeId: htResto.id, name: "Restoran Padang Sederhana", starCategory: "non_bintang", isAccessibleForElderly: true, isActive: true },
    { typeId: htCafe.id, name: "Kopi Senja", starCategory: "non_bintang", isAccessibleForElderly: false, isActive: true },
    { typeId: htHotel.id, name: "Grand Hyatt", starCategory: "bintang_5", isAccessibleForElderly: true, isActive: true },
  ]).returning();
  console.log("  HORECA: 5 created");

  const [vtTrans] = await db.insert(vendorTypes).values({ name: "Transportasi", slug: "transportasi" }).returning();
  const [vtGuide] = await db.insert(vendorTypes).values({ name: "Tour Guide", slug: "tour-guide" }).returning();
  const [vtMedic] = await db.insert(vendorTypes).values({ name: "Tenaga Medis", slug: "tenaga-medis" }).returning();

  await db.insert(vendors).values([
    { typeId: vtTrans.id, name: "PO Rosalia Indah", contactPerson: "Pak Budi", phone: "08123456789", isVerified: true },
    { typeId: vtTrans.id, name: "Travel Aman Lansia", contactPerson: "Bu Sari", phone: "08198765432", isVerified: true },
    { typeId: vtGuide.id, name: "Pandu Wisata Senior", contactPerson: "Mas Heru", phone: "08234567890", isVerified: true },
    { typeId: vtMedic.id, name: "Medika Trip", contactPerson: "Dr. Andi", phone: "08345678901", isVerified: true },
  ]);
  console.log("  Vendors: 4 created");

  const tripData = [
    { title: "Wisata Religi Yogyakarta 3 Hari", slug: "wisata-religi-yogya-3h", description: "Paket wisata religi ke Candi Borobudur, Malioboro, dan Keraton. Khusus lansia dengan akomodasi bintang 4.", durationDays: 3, type: "open_trip", status: "published", isFeatured: true },
    { title: "Eksplorasi Danau Toba", slug: "eksplorasi-danau-toba", description: "Nikmati keindahan Danau Toba dengan medan ramah lansia. Termasuk homestay dan makan khas Batak.", durationDays: 4, type: "open_trip", status: "published", isFeatured: true },
    { title: "Jakarta Heritage Trail", slug: "jakarta-heritage-trail", description: "Jelajahi bangunan bersejarah Jakarta dengan tour guide khusus lansia.", durationDays: 2, type: "open_trip", status: "published", isFeatured: true },
    { title: "Private Trip Bromo", slug: "private-trip-bromo", description: "Private trip khusus, cocok untuk rombongan keluarga lansia.", durationDays: 3, type: "private_trip", status: "published" },
    { title: "Pulau Komodo Ramah Lansia", slug: "pulau-komodo-ramah-lansia", description: "Paket khusus lansia ke Pulau Komodo dengan fasilitas kesehatan lengkap.", durationDays: 5, type: "open_trip", status: "draft" },
  ];
  const tripList = await db.insert(trips).values(tripData).returning();
  console.log(`  Trips: ${tripList.length} created`);

  const departList = await db.insert(tripDepartures).values([
    { tripId: tripList[0].id, startDate: "2026-08-15", endDate: "2026-08-17", maxParticipants: 20, minParticipants: 5, status: "scheduled" },
    { tripId: tripList[0].id, startDate: "2026-09-10", endDate: "2026-09-12", maxParticipants: 20, minParticipants: 5, status: "scheduled" },
    { tripId: tripList[1].id, startDate: "2026-08-20", endDate: "2026-08-23", maxParticipants: 15, minParticipants: 4, status: "scheduled" },
    { tripId: tripList[2].id, startDate: "2026-08-05", endDate: "2026-08-06", maxParticipants: 25, minParticipants: 5, status: "confirmed" },
    { tripId: tripList[3].id, startDate: "2026-09-01", endDate: "2026-09-03", maxParticipants: 10, minParticipants: 2, status: "scheduled" },
  ]).returning();
  console.log(`  Departures: ${departList.length} created`);

  await db.insert(tripPrices).values([
    { departureId: departList[0].id, name: "Dewasa", price: "2500000", quota: 15, quotaBooked: 3, isActive: true },
    { departureId: departList[0].id, name: "Anak", price: "1750000", quota: 5, quotaBooked: 1, isActive: true },
    { departureId: departList[0].id, name: "Early Bird", price: "2000000", quota: 5, quotaBooked: 2, isActive: true, validUntil: "2026-07-31" },
    { departureId: departList[1].id, name: "Dewasa", price: "2700000", quota: 15, isActive: true },
    { departureId: departList[1].id, name: "Anak", price: "1900000", quota: 5, isActive: true },
    { departureId: departList[2].id, name: "Dewasa", price: "3200000", quota: 10, quotaBooked: 4, isActive: true },
    { departureId: departList[2].id, name: "Anak", price: "2200000", quota: 5, isActive: true },
    { departureId: departList[3].id, name: "Dewasa", price: "1500000", quota: 20, quotaBooked: 8, isActive: true },
    { departureId: departList[3].id, name: "Anak", price: "1000000", quota: 5, quotaBooked: 2, isActive: true },
    { departureId: departList[4].id, name: "Dewasa", price: "4500000", quota: 8, isActive: true },
  ]);
  console.log("  Prices: 10 created");

  await db.insert(itineraryItems).values([
    { tripId: tripList[0].id, dayNumber: 1, startTime: "07:00", endTime: "08:00", title: "Sarapan di Hotel", description: "Sarapan prasmanan" },
    { tripId: tripList[0].id, dayNumber: 1, startTime: "08:30", endTime: "11:30", title: "Wisata Candi Borobudur", description: "Tur dengan pemandu khusus lansia", destinationId: dests[0].id },
    { tripId: tripList[0].id, dayNumber: 1, startTime: "12:00", endTime: "13:00", title: "Makan Siang", horecaId: horecaList[2].id },
    { tripId: tripList[0].id, dayNumber: 1, startTime: "14:00", endTime: "17:00", title: "Malioboro", description: "Belanja oleh-oleh", destinationId: dests[2].id },
    { tripId: tripList[0].id, dayNumber: 2, startTime: "07:00", endTime: "08:00", title: "Sarapan" },
    { tripId: tripList[0].id, dayNumber: 2, startTime: "08:30", endTime: "11:00", title: "Keraton Yogyakarta", description: "Tur Keraton" },
    { tripId: tripList[0].id, dayNumber: 2, startTime: "13:00", endTime: "15:00", title: "Istirahat & Bebas" },
    { tripId: tripList[0].id, dayNumber: 3, startTime: "07:00", endTime: "10:00", title: "Check Out & Pulang" },
  ]);
  console.log("  Itinerary: 8 items created");

  await db.insert(promotions).values([
    { code: "LANSIA10", title: "Diskon Lansia 10%", type: "percentage", value: "10", minPurchase: "1000000", maxDiscount: "500000", usageLimit: 100, usageCount: 5, isActive: true, validFrom: "2026-01-01", validUntil: "2026-12-31" },
    { code: "EARLYBIRD", title: "Early Bird 20%", type: "percentage", value: "20", minPurchase: "2000000", maxDiscount: "1000000", usageLimit: 50, usageCount: 2, isActive: true, validFrom: "2026-01-01", validUntil: "2026-12-31" },
    { code: "GRATIS50", title: "Potongan Rp50rb", type: "nominal", value: "50000", usageLimit: 200, usageCount: 10, isActive: true, validFrom: "2026-01-01", validUntil: "2026-12-31" },
  ]);
  console.log("  Promotions: 3 created");

  const [bcTips] = await db.insert(blogCategories).values({ name: "Tips Perjalanan", slug: "tips-perjalanan" }).returning();
  const [bcDest] = await db.insert(blogCategories).values({ name: "Destinasi", slug: "destinasi" }).returning();
  const [bcKesehatan] = await db.insert(blogCategories).values({ name: "Kesehatan Lansia", slug: "kesehatan-lansia" }).returning();

  await db.insert(blogs).values([
    { title: "Tips Perjalanan Nyaman untuk Lansia", slug: "tips-perjalanan-lansia", content: "Persiapkan perjalanan dengan baik...\n\n1. Konsultasi dengan dokter terlebih dahulu\n2. Bawa obat-obatan pribadi\n3. Pilih pakaian yang nyaman\n4. Istirahat yang cukup\n5. Jaga asupan makanan", excerpt: "Panduan lengkap persiapan perjalanan bagi lansia", authorId: adminId, categoryId: bcTips.id, status: "published", publishedAt: new Date("2026-07-15") },
    { title: "5 Destinasi Ramah Lansia di Indonesia", slug: "5-destinasi-ramah-lansia", content: "Destinasi yang cocok untuk wisata lansia:\n\n1. Candi Borobudur - akses kursi roda\n2. Malioboro - jalan datar\n3. TMII - kereta keliling\n4. Danau Toba - akses mudah\n5. Pantai Parangtritis - medan landai", excerpt: "Rekomendasi destinasi dengan akses mudah untuk lansia", authorId: adminId, categoryId: bcDest.id, status: "published", publishedAt: new Date("2026-07-10") },
    { title: "Manfaat Wisata untuk Kesehatan Lansia", slug: "manfaat-wisata-lansia", content: "Wisata tidak hanya menyenangkan tetapi juga bermanfaat untuk kesehatan fisik dan mental lansia...", excerpt: "Studi menunjukkan wisata rutin baik untuk kesehatan lansia", authorId: adminId, categoryId: bcKesehatan.id, status: "published", publishedAt: new Date("2026-07-05") },
  ]);
  console.log("  Blog: 3 articles created");

  await db.insert(contactMessages).values([
    { name: "Supriyadi", email: "supri@mail.com", phone: "08111111111", subject: "Info Trip", message: "Apakah ada trip ke Bali untuk lansia?", isRead: false },
    { name: "Ratna", email: "ratna@mail.com", phone: "08222222222", subject: "Pertanyaan Fasilitas", message: "Apakah hotel menyediakan kursi roda?", isRead: true },
  ]);
  console.log("  Contact messages: 2 created");

  console.log("\nSeed complete!");
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
