const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const s = await prisma.service.count();
  const i = await prisma.inventoryItem.count();
  const p = await prisma.platformProduct.count();
  console.log('Services:', s);
  console.log('Inventory:', i);
  console.log('Products:', p);
}
main().finally(() => prisma.$disconnect());
