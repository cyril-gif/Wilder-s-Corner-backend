import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Category from './models/Category.js';
import User from './models/User.js';

dotenv.config();

// Category data
const categories = [
  { name: "Shoes", slug: "shoes", isActive: true },
  { name: "Belts", slug: "belts", isActive: true },
  { name: "Hair Creams", slug: "hair-creams", isActive: true },
  { name: "Jewellery", slug: "jewellery", isActive: true },
  { name: "Bags", slug: "bags", isActive: true },
];

// Product data (will map to categories after creation)
const products = [
  // Shoes
  {
    name: "Nike Air Max 270",
    slug: "nike-air-max-270",
    description: "Breathable mesh upper with iconic Air Max heel unit for all-day comfort.",
    price: 149.99,
    discountPrice: 119.99,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"],
    categoryName: "Shoes",
    brand: "Nike",
    stock: 45,
    tags: ["shoes", "sport", "nike"],
    attributes: { size: ["US 7", "US 8", "US 9", "US 10"], color: ["Black", "White"] },
    isFeatured: true,
  },
  {
    name: "Adidas Ultraboost 22",
    slug: "adidas-ultraboost-22",
    description: "Responsive Boost midsole and Primeknit upper for energy return and a snug fit.",
    price: 179.99,
    discountPrice: null,
    images: ["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500"],
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
    images: ["https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=500"],
    categoryName: "Shoes",
    brand: "Bata",
    stock: 60,
    attributes: { size: ["US 7", "US 8", "US 9", "US 10", "US 11"], color: ["Black", "Brown"] },
  },
  // Belts
  {
    name: "Genuine Leather Belt",
    slug: "genuine-leather-belt",
    description: "Full-grain leather belt with polished buckle, durable and stylish.",
    price: 29.99,
    discountPrice: 19.99,
    images: ["https://images.unsplash.com/photo-1624222247344-550fb6d2c9e6?w=500"],
    categoryName: "Belts",
    brand: "Tommy Hilfiger",
    stock: 100,
    attributes: { size: ["S", "M", "L", "XL"], color: ["Black", "Brown"] },
  },
  {
    name: "Canvas Web Belt",
    slug: "canvas-web-belt",
    description: "Casual canvas belt with metal buckle, adjustable fit.",
    price: 14.99,
    discountPrice: 9.99,
    images: ["https://images.unsplash.com/photo-1622239054989-d2b6e3ee6b5f?w=500"],
    categoryName: "Belts",
    brand: "Levi's",
    stock: 200,
    attributes: { size: ["One Size"], color: ["Khaki", "Navy", "Black"] },
  },
  // Hair Creams
  {
    name: "Shea Moisture Curl Enhancing Smoothie",
    slug: "shea-moisture-curl-smoothie",
    description: "Hydrates and defines curls, reduces frizz, no sulfates.",
    price: 12.99,
    discountPrice: 9.99,
    images: ["https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=500"],
    categoryName: "Hair Creams",
    brand: "Shea Moisture",
    stock: 80,
    attributes: { size: ["12oz"], material: "Shea Butter, Coconut Oil" },
  },
  {
    name: "Cantu Shea Butter Leave-In Conditioning Cream",
    slug: "cantu-leave-in-cream",
    description: "Moisturizes and restores natural hair, reduces breakage.",
    price: 7.99,
    discountPrice: 5.99,
    images: ["https://images.unsplash.com/photo-1596462502278-27e2e2b0e7f8?w=500"],
    categoryName: "Hair Creams",
    brand: "Cantu",
    stock: 150,
    attributes: { size: ["16oz"], material: "Shea Butter, Coconut Oil" },
  },
  // Jewellery
  {
    name: "Silver Plated Chain Necklace",
    slug: "silver-chain-necklace",
    description: "Elegant silver plated chain, hypoallergenic, gift box included.",
    price: 24.99,
    discountPrice: 19.99,
    images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500"],
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
    images: ["https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=500"],
    categoryName: "Jewellery",
    brand: "Swarovski",
    stock: 60,
    attributes: { size: ["1.5 inch"], color: ["Gold"] },
  },
  // Bags
  {
    name: "Laptop Backpack (15.6 inch)",
    slug: "laptop-backpack",
    description: "Water-resistant backpack with padded laptop compartment, USB charging port.",
    price: 49.99,
    discountPrice: 39.99,
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500"],
    categoryName: "Bags",
    brand: "Samsonite",
    stock: 75,
    attributes: { size: ["One Size"], color: ["Black", "Grey"] },
  },
  {
    name: "Leather Messenger Bag",
    slug: "leather-messenger-bag",
    description: "Vintage style leather bag, fits tablet and documents, adjustable strap.",
    price: 79.99,
    discountPrice: 59.99,
    images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500"],
    categoryName: "Bags",
    brand: "Fossil",
    stock: 35,
    attributes: { size: ["One Size"], color: ["Brown", "Black"] },
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing categories and products (optional)
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log("Cleared existing categories and products");

    // Insert categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories`);

    // Build category map (name -> _id)
    const categoryMap = {};
    createdCategories.forEach(cat => { categoryMap[cat.name] = cat._id; });

    // Map products to category ObjectId
    const productsWithCategories = products.map(p => ({
      ...p,
      category: categoryMap[p.categoryName],
    }));

    // Remove temporary categoryName field
    productsWithCategories.forEach(p => delete p.categoryName);

    // Insert products
    await Product.insertMany(productsWithCategories);
    console.log(`Seeded ${productsWithCategories.length} products`);

    console.log("✅ Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
