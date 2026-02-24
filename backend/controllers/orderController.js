import stripe from "../config/stripe.js";
import { Order } from "../models/orderModel.js";
import { Cart } from "../models/cartModel.js";
import {User} from "../models/userModel.js"

import {Product} from "../models/productModel.js"
// ---------------------- CREATE ORDER ----------------------
export const createOrder = async (req, res) => {
  try {
    const { products, amount, tax, shipping, currency } = req.body;

    const totalAmount = Number(amount) + Number(tax) + Number(shipping);

    // 1️⃣ Create order in DB (Pending)
    const newOrder = new Order({
      user: req.user._id,
      products,
      amount,
      tax,
      shipping,
      currency: currency || "usd",
      status: "Pending",
    });

    // 2️⃣ Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // cents
      currency: currency || "usd",
      metadata: {
        order_id: newOrder._id.toString(),
        user_id: req.user._id.toString(),
      },
    });

    // 3️⃣ Save Stripe details
    newOrder.stripePaymentIntentId = paymentIntent.id;
    newOrder.stripeClientSecret = paymentIntent.client_secret;
    newOrder.stripePaymentStatus = paymentIntent.status;

    await newOrder.save();

    // 4️⃣ Send clientSecret to frontend
    return res.status(201).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      orderId: newOrder._id,
    });
  } catch (error) {
    console.log("Error creating order:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------------- STRIPE WEBHOOK ----------------------
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret
    );
  } catch (err) {
    console.log("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      const order = await Order.findByIdAndUpdate(
        paymentIntent.metadata.order_id,
        {
          status: "Paid",
          stripePaymentStatus: paymentIntent.status,
        },
        { new: true }
      );

      // ✅ Check if order exists before proceeding to avoid "null" crashes
      if (order) {
        // Clear cart
        await Cart.findOneAndUpdate(
          { userId: paymentIntent.metadata.user_id },
          { $set: { items: [], totalPrice: 0 } }
        );
        console.log(`Order ${order._id} marked as Paid`);
      } else {
        console.log("Webhook: Order not found in database (Expected during 'stripe trigger')");
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;

      const order = await Order.findByIdAndUpdate(
        paymentIntent.metadata.order_id,
        {
          status: "Failed",
          stripePaymentStatus: paymentIntent.status,
        }
      );

      if (order) {
        console.log(`Order ${order._id} marked as Failed`);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.log("Error handling webhook:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyOrder = async(req ,res) =>{
  try{
    const userId = req.id;
    const orders = await Order.find({user:userId})
    .populate({path:"products.productId",select:"productName productPrice productImg"})
    .populate("user","firstName lastName email")
    res.status(200).json({
      success:true,
      count:orders.length,
      orders

    })


  } catch(error){
    console.error("Error fetching user orders:",error)
    res.status(500).json({message:error.message})
  }
} 

export const getUserOrders = async(req ,res) =>{
  try {
    const {  userId } = req.params;
       // Safety check: Ensure userId exists before querying
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }
    const orders = await Order.find({user:userId})
    .populate({
      path:"products.productId",
      select:"productName productPrice productImg"
    })  // fetch product details 
    .populate("user","firstName lastName email")
    res.status(200).json({success:true,
      count:orders.length,
      orders
    })

  } catch(error){
    console.log("Error in fetching user order",error);
    res.status(500).json({message:error.message})
  }
}

export const getAllOrdersAdmin =  async(req ,res) =>{
  try{

    const orders = await Order.find()
    .sort({createdAt:-1})
    .populate("user","name email")
    .populate("products.productId","productName productPrice")
    res.json({success:true,
      count:orders.length,
      orders
    })
  } catch(error){
     console.log(error);
    res.status(500).json({success:false , message:"Failed to fetch all orders",error:error.message})
    
  }
}

// export const getSalesData =  async(req ,res) => {
//   try{
//     const totalUsers = await User.countDocuments({});
//     const totalProducts = await Product.countDocuments({});
//     const totalOrders =  await Order.countDocuments({});

//     // total sales amount 
//     const totalSaleAgg = await Order.aggregate([
//       {$match :{status:"Paid"}},
//       {$group: {_id:null,total:{$sum:"$amount"}}}
//     ])
//     const totalSales = totalSaleAgg[0]?.total || 0;

//     // sales grouped by date 
//     const thirtyDaysAgo = new Date();
//     thirtyDaysAgo.setDate(thirtyDaysAgo.getDate()-30)

//     const salesByDate = await Order.aggregate([
//       {$match:{status:"Paid",createdAt:{$gte:thirtyDaysAgo}}},
//       {
//         $group:{
//           _id:{
//             $dateToString:{format: "%Y-%m-%d" ,date:"$createdAt"}
//           },
//           amount:{$sum:"$amount"},
//         }
//       },
//       {$sort:{ _id:1}}
//     ])

    
//     const formattedSales = salesByDate.map((item) =>({
//       date :item._id,
//       amount:item.amount
//     }))
//     res.json({
//       success:true,
//       totalUsers,
//       totalProducts,
//       totalOrders,
//       totalSales,
//       sales:formattedSales
//     })

//   } catch(error){
//     console.error("Error in fetching the sales data",error);
//     res.status(500).json({success:false,message:error.message})


//   }
// }

export const getSalesData = async (req, res) => {
  try {
    // 1. Run independent counts in parallel to save time
    const [totalUsers, totalProducts, totalOrders] = await Promise.all([
      User.countDocuments({}),
      Product.countDocuments({}),
      Order.countDocuments({}),
    ]);

    // 2. Total sales amount
    const totalSaleAgg = await Order.aggregate([
      { $match: { status: "Paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalSales = totalSaleAgg.length > 0 ? totalSaleAgg[0].total : 0;

    // 3. Sales grouped by date (last 30 full days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0); // Start from the beginning of the day

    const salesByDate = await Order.aggregate([
      { 
        $match: { 
          status: "Paid", 
          createdAt: { $gte: thirtyDaysAgo } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          amount: { $sum: "$amount" },
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format the response
    const formattedSales = salesByDate.map((item) => ({
      date: item._id,
      amount: item.amount
    }));

    res.json({
      success: true,
      totalUsers,
      totalProducts,
      totalOrders,
      totalSales,
      sales: formattedSales
    });

  } catch (error) {
    console.error("Error in fetching the sales data:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  }
};
