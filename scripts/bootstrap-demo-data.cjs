const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function ensureDemoSalon() {
  const existingSalon = await prisma.salon.findFirst({
    where: { is_active: true, approval_status: "approved" },
  });

  if (existingSalon) {
    return existingSalon;
  }

  return prisma.salon.create({
    data: {
      name: "Noamskin Bangsar",
      slug: "noamskin-bangsar",
      description:
        "Signature aesthetic skincare studio offering curated facials, skin rituals, and recovery treatments.",
      address: "Bangsar, Kuala Lumpur",
      city: "Kuala Lumpur",
      state: "Kuala Lumpur",
      pincode: "59000",
      phone: "+60 12-345 6789",
      email: "hello@noamskin.com",
      is_active: true,
      approval_status: "approved",
      approved_at: new Date(),
    },
  });
}

async function ensureDemoServices(salonId) {
  const serviceCount = await prisma.service.count();
  if (serviceCount > 0) return;

  await prisma.service.createMany({
    data: [
      {
        salon_id: salonId,
        name: "Custom Facial",
        description: "A personalized facial tailored to your current skin needs.",
        price: 189,
        duration_minutes: 60,
        category: "Facial",
        image_url:
          "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80",
        is_active: true,
      },
      {
        salon_id: salonId,
        name: "Hydra Glow Therapy",
        description: "Deep hydration ritual for plump, glassy and refreshed skin.",
        price: 249,
        duration_minutes: 75,
        category: "Skin Treatment",
        image_url:
          "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
        is_active: true,
      },
      {
        salon_id: salonId,
        name: "Acne Recovery Peel",
        description: "Clarifying peel treatment to calm congestion and post-acne texture.",
        price: 219,
        duration_minutes: 50,
        category: "Peel",
        image_url:
          "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80",
        is_active: true,
      },
    ],
  });
}

async function ensureDemoProducts() {
  const productCount = await prisma.platformProduct.count();
  if (productCount > 0) return;

  await prisma.platformProduct.createMany({
    data: [
      {
        name: "Barrier Reset Cleanser",
        description: "Gentle daily cleanser designed for sensitive and post-treatment skin.",
        features: "Soothing, low-foam, barrier-friendly",
        sku: "NS-CLEANSE-001",
        price: 89,
        discount: 0,
        stock_quantity: 30,
        image_url:
          "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80",
        category: "Cleanser",
        brand: "Noamskin",
        target_audience: "both",
        is_active: true,
      },
      {
        name: "Peptide Repair Serum",
        description: "Lightweight serum focused on hydration, repair and luminosity.",
        features: "Peptides, hydration support, glow boost",
        sku: "NS-SERUM-002",
        price: 149,
        discount: 10,
        stock_quantity: 20,
        image_url:
          "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80",
        category: "Serum",
        brand: "Noamskin",
        target_audience: "both",
        is_active: true,
      },
      {
        name: "Daily Veil SPF 50",
        description: "Invisible broad-spectrum sunscreen for humid climates.",
        features: "No white cast, makeup-friendly, daily wear",
        sku: "NS-SPF-003",
        price: 119,
        discount: 0,
        stock_quantity: 25,
        image_url:
          "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1200&q=80",
        category: "Sunscreen",
        brand: "Noamskin",
        target_audience: "both",
        is_active: true,
      },
    ],
  });
}

async function main() {
  const salon = await ensureDemoSalon();
  await ensureDemoServices(salon.id);
  await ensureDemoProducts();
}

main()
  .catch((error) => {
    console.error("[bootstrap-demo-data] Failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
