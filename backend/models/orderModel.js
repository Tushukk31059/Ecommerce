import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],

    amount: { type: Number, required: true },
    tax: { type: Number, required: true },
    shipping: { type: Number, required: true },

    currency: {
      type: String,
      default: "usd",   // since we are using Stripe US test mode
    },

    status: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",

    },

    // ✅ Stripe fields
    stripePaymentIntentId: {
      type: String,
      unique: true, // Recommended to prevent duplicate processing
      sparse: true,
    },

    stripeClientSecret: {
      type: String,
    },

    stripePaymentStatus: {
      type: String,
    },

  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);