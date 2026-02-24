 import { Product } from "../models/productModel.js";
import cloudinary from "../utilis/cloudinary.js";
import getDataUri from "../utilis/dataUri.js";

export const addProduct = async(req,res) => {
    try{
        // const {productName,productDesc,productPrice,category,brand} = req.body; 

        const {
  productName,
  productDesc,
  productPrice,
  category,
  brand,
} = Object.fromEntries(
  Object.entries(req.body).map(([k, v]) => [k.trim(), v])
);

       const userId = req.id || null;
        if(!productName || !productDesc || !productPrice || !category || !brand){
             return res.status(400).json({
            success:false,
            message:"All fields are required",
        })
        }
        // handle multiple images upload 
        let productImg = []
        if(req.files && req.files.length >0){
            for(let file of req.files){
                const fileUri = getDataUri(file)
                const result = await cloudinary.uploader.upload(fileUri,{
                    folder:"mern_products"
                });
                productImg.push({
                    url:result.secure_url,
                    public_id:result.public_id
                })
            }
        }

        // create a product 
        const newProduct = await   Product.create({
            userId,
            productName,
            productDesc,
            productPrice,
            category,
            brand,
            productImg,

        })
         return res.status(200).json({
            success:true,
            message:"Product added successfully",
            product:newProduct
        })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}


export const getAllProduct = async(_,res) => {
    try{
        const products = await Product.find()
        if(!products){
             return res.status(404).json({
            success:false,
            message:"No products available",
            products:[]
        })
        }
         return res.status(200).json({
            success:true,
            products
        })

    } catch(error){
         return res.status(500).json({
            success:false,
            message:error.message,
        })

    }
}


export const deleteProduct = async(req,res) => {
    try {
        const {productId} =  req.params;
        const product = await Product.findById(productId)
        if(!product){
             return res.status(404).json({
            success:false,
            message:"Product not found"
        })
        }

        // delete images from cloudinary 
        if(product.productImg && product.productImg.length >0) {
            for(let img of product.productImg){
                const result = await cloudinary.uploader.destroy(img.public_id);

            }
        }
        // delete product from mongodb
        await Product.findByIdAndDelete(productId);
         return res.status(200).json({
            success:true,
            message:"Product deleted successfully"
        })


    } catch(error){
         return res.status(500).json({
            success:false,
            message:error.message,
        })

    }
}

// export const updateProduct = async(req,res) => {
//     try {

//         const {productId} = req.params;
//         const { productName, productDesc, productPrice, category, brand,existingImages} = req.body;
//   const product = await Product.findById(productId)
//   if(!product){
//      return res.status(404).json({
//             success:false,
//             message:"Product not found"
//         })
    
//   }
//   let  updatedImages = []
//   if(existingImages){
//     const keepIds = JSON.parse(existingImages);
//     updatedImages = product.productImg.filter((img) => {
//         keepIds.includes(img.public_id)
//     });
//     const removedImages = product.productImg.filter((img) => {
//          !keepIds.includes(img.public_id)

//     });
//     for(let img of removedImages){
//         await cloudinary.uploader.destroy(img.public_id)
//     }
//   } else {
//     updatedImages = product.productImg
//   }
  
//   if(req.files && req.files.length >0){
//     for(let file of req.files){
//         const fileUri = getDataUri(file)
//         const result = await cloudinary.uploader.upload(fileUri,{folder:"mern_products"})
//         updatedImages.push({
//             url:result.secure_url,
//             public_id:result.public_id
//         })
//     }
//   }
// //   update product 
// product.productName = productName || product.productName
// product.productDesc = productDesc || product.productDesc
// product.productPrice = productPrice || product.productPrice
// product.category = category || product.category
// product.brand = brand || product.brand
// product.productImg = updatedImages

// await product.save();
// return res.status(200).json({
//             success:true,
//             message:"Product updated successfully",
//             product,
//         })


//     } catch(error){
//          return res.status(500).json({
//             success:false,
//             message:error.message,
//         })
//     }
// }






// code by ai 



export const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { productName, productDesc, productPrice, category, brand, existingImages } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        let updatedImages = [];

        // 1. HANDLE EXISTING IMAGES
        if (existingImages) {
            const keepIds = JSON.parse(existingImages);

            // FIX: Added 'return' keyword inside filters
            updatedImages = product.productImg.filter((img) => {
                return keepIds.includes(img.public_id);
            });

            const removedImages = product.productImg.filter((img) => {
                return !keepIds.includes(img.public_id);
            });

            // Delete removed images from Cloudinary
            for (let img of removedImages) {
                if (img.public_id) {
                    await cloudinary.uploader.destroy(img.public_id);
                }
            }
        } else {
            // If existingImages isn't sent, we assume no change (keeping all current)
            updatedImages = [...product.productImg];
        }

        // 2. HANDLE NEW IMAGE UPLOADS
        if (req.files && req.files.length > 0) {
            for (let file of req.files) {
                const fileUri = getDataUri(file);
                const result = await cloudinary.uploader.upload(fileUri.content, { 
                    folder: "mern_products" 
                });
                
                updatedImages.push({
                    url: result.secure_url,
                    public_id: result.public_id
                });
            }
        }

        // 3. UPDATE PRODUCT DATA
        product.productName = productName || product.productName;
        product.productDesc = productDesc || product.productDesc;
        product.productPrice = productPrice || product.productPrice;
        product.category = category || product.category;
        product.brand = brand || product.brand;
        product.productImg = updatedImages; // Merge complete

        await product.save();

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product,
        });

    } catch (error) {
        console.error("Update Controller Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};




