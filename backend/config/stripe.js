// backend/config/stripe.js
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config(); // loads keys from .env
// Ensure the key exists before initializing
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is missing from environment variables");
}

// Initialize Stripe with **secret key only**
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export default stripeInstance;