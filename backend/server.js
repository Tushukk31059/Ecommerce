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
// ✅ Stripe webhook FIRST
// app.post(
//   "/api/v1/orders/stripe-webhook",
//   bodyParser.raw({ type: "application/json" }),
//   stripeWebhook
// );

app.use("/api/v1/orders/stripe-webhook", express.raw({ type: "application/json" }),
stripeWebhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: "http://localhost:5173",
  credentials:true
}))
const PORT = process.env.PORT || 3000;

app.use('/api/v1/users',userRoute);
app.use('/api/v1/products',productRoute);
app.use('/api/v1/cart',cartRoute);
app.use('/api/v1/orders',orderRoute);


  connectDB();
app.listen(PORT,() =>{
  
    console.log(`Server is listening on ${PORT}`)
})