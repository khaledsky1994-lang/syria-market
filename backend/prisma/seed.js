const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const categories = [
  { nameAr: 'إلكترونيات', nameEn: 'Electronics', slug: 'electronics', icon: '📱' },
  { nameAr: 'سيارات', nameEn: 'Vehicles', slug: 'vehicles', icon: '🚗' },
  { nameAr: 'أثاث منزلي', nameEn: 'Furniture', slug: 'furniture', icon: '🛋️' },
  { nameAr: 'أزياء', nameEn: 'Fashion', slug: 'fashion', icon: '👕' },
  { nameAr: 'عقارات', nameEn: 'Real Estate', slug: 'real-estate', icon: '🏠' },
  { nameAr: 'أجهزة منزلية', nameEn: 'Home Appliances', slug: 'appliances', icon: '🧺' },
  { nameAr: 'كتب وهوايات', nameEn: 'Books & Hobbies', slug: 'books-hobbies', icon: '📚' },
  { nameAr: 'رياضة', nameEn: 'Sports', slug: 'sports', icon: '⚽' },
  { nameAr: 'أخرى', nameEn: 'Other', slug: 'other', icon: '📦' },
];

async function main() {
  console.log('Seeding categories...');
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  console.log('Seeding admin user (admin@syriamarket.sy / Admin123!)...');
  const passwordHash = await bcrypt.hash('Admin123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@syriamarket.sy' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@syriamarket.sy',
      phone: '0999999999',
      passwordHash,
      role: 'ADMIN',
      isVerified: true,
    },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
