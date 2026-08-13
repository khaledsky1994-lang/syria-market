const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// A deep category tree (parent + subcategories), similar in spirit to
// Sahibinden's structure, adapted for a Syrian secondhand marketplace.
const categoryTree = [
  {
    nameAr: 'سيارات ومركبات', nameEn: 'Vehicles', nameTr: 'Vasıta', slug: 'vehicles', icon: '🚗',
    children: [
      { nameAr: 'سيارات', nameEn: 'Cars', nameTr: 'Otomobil', slug: 'vehicles-cars' },
      { nameAr: 'دراجات نارية', nameEn: 'Motorcycles', nameTr: 'Motosiklet', slug: 'vehicles-motorcycles' },
      { nameAr: 'شاحنات ومركبات ثقيلة', nameEn: 'Trucks & Heavy Vehicles', nameTr: 'Kamyon ve Ağır Vasıta', slug: 'vehicles-trucks' },
      { nameAr: 'قطع غيار', nameEn: 'Spare Parts', nameTr: 'Yedek Parça', slug: 'vehicles-parts' },
      { nameAr: 'زوارق ومركبات بحرية', nameEn: 'Boats', nameTr: 'Deniz Araçları', slug: 'vehicles-boats' },
    ],
  },
  {
    nameAr: 'عقارات', nameEn: 'Real Estate', nameTr: 'Emlak', slug: 'real-estate', icon: '🏠',
    children: [
      { nameAr: 'شقق للبيع', nameEn: 'Apartments for Sale', nameTr: 'Satılık Daire', slug: 'real-estate-apartments-sale' },
      { nameAr: 'شقق للإيجار', nameEn: 'Apartments for Rent', nameTr: 'Kiralık Daire', slug: 'real-estate-apartments-rent' },
      { nameAr: 'محلات ومكاتب', nameEn: 'Shops & Offices', nameTr: 'Dükkan ve Ofis', slug: 'real-estate-commercial' },
      { nameAr: 'أراضي', nameEn: 'Land', nameTr: 'Arsa', slug: 'real-estate-land' },
      { nameAr: 'فلل ومنازل', nameEn: 'Villas & Houses', nameTr: 'Villa ve Müstakil Ev', slug: 'real-estate-villas' },
    ],
  },
  {
    nameAr: 'إلكترونيات', nameEn: 'Electronics', nameTr: 'Elektronik', slug: 'electronics', icon: '📱',
    children: [
      { nameAr: 'هواتف وإكسسوارات', nameEn: 'Phones & Accessories', nameTr: 'Telefon ve Aksesuar', slug: 'electronics-phones' },
      { nameAr: 'لابتوب وحواسيب', nameEn: 'Laptops & Computers', nameTr: 'Bilgisayar', slug: 'electronics-computers' },
      { nameAr: 'تلفزيونات وصوتيات', nameEn: 'TVs & Audio', nameTr: 'TV ve Ses Sistemleri', slug: 'electronics-tv-audio' },
      { nameAr: 'كاميرات', nameEn: 'Cameras', nameTr: 'Kamera', slug: 'electronics-cameras' },
      { nameAr: 'ألعاب فيديو', nameEn: 'Video Games', nameTr: 'Video Oyunları', slug: 'electronics-gaming' },
    ],
  },
  {
    nameAr: 'أثاث ومنزل', nameEn: 'Furniture & Home', nameTr: 'Mobilya ve Ev', slug: 'furniture', icon: '🛋️',
    children: [
      { nameAr: 'غرف جلوس', nameEn: 'Living Room', nameTr: 'Oturma Odası', slug: 'furniture-living-room' },
      { nameAr: 'غرف نوم', nameEn: 'Bedroom', nameTr: 'Yatak Odası', slug: 'furniture-bedroom' },
      { nameAr: 'مطابخ', nameEn: 'Kitchen', nameTr: 'Mutfak', slug: 'furniture-kitchen' },
      { nameAr: 'ديكور منزلي', nameEn: 'Home Decor', nameTr: 'Ev Dekorasyonu', slug: 'furniture-decor' },
    ],
  },
  {
    nameAr: 'أجهزة منزلية', nameEn: 'Home Appliances', nameTr: 'Beyaz Eşya', slug: 'appliances', icon: '🧺',
    children: [
      { nameAr: 'ثلاجات', nameEn: 'Refrigerators', nameTr: 'Buzdolabı', slug: 'appliances-fridges' },
      { nameAr: 'غسالات', nameEn: 'Washing Machines', nameTr: 'Çamaşır Makinesi', slug: 'appliances-washers' },
      { nameAr: 'مكيفات', nameEn: 'Air Conditioners', nameTr: 'Klima', slug: 'appliances-ac' },
      { nameAr: 'أجهزة مطبخ', nameEn: 'Kitchen Appliances', nameTr: 'Mutfak Aletleri', slug: 'appliances-kitchen' },
    ],
  },
  {
    nameAr: 'أزياء', nameEn: 'Fashion', nameTr: 'Giyim', slug: 'fashion', icon: '👕',
    children: [
      { nameAr: 'ملابس رجالية', nameEn: "Men's Clothing", nameTr: 'Erkek Giyim', slug: 'fashion-men' },
      { nameAr: 'ملابس نسائية', nameEn: "Women's Clothing", nameTr: 'Kadın Giyim', slug: 'fashion-women' },
      { nameAr: 'ملابس أطفال', nameEn: "Kids' Clothing", nameTr: 'Çocuk Giyim', slug: 'fashion-kids' },
      { nameAr: 'أحذية وحقائب', nameEn: 'Shoes & Bags', nameTr: 'Ayakkabı ve Çanta', slug: 'fashion-shoes-bags' },
    ],
  },
  {
    nameAr: 'رياضة وهوايات', nameEn: 'Sports & Hobbies', nameTr: 'Spor ve Hobi', slug: 'sports-hobbies', icon: '⚽',
    children: [
      { nameAr: 'معدات رياضية', nameEn: 'Fitness Equipment', nameTr: 'Fitness Ekipmanları', slug: 'sports-fitness' },
      { nameAr: 'دراجات هوائية', nameEn: 'Bicycles', nameTr: 'Bisiklet', slug: 'sports-bicycles' },
      { nameAr: 'كتب', nameEn: 'Books', nameTr: 'Kitap', slug: 'sports-books' },
      { nameAr: 'آلات موسيقية', nameEn: 'Musical Instruments', nameTr: 'Müzik Aletleri', slug: 'sports-instruments' },
    ],
  },
  {
    nameAr: 'خدمات', nameEn: 'Services', nameTr: 'Hizmetler', slug: 'services', icon: '🛠️',
    children: [
      { nameAr: 'صيانة وتصليح', nameEn: 'Repair Services', nameTr: 'Tamir ve Bakım', slug: 'services-repair' },
      { nameAr: 'دروس خصوصية', nameEn: 'Tutoring', nameTr: 'Özel Ders', slug: 'services-tutoring' },
      { nameAr: 'نقل وتوصيل', nameEn: 'Moving & Delivery', nameTr: 'Nakliye ve Teslimat', slug: 'services-moving' },
    ],
  },
  {
    nameAr: 'أخرى', nameEn: 'Other', nameTr: 'Diğer', slug: 'other', icon: '📦',
    children: [],
  },
];

async function main() {
  console.log('Seeding categories...');
  for (const top of categoryTree) {
    const { children, ...topData } = top;
    const parent = await prisma.category.upsert({
      where: { slug: topData.slug },
      update: topData,
      create: topData,
    });
    for (const child of children) {
      await prisma.category.upsert({
        where: { slug: child.slug },
        update: { ...child, parentId: parent.id },
        create: { ...child, parentId: parent.id },
      });
    }
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
      emailVerified: true,
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
