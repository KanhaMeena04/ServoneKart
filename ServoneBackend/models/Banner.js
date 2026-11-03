const mongoose = require("mongoose");
const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true }, // URL
    type: {
      type: String,
      enum: ["restaurant", "item", "external", "static", "category"],
      default: "static",
    },
    // Placement defines where this banner appears:
    // 'hero' = Main top carousel slider on web and user app
    // 'offer_card' = 3-column promo/offer cards under hero section
    // 'promo' = In-feed category promotional banner
    placement: {
      type: String,
      enum: ["hero", "offer_card", "promo", "static"],
      default: "hero",
    },
    subtitle: { type: String, default: "" },
    badge: { type: String, default: "" }, // e.g. "FLAT 30% OFF", "10-15 MINS", "STARTING @ ₹49"
    buttonText: { type: String, default: "Shop Now" }, // e.g. "Order Fresh", "Shop Now", "Explore"
    link: { type: String, default: "" }, // route or target URL e.g. "/category/fruits-vegetables"
    bgGradient: { type: String, default: "from-[#002b80] via-[#0055ff] to-[#38bdf8]" },
    targetId: { type: mongoose.Schema.Types.ObjectId, refPath: "targetModel" },
    targetModel: {
      type: String,
      enum: ["Restaurant", "Product", "Category"],
    },
    restaurant: { type: mongoose.Schema.Types.Mixed },
    city: { type: String },
    cityName: { type: String },
    isActive: { type: Boolean, default: true },
    position: { type: Number, default: 0 }, // For sorting order
  },
  { timestamps: true, strict: false }
);
module.exports = mongoose.model("Banner", bannerSchema);
