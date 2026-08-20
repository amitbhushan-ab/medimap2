import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const allMedicines = await ctx.db.query("medicines").collect();
    if (!args.query) return [];
    
    // 1. Find matching medicine
    const matchingMed = allMedicines.find((med) => 
      med.name.toLowerCase().includes(args.query.toLowerCase())
    );
    
    if (!matchingMed) return [];

    // 2. Find all prices for this medicine
    const prices = await ctx.db
      .query("prices")
      .filter((q) => q.eq(q.field("medicineId"), matchingMed._id))
      .collect();

    // 3. Join with pharmacies
    const results = [];
    let minPrice = Infinity;

    for (const price of prices) {
      const pharmacy = await ctx.db.get(price.pharmacistId);
      if (pharmacy) {
        if (price.inStock && price.price < minPrice) minPrice = price.price;
        
        results.push({
          _id: price._id,
          pharmacy: pharmacy,
          medicine: matchingMed,
          price: price.price,
          inStock: price.inStock,
          isCheapest: false,
        });
      }
    }

    // 4. Mark cheapest
    return results.map(r => ({
      ...r,
      isCheapest: r.price === minPrice && r.inStock
    }));
  },
});

export const getMedicines = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("medicines").collect();
  },
});

export const addMedicine = mutation({
  args: {
    name: v.string(),
    brand: v.optional(v.string()),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const newMedicineId = await ctx.db.insert("medicines", {
      name: args.name,
      brand: args.brand,
      category: args.category,
      description: args.description,
      createdAt: new Date().toISOString(),
    });
    return newMedicineId;
  },
});
