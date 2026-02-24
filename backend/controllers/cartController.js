import{ Cart }from "../models/cartModel.js";
import {Product} from "../models/productModel.js";

// GET CART
export const getCart = async (req, res) => {
    try {
        const userId = req.id;
        const cart = await Cart.findOne({ userId }).populate("items.productId");

        if (!cart) {
             return res.json({success:true,cart:[]});
           
        }

        return res.status(200).json({success:true,cart});
    } catch (error) {
       
        return res.status(500).json({success:false,message:error.message});
    }
};


// ADD TO CART
export const addToCart = async (req, res) => {
 try{
    const userId = req.id;
    const {productId} = req.body;
    // check if product exists 
    const product = await Product.findById(productId)
    if(!product){
        return res.status(404).json({success:false,message:"Product not found"})

    }
// find the users cart if any 
let cart = await Cart.findOne({userId})

// create a new if not any exists 
if(!cart){
    cart = new Cart({
        userId,
        items:[{productId,quantity:1,price:product.productPrice}],
        totalPrice:product.productPrice
    })
} else{
    // find if product is already in the cart 
    const itemIndex = cart.items.findIndex(
        (item)=>item.productId.toString() === productId
    ) 
    if(itemIndex > -1){
        cart.items[itemIndex].quantity += 1;


    } else {
        cart.items.push({
            productId,
            quantity:1,
            price:product.productPrice,
        })
    }
    // recalculate total price 
    cart.totalPrice = cart.items.reduce(
        (acc,item) => acc + item.price * item.quantity ,0
    )
}

console.log(cart.items, cart.totalPrice)


// save updated cart 
await cart.save();
const populatedCart = await Cart.findById(cart._id).populate("items.productId")
return res.status(200).json({success:true,message:"Product added to cart successfully" ,cart:populatedCart})

 } catch(error){
    return res.status(500).json({success:false,message:error.message})
 }
};


// UPDATE QUANTITY
export const updateQuantity = async (req, res) => {
    try {
        const userId = req.id;
        const { productId, type } = req.body;

      let cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({success:false, message: "Cart not found" });

        const item = cart.items.find(item => item.productId.toString() === productId);
        if (!item) return res.status(404).json({success:false, message: "Item not found " });

      if(type === 'increase') item.quantity += 1;
      if(type === 'decrease' && item.quantity > 1) item.quantity -= 1;
      cart.totalPrice = cart.items.reduce((acc,item) => acc+item.price * item.quantity,0)
      await cart.save();
     cart =  await cart.populate("items.productId")
     res.status(200).json({success:true,cart})


    } catch (error) {
       
        return res.status(500).json({success:false, message: error.message });
    }
};


// REMOVE ITEM
export const removeFromCart = async (req, res) => {
    try {
        const userId = req.id;
        const { productId } = req.body;

        let cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({success:false, message: "Cart not found" });

        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
       cart.totalPrice = cart.items.reduce((acc,item) => acc + item.price * item.quantity,0)
       cart = await cart.populate("items.productId")
       await cart.save();
       res.status(200).json({success:true,cart})

    } catch (error) {
       
        return res.status(500).json({success:false, message: error.message });
    }
};
