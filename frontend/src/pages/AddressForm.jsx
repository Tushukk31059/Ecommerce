// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Separator } from '@/components/ui/separator'
// import { addAddress, deleteAddress, setCart, setSelectedAddress } from '@/redux/productSlice'
// import React, { useState } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import { useNavigate } from 'react-router-dom'
// import axios from "axios"

// import {
//   useStripe,
//   useElements,
//   CardElement,
// } from "@stripe/react-stripe-js";

// import { toast } from 'sonner'

// const AddressForm = () => {
//     const [formData, setFormData] = useState({
//         fullName: "",
//         phone: "",
//         email: "",
//         address: "",
//         city: "",
//         state: "",
//         zip: "",
//         country: "",
//     })

//     const { cart, addresses, selectedAddress } = useSelector((store) => store.product)
//     const [showForm, setShowForm] = useState(addresses?.length > 0 ? false : true)
//     const dispatch = useDispatch();
//     const navigate = useNavigate()
//     const stripe = useStripe();
//  const elements = useElements();


//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value })
//     }

//     const handleSave = () => {
//         dispatch(addAddress(formData));
       
//         setFormData({
//             fullName: "", phone: "", email: "", address: "",
//             city: "", state: "", zip: "", country: ""
//         });
//         setShowForm(false);
//     }
//     const subtotal = cart.totalPrice
//     const shipping = subtotal > 50 ? 0 : 10;
//     const tax = parseFloat((subtotal*0.05).toFixed(2))
//     const total = subtotal + shipping + tax
//   const handlePayment = async () => {
      
//   if (!stripe || !elements) {
//     toast.error("Stripe has not loaded yet. Please try again.");
//     return;
//   }

//   const accessToken = localStorage.getItem("accessToken");

//   try {
   
//     const { data } = await axios.post(
//       `${import.meta.env.VITE_URL}/api/v1/orders/create-order`,
//       {
//         products: cart?.items?.map((item) => ({
//           productId: item.productId._id,
//           quantity: item.quantity,
//         })),
//         tax,
//         shipping,
//         amount: total,
//         currency: "usd",
//       },
//       {
//         headers: { Authorization: `Bearer ${accessToken}` },
//       }
//     );

//     if (!data.success) {
//       return toast.error("Something went wrong");
//     }

//     const clientSecret = data.clientSecret;

 
//     const { error, paymentIntent } = await stripe.confirmCardPayment(
//       clientSecret,
//       {
//         payment_method: {
//           card: elements.getElement(CardElement),
//           billing_details: {
//              name: formData.fullName || addresses[selectedAddress]?.fullName,
//             email: formData.email || addresses[selectedAddress]?.email,
//           },
//         },
//       }
//     );

//     if (error) {
//       toast.error(error.message);
//       return;
//     }

    
//     if (paymentIntent.status === "succeeded") {
//       toast.success("Payment Successful!");
//       dispatch(setCart({ items: [], totalPrice: 0 }));
//       navigate("/order-success");
//     }
//   } catch (error) {
//      console.error("Payment Error:", error);
//     toast.error(error.response?.data?.message || "Payment failed");
//   }
// };

//     return (
//         <div className='max-w-7xl mx-auto grid place-items-center p-10'>
//             <div className='grid grid-cols-1 md:grid-cols-2 items-start gap-20 max-w-7xl mx-auto mt-10'>
//                 <div className='space-y-4 p-6 bg-white border rounded-lg shadow-sm'>
//                     {showForm ? (
//                         <>
                           
//                             <div>
//                                 <Label htmlFor="fullName">Full Name</Label>
//                                 <Input id="fullName" name="fullName" placeholder="John Doe" required value={formData.fullName} onChange={handleChange} />
//                             </div>
//                             <div>
//                                 <Label htmlFor="phone">Phone</Label>
//                                 <Input id="phone" name="phone" placeholder="9880765432" required value={formData.phone} onChange={handleChange} />
//                             </div>
//                             <div>
//                                 <Label htmlFor="email">Email</Label>
//                                 <Input id="email" name="email" placeholder="john@gmail.com" required value={formData.email} onChange={handleChange} />
//                             </div>
//                             <div>
//                                 <Label htmlFor="address">Address</Label>
//                                 <Input id="address" name="address" placeholder="123 Street, Area" required value={formData.address} onChange={handleChange} />
//                             </div>
//                             <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
//                                 <div>
//                                     <Label htmlFor="city">City</Label>
//                                     <Input id="city" name="city" placeholder="jalandhar" required value={formData.city} onChange={handleChange} />
//                                 </div>
//                                 <div>
//                                     <Label htmlFor="state">State</Label>
//                                     <Input id="state" name="state" placeholder="punjab" required value={formData.state} onChange={handleChange} />
//                                 </div>
//                             </div>
//                             <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
//                                 <div>
//                                     <Label htmlFor="zip">Zip Code</Label>
//                                     <Input id="zip" name="zip" placeholder="144003" required value={formData.zip} onChange={handleChange} />
//                                 </div>
//                                 <div>
//                                     <Label htmlFor="country">Country</Label>
//                                     <Input id="country" name="country" placeholder="India" required value={formData.country} onChange={handleChange} />
//                                 </div>
//                             </div>
//                             <Button onClick={handleSave} className='w-full'>Save & Continue</Button>
//                             {addresses?.length > 0 && (
//                                 <Button variant="ghost" onClick={() => setShowForm(false)} className='w-full'>Cancel</Button>
//                             )}
//                         </>
//                     ) : (
//                         <div className='space-y-4'>
//                             <div className='flex justify-between items-center'>
//                                 <h2 className='text-lg font-semibold'>Saved Addresses</h2>
                               
