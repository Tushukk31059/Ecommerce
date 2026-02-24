import express from "express";
import { isAuthenticated ,isAdmin } from "../middleware/isAuthenticated.js";
import { createOrder, getAllOrdersAdmin, getMyOrder, getSalesData, getUserOrders, stripeWebhook } from "../controllers/orderController.js";

const router = express.Router();

router.post("/create-order", isAuthenticated, createOrder);
router.post("/stripe-webhook", stripeWebhook);
router.get("/myorder",isAuthenticated ,getMyOrder);
router.get("/all",isAuthenticated ,isAdmin , getAllOrdersAdmin);
router.get("/user-order/:userId", isAuthenticated,isAdmin , getUserOrders);
router.get("/sales",isAuthenticated,isAdmin,getSalesData);



export default router;
