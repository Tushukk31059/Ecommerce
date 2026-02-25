import express from "express";
import 'dotenv/config';
import connectDB from "./database/db.js";
import userRoute from "./routes/userRoute.js"
import productRoute from "./routes/productRoute.js"
import cartRoute from "./routes/cartRoute.js";
import orderRoute from "./routes/orderRoute.js";
import cors from "cors";
import bodyParser from "body-parser";
import { stripeWebhook } from "./controllers/orderController.js";

const app = express();

// Database connect kar lo
connectDB();

// ✅ Stripe webhook FIRST
app.use("/api/v1/orders/stripe-webhook", express.raw({ type: "application/json" }), stripeWebhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ FIX 1: CORS mein apna Vercel frontend URL add karein
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "https://ecommerce-chi-topaz-17.vercel.app/" // <-- YAHAN APNA FRONTEND KA VERCEL LINK DAALEIN
  ],
  credentials: true
}));

// ✅ FIX 2: Root route add kiya taaki "Cannot GET /" na aaye
app.get('/', (req, res) => {
    res.send("Backend is up and running on Vercel!");
});

// Routes
app.use('/api/v1/users', userRoute);
app.use('/api/v1/products', productRoute);
app.use('/api/v1/cart', cartRoute);
app.use('/api/v1/orders', orderRoute);

// Vercel auto-assigns port, keeping this for local testing
const PORT = process.env.PORT || 3000;

app.listen(PORT,() =>{
    console.log(`Server is listening on ${PORT}`)
});

// ✅ FIX 3: Vercel serverless functions ke liye app ko export karna zaroori hai
export default app;