//                             </div>
//                             {addresses.map((addr, index) => {
//                                 return (
//                                     <div
//                                         key={index}
//                                         onClick={() => dispatch(setSelectedAddress(index))}
//                                         className={`border p-4 rounded-md cursor-pointer relative transition-all ${selectedAddress === index ? "border-pink-600 bg-pink-50" : "border-gray-300"}`}
//                                     >
//                                         <p className='font-medium'>{addr.fullName}</p>
//                                         <p className='text-sm text-gray-600'>{addr.phone}</p>
//                                         <p className='text-sm text-gray-600'>{addr.email}</p>
//                                         <p className='text-sm mt-2'>{addr.address} , {addr.city} , {addr.state} , {addr.zip} , {addr.country}</p>
                                        
//                                         <button 
//                                             className='absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs'
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 dispatch(deleteAddress(index));
//                                             }}
//                                         >
//                                             Delete
//                                         </button>
//                                     </div>
//                                 )
//                             })}
//                             <Button variant='outline' className='w-full' onClick={()=>setShowForm(true)}>Add new Address</Button>
//                             <Button 
//                            disabled
//                            = {selectedAddress === null} className='w-full bg-pink-600' onClick={handlePayment}>Proceed to Checkout</Button>
//                         </div>
//                     )}
//                 </div>
              
//                 <div>
//                     <Card className='w-[400px]'>
//                         <CardHeader>
//                             <CardTitle>Order Summary</CardTitle>
//                         </CardHeader>
//                         <CardContent className='space-y-4'>
//                             <div className='flex justify-between'>
//                                 <span>Subtotal ({cart.items.length}) items</span>
//                                 <span>₹{subtotal.toLocaleString("en-IN")}</span>
//                             </div>

                           

//                              <div className='flex justify-between'>
//                                 <span>Shipping</span>
//                                 <span>₹{shipping}</span>
//                             </div>

//                              <div className='flex justify-between'>
//                                 <span>Tax </span>
//                                 <span>₹{tax}</span>
//                             </div>
//                             <Separator/>


//                                  <div className='flex justify-between font-bold text-lg'>
//                                 <span>Total </span>
//                                 <span>₹{total}</span>
//                             </div>
//                             <div className='text-sm text-muted-foreground pt-4'>


//                                  <p>* Free Shipping on orders over 299</p>
//                   <p>*30-days return policy</p>
//                   <p>* Secure checkout with SSL encryption</p>
//                             </div>
                            
//                         </CardContent>
//                     </Card>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default AddressForm;


import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { addAddress, deleteAddress, setCart, setSelectedAddress } from '@/redux/productSlice'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from "axios"

// ✅ Stripe imports
import {
    useStripe,
    useElements,
    CardElement,
} from "@stripe/react-stripe-js";

import { toast } from 'sonner'

