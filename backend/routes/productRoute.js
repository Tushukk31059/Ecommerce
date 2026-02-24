import express from "express";
import { addProduct, deleteProduct, getAllProduct, updateProduct } from "../controllers/productController.js";
import { isAdmin, isAuthenticated } from "../middleware/isAuthenticated.js";
import { multipleUpload, singleUpload } from "../middleware/multer.js";

const router = express.Router();
// router.post('/add' ,isAuthenticated,isAdmin,multipleUpload, addProduct)
import multer from "multer";

router.post("/add", isAuthenticated,isAdmin, (req, res) => {
  multipleUpload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors
      return res.status(400).json({
        success: false,
        message: "Image size must be less than 10MB",
      });
    } else if (err) {
      // Other errors
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    // If no error, continue
    addProduct(req, res);
  });
});


router.get("/getallproducts",getAllProduct);
router.delete("/delete/:productId",isAuthenticated,isAdmin,deleteProduct);
router.put("/update/:productId",isAuthenticated,isAdmin, multipleUpload, updateProduct)



export default router;

