import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ocvsvfvsyyfqtijtmvbh.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY is not set. Please add it to .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const listings = [
  {
    title: "Modern Luxury Villa",
    location: "Makati City, Metro Manila",
    price: 25500000,
    beds: 4,
    baths: 3,
    area: "350 sqm",
    type: "Houses",
    tag: "Featured",
    gradient: "from-blue-600 to-indigo-600",
    date: "2026-06-15",
    active: true,
  },
  {
    title: "Seaside Condominium",
    location: "Cebu City, Cebu",
    price: 8900000,
    beds: 2,
    baths: 2,
    area: "120 sqm",
    type: "Condos",
    tag: "New",
    gradient: "from-emerald-600 to-teal-600",
    date: "2026-07-01",
    active: true,
  },
  {
    title: "Executive Townhouse",
    location: "BGC, Taguig City",
    price: 18200000,
    beds: 3,
    baths: 2,
    area: "220 sqm",
    type: "Townhouses",
    tag: "Hot Deal",
    gradient: "from-orange-500 to-rose-500",
    date: "2026-05-20",
    active: true,
  },
  {
    title: "Garden Estate Home",
    location: "Alabang, Muntinlupa",
    price: 32000000,
    beds: 5,
    baths: 4,
    area: "500 sqm",
    type: "Houses",
    tag: "Premium",
    gradient: "from-purple-600 to-pink-600",
    date: "2026-04-10",
    active: true,
  },
  {
    title: "Downtown Studio Loft",
    location: "Ortigas, Pasig City",
    price: 4500000,
    beds: 1,
    baths: 1,
    area: "45 sqm",
    type: "Apartments",
    tag: "Affordable",
    gradient: "from-cyan-600 to-blue-600",
    date: "2026-07-05",
    active: true,
  },
  {
    title: "Hillside Retreat",
    location: "Tagaytay, Cavite",
    price: 14800000,
    beds: 3,
    baths: 3,
    area: "280 sqm",
    type: "Houses",
    tag: "Exclusive",
    gradient: "from-violet-600 to-indigo-600",
    date: "2026-03-18",
    active: true,
  },
  {
    title: "Skyline Penthouse",
    location: "Rockwell, Makati City",
    price: 45000000,
    beds: 4,
    baths: 4,
    area: "400 sqm",
    type: "Condos",
    tag: "Luxury",
    gradient: "from-rose-600 to-pink-600",
    date: "2026-06-28",
    active: true,
  },
  {
    title: "Lakefront Cottage",
    location: "Calamba, Laguna",
    price: 9800000,
    beds: 2,
    baths: 2,
    area: "160 sqm",
    type: "Houses",
    tag: "New",
    gradient: "from-teal-500 to-emerald-600",
    date: "2026-07-03",
    active: true,
  },
  {
    title: "Commercial Office Space",
    location: "Eastwood, Quezon City",
    price: 22000000,
    beds: 0,
    baths: 2,
    area: "300 sqm",
    type: "Commercial",
    tag: "Investment",
    gradient: "from-amber-500 to-orange-600",
    date: "2026-02-14",
    active: true,
  },
  {
    title: "Beachfront Apartment",
    location: "Boracay, Aklan",
    price: 12500000,
    beds: 2,
    baths: 1,
    area: "95 sqm",
    type: "Apartments",
    tag: "Hot Deal",
    gradient: "from-sky-500 to-blue-600",
    date: "2026-06-10",
    active: true,
  },
  {
    title: "Heritage Townhouse",
    location: "Intramuros, Manila",
    price: 16500000,
    beds: 3,
    baths: 2,
    area: "200 sqm",
    type: "Townhouses",
    tag: "Exclusive",
    gradient: "from-fuchsia-500 to-purple-600",
    date: "2026-01-22",
    active: true,
  },
  {
    title: "Suburban Family Home",
    location: "Antipolo, Rizal",
    price: 7200000,
    beds: 3,
    baths: 2,
    area: "180 sqm",
    type: "Houses",
    tag: "Featured",
    gradient: "from-lime-500 to-green-600",
    date: "2026-05-05",
    active: true,
  },
  {
    title: "Riverside Condo",
    location: "Mandaluyong City",
    price: 6800000,
    beds: 1,
    baths: 1,
    area: "55 sqm",
    type: "Condos",
    tag: "Affordable",
    gradient: "from-indigo-500 to-blue-600",
    date: "2026-06-20",
    active: true,
  },
  {
    title: "Mountain View Estate",
    location: "Baguio City, Benguet",
    price: 28000000,
    beds: 5,
    baths: 3,
    area: "450 sqm",
    type: "Houses",
    tag: "Premium",
    gradient: "from-emerald-500 to-cyan-600",
    date: "2026-04-28",
    active: true,
  },
  {
    title: "Urban Micro Apartment",
    location: "Poblacion, Makati City",
    price: 3200000,
    beds: 1,
    baths: 1,
    area: "30 sqm",
    type: "Apartments",
    tag: "New",
    gradient: "from-pink-500 to-rose-600",
    date: "2026-07-07",
    active: true,
  },
  {
    title: "Commercial Retail Space",
    location: "Bonifacio High Street, BGC",
    price: 38000000,
    beds: 0,
    baths: 1,
    area: "250 sqm",
    type: "Commercial",
    tag: "Investment",
    gradient: "from-yellow-500 to-amber-600",
    date: "2026-03-02",
    active: true,
  },
  {
    title: "Cliffside Villa",
    location: "Batangas City, Batangas",
    price: 19500000,
    beds: 4,
    baths: 3,
    area: "320 sqm",
    type: "Houses",
    tag: "Exclusive",
    gradient: "from-blue-500 to-violet-600",
    date: "2026-05-30",
    active: true,
  },
  {
    title: "Garden Townhome",
    location: "Las Piñas City",
    price: 11200000,
    beds: 3,
    baths: 2,
    area: "175 sqm",
    type: "Townhouses",
    tag: "Featured",
    gradient: "from-green-500 to-teal-600",
    date: "2026-06-03",
    active: true,
  },
];

async function seed() {
  console.log("🌱 Seeding listing table with mock property data...\n");

  const { data, error } = await supabase
    .from("listing")
    .insert(listings)
    .select();

  if (error) {
    console.error("❌ Failed to seed listings:", error.message);
    console.error("   Details:", error.details);
    console.error("   Hint:", error.hint);
    process.exit(1);
  }

  console.log(`✅ Successfully inserted ${data.length} listings:\n`);
  data.forEach((row: Record<string, unknown>) => {
    console.log(`   [${row.id}] ${row.title} — ${row.location} — ₱${Number(row.price).toLocaleString()}`);
  });
  console.log("\n🎉 Done! Check your Supabase Table Editor to verify.");
}

seed();