const AddressForm = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        country: "",
    })

    const { cart, addresses, selectedAddress } = useSelector((store) => store.product)
    const [showForm, setShowForm] = useState(addresses?.length > 0 ? false : true)
    const dispatch = useDispatch();
    const navigate = useNavigate()

    // ✅ Initialize Stripe hooks
    const stripe = useStripe();
    const elements = useElements();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSave = () => {
        dispatch(addAddress(formData));
        setFormData({
            fullName: "", phone: "", email: "", address: "",
            city: "", state: "", zip: "", country: ""
        });
        setShowForm(false);
    }

    const subtotal = cart.totalPrice
    const shipping = subtotal > 50 ? 0 : 10;
    const tax = parseFloat((subtotal * 0.05).toFixed(2))
    const total = subtotal + shipping + tax

    const handlePayment = async () => {
        // 1. Safety check: Ensure Stripe is loaded
        if (!stripe || !elements) {
            toast.error("Stripe has not loaded yet. Please try again.");
            return;
        }

        const accessToken = localStorage.getItem("accessToken");

        try {
            // 2. Call backend to create order
            const { data } = await axios.post(
                `${import.meta.env.VITE_URL}/api/v1/orders/create-order`,
                {
                    products: cart?.items?.map((item) => ({
                        productId: item.productId._id,
                        quantity: item.quantity,
                    })),
                    tax,
                    shipping,
                    amount: total, // Note: Backend handles multiplying by 100
                    currency: "usd",
                },
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );

            if (!data.success) {
                return toast.error("Something went wrong with order creation");
            }

            const clientSecret = data.clientSecret;

            // 3. Confirm the payment with Stripe
            const { error, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: elements.getElement(CardElement),
                        billing_details: {
                            name: formData.fullName || addresses[selectedAddress]?.fullName,
                            email: formData.email || addresses[selectedAddress]?.email,
                        },
                    },
                }
            );

            if (error) {
                toast.error(error.message);
                return;
            }

            // 4. Handle success
            if (paymentIntent.status === "succeeded") {
                toast.success("Payment Successful!");
                dispatch(setCart({ items: [], totalPrice: 0 }));
                navigate("/order-success");
            }
        } catch (error) {
            console.error("Payment Error:", error);
            toast.error(error.response?.data?.message || "Payment failed");
        }
    };

    // Card styling
    const cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' },
            },
            invalid: { color: '#9e2146' },
        },
    };

    return (
        <div className='max-w-7xl mx-auto grid place-items-center p-10'>
            <div className='grid grid-cols-1 md:grid-cols-2 items-start gap-20 max-w-7xl mx-auto mt-10'>
                {/* Left Side: Address Details */}
                <div className='space-y-4 p-6 bg-white border rounded-lg shadow-sm'>
                    {showForm ? (
                        <>
                            <div>
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input id="fullName" name="fullName" placeholder="John Doe" required value={formData.fullName} onChange={handleChange} />
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" name="phone" placeholder="9880765432" required value={formData.phone} onChange={handleChange} />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" placeholder="john@gmail.com" required value={formData.email} onChange={handleChange} />
                            </div>
                            <div>
                                <Label htmlFor="address">Address</Label>
                                <Input id="address" name="address" placeholder="123 Street, Area" required value={formData.address} onChange={handleChange} />
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" name="city" placeholder="jalandhar" required value={formData.city} onChange={handleChange} />
                                </div>
                                <div>
                                    <Label htmlFor="state">State</Label>
                                    <Input id="state" name="state" placeholder="punjab" required value={formData.state} onChange={handleChange} />
                                </div>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <Label htmlFor="zip">Zip Code</Label>
                                    <Input id="zip" name="zip" placeholder="144003" required value={formData.zip} onChange={handleChange} />
                                </div>
                                <div>
                                    <Label htmlFor="country">Country</Label>
                                    <Input id="country" name="country" placeholder="India" required value={formData.country} onChange={handleChange} />
                                </div>
                            </div>
                            <Button onClick={handleSave} className='w-full'>Save & Continue</Button>
                            {addresses?.length > 0 && (
                                <Button variant="ghost" onClick={() => setShowForm(false)} className='w-full'>Cancel</Button>
                            )}
                        </>
                    ) : (
                        <div className='space-y-4'>
                            <div className='flex justify-between items-center'>
                                <h2 className='text-lg font-semibold'>Saved Addresses</h2>
                                <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>Add New</Button>
                            </div>
                            {addresses.map((addr, index) => (
                                <div
                                    key={index}
                                    onClick={() => dispatch(setSelectedAddress(index))}
                                    className={`border p-4 rounded-md cursor-pointer relative transition-all ${selectedAddress === index ? "border-pink-600 bg-pink-50" : "border-gray-300"}`}
                                >
                                    <p className='font-medium'>{addr.fullName}</p>
                                    <p className='text-sm text-gray-600'>{addr.phone}</p>
                                    <p className='text-sm text-gray-600'>{addr.email}</p>
                                    <p className='text-sm mt-2'>{addr.address}, {addr.city}, {addr.state}, {addr.zip}, {addr.country}</p>
                                    <button
                                        className='absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            dispatch(deleteAddress(index));
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Side: Order Summary & Stripe Payment */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>${shipping.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax (5%)</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>

                        {/* ✅ Stripe Card Input Section */}
                        <div className="mt-8 space-y-4">
                            <Label className="text-md font-semibold">Payment Details</Label>
                            <div className="p-4 border rounded-md bg-gray-50">
                                <CardElement options={cardElementOptions} />
                            </div>
                        </div>

                        <Button 
                            onClick={handlePayment} 
                            className="w-full mt-6 bg-pink-600 hover:bg-pink-700 text-white py-6 text-lg"
                            disabled={!stripe || !elements || (!showForm && selectedAddress === null)}
                        >
                            {stripe ? `Pay $${total.toFixed(2)}` : "Initializing Stripe..."}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default AddressForm;
