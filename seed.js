import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Category from './models/Category.js';

dotenv.config();

const categories = [
  { name: "Shoes", slug: "shoes", isActive: true },
  { name: "Belts", slug: "belts", isActive: true },
  { name: "Hair Creams", slug: "hair-creams", isActive: true },
  { name: "Jewellery", slug: "jewellery", isActive: true },
  { name: "Bags", slug: "bags", isActive: true },
];

// Fallback placeholder image (always works)
const PLACEHOLDER_IMG = "https://picsum.photos/500/500?random=";

const products = [
  // ========== SHOES ==========
  {
    name: "Nike Air Max 270",
    slug: "nike-air-max-270",
    description: "Breathable mesh upper with iconic Air Max heel unit for all-day comfort.",
    price: 149.99,
    discountPrice: 119.99,
    images: [`${PLACEHOLDER_IMG}1`],
    categoryName: "Shoes",
    brand: "Nike",
    stock: 45,
    attributes: { size: ["US 7", "US 8", "US 9", "US 10"], color: ["Black", "White"] },
    isFeatured: true,
  },
  {
    name: "Adidas Ultraboost 22",
    slug: "adidas-ultraboost-22",
    description: "Responsive Boost midsole and Primeknit upper for energy return.",
    price: 179.99,
    discountPrice: null,
    images: [`${PLACEHOLDER_IMG}2`],
    categoryName: "Shoes",
    brand: "Adidas",
    stock: 30,
    attributes: { size: ["US 7", "US 8", "US 9", "US 10"], color: ["Grey", "Blue"] },
    isFeatured: true,
  },
  {
    name: "Leather Formal Shoes",
    slug: "leather-formal-shoes",
    description: "Genuine leather upper with cushioned insole, perfect for office wear.",
    price: 89.99,
    discountPrice: 69.99,
    images: [`${PLACEHOLDER_IMG}3`],
    categoryName: "Shoes",
    brand: "Bata",
    stock: 60,
    attributes: { size: ["US 7", "US 8", "US 9", "US 10", "US 11"], color: ["Black", "Brown"] },
    isFlashSale: true,
  },
  {
    name: "Puma RS-X Sneakers",
    slug: "puma-rsx-sneakers",
    description: "Chunky silhouette with mesh and suede upper, modern retro style.",
    price: 119.99,
    discountPrice: 99.99,
    images: [`${PLACEHOLDER_IMG}4`],
    categoryName: "Shoes",
    brand: "Puma",
    stock: 25,
    attributes: { size: ["US 6", "US 7", "US 8", "US 9", "US 10"], color: ["White", "Black"] },
  },
  {
    name: "Converse Chuck Taylor",
    slug: "converse-chuck-taylor",
    description: "Iconic high-top canvas sneakers, timeless style for everyday wear.",
    price: 59.99,
    discountPrice: 49.99,
    images: [`${PLACEHOLDER_IMG}5`],
    categoryName: "Shoes",
    brand: "Converse",
    stock: 80,
    attributes: { size: ["US 5", "US 6", "US 7", "US 8", "US 9", "US 10"], color: ["Black", "White"] },
  },
  {
    name: "Vans Old Skool",
    slug: "vans-old-skool",
    description: "Classic skate shoe with side stripe, durable suede and canvas upper.",
    price: 64.99,
    discountPrice: null,
    images: [`${PLACEHOLDER_IMG}6`],
    categoryName: "Shoes",
    brand: "Vans",
    stock: 55,
    attributes: { size: ["US 6", "US 7", "US 8", "US 9", "US 10"], color: ["Black", "White"] },
  },
  // ========== BELTS ==========
  {
    name: "Genuine Leather Belt",
    slug: "genuine-leather-belt",
    description: "Full-grain leather belt with polished buckle, durable and stylish.",
    price: 29.99,
    discountPrice: 19.99,
    images: [`${PLACEHOLDER_IMG}7`],
    categoryName: "Belts",
    brand: "Tommy Hilfiger",
    stock: 100,
    attributes: { size: ["S", "M", "L", "XL"], color: ["Black", "Brown"] },
    isFeatured: true,
  },
  {
    name: "Canvas Web Belt",
    slug: "canvas-web-belt",
    description: "Casual canvas belt with metal buckle, adjustable fit.",
    price: 14.99,
    discountPrice: 9.99,
    images: [`${PLACEHOLDER_IMG}8`],
    categoryName: "Belts",
    brand: "Levi's",
    stock: 200,
    attributes: { size: ["One Size"], color: ["Khaki", "Navy", "Black"] },
    isFlashSale: true,
  },
  // ========== HAIR CREAMS ==========
  {
    name: "Shea Moisture Curl Enhancing Smoothie",
    slug: "shea-moisture-curl-smoothie",
    description: "Hydrates and defines curls, reduces frizz, no sulfates.",
    price: 12.99,
    discountPrice: 9.99,
    images: [`${PLACEHOLDER_IMG}9`],
    categoryName: "Hair Creams",
    brand: "Shea Moisture",
    stock: 80,
    attributes: { size: ["12oz"], material: "Shea Butter, Coconut Oil" },
    isFeatured: true,
  },
  {
    name: "Cantu Shea Butter Leave-In Cream",
    slug: "cantu-leave-in-cream",
    description: "Moisturizes and restores natural hair, reduces breakage.",
    price: 7.99,
    discountPrice: 5.99,
    images: [`${PLACEHOLDER_IMG}10`],
    categoryName: "Hair Creams",
    brand: "Cantu",
    stock: 150,
    attributes: { size: ["16oz"], material: "Shea Butter" },
  },
  // ========== JEWELLERY ==========
  {
    name: "Silver Plated Chain Necklace",
    slug: "silver-chain-necklace",
    description: "Elegant silver plated chain, hypoallergenic, gift box included.",
    price: 24.99,
    discountPrice: 19.99,
    images: [`${PLACEHOLDER_IMG}11`],
    categoryName: "Jewellery",
    brand: "Pandora",
    stock: 40,
    attributes: { size: ["18 inch"], color: ["Silver"] },
  },
  {
    name: "Gold Plated Hoop Earrings",
    slug: "gold-hoop-earrings",
    description: "Classic hoop earrings, lightweight and durable.",
    price: 19.99,
    discountPrice: 14.99,
    images: [`${PLACEHOLDER_IMG}12`],
    categoryName: "Jewellery",
    brand: "Swarovski",
    stock: 60,
    attributes: { size: ["1.5 inch"], color: ["Gold"] },
    isFlashSale: true,
  },
  // ========== BAGS ==========
  {
    name: "Laptop Backpack (15.6 inch)",
    slug: "laptop-backpack",
    description: "Water-resistant backpack with padded laptop compartment, USB charging port.",
    price: 49.99,
    discountPrice: 39.99,
    images: [`${PLACEHOLDER_IMG}13`],
    categoryName: "Bags",
    brand: "Samsonite",
    stock: 75,
    attributes: { size: ["One Size"], color: ["Black", "Grey"] },
    isFeatured: true,
  },
  {
    name: "Leather Messenger Bag",
    slug: "leather-messenger-bag",
    description: "Vintage style leather bag, fits tablet and documents, adjustable strap.",
    price: 79.99,
    discountPrice: 59.99,
    images: [`${PLACEHOLDER_IMG}14`],
    categoryName: "Bags",
    brand: "Fossil",
    stock: 35,
    attributes: { size: ["One Size"], color: ["Brown", "Black"] },
  },
  {
    name: "Women's Handbag Satchel",
    slug: "womens-handbag-satchel",
    description: "Elegant satchel handbag with gold hardware, detachable shoulder strap.",
    price: 69.99,
    discountPrice: 54.99,
    images: [`${PLACEHOLDER_IMG}15`],
    categoryName: "Bags",
    brand: "Michael Kors",
    stock: 30,
    attributes: { size: ["Medium", "Large"], color: ["Brown", "Black"] },
  },
  {
    name: "Crossbody Phone Bag",
    slug: "crossbody-phone-bag",
    description: "Compact crossbody bag that fits phone, cards, and keys.",
    price: 19.99,
    discountPrice: 14.99,
    images: [`${PLACEHOLDER_IMG}16`],
    categoryName: "Bags",
    brand: "Guess",
    stock: 100,
    attributes: { size: ["One Size"], color: ["Black", "White", "Pink"] },
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log("🗑️ Deleted existing categories and products");

    const createdCategories = await Category.insertMany(categories);
    console.log(`📁 Created ${createdCategories.length} categories`);

    const categoryMap = {};
    createdCategories.forEach(cat => { categoryMap[cat.name] = cat._id; });

    const productsWithCategories = products.map(p => ({
      ...p,
      category: categoryMap[p.categoryName],
    }));
    productsWithCategories.forEach(p => delete p.categoryName);

    await Product.insertMany(productsWithCategories);
    console.log(`📦 Seeded ${productsWithCategories.length} products`);

    console.log("🎉 Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
