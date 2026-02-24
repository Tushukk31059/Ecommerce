import { Input } from '@/components/ui/input'
import { Edit, Search, Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDispatch, useSelector } from 'react-redux'
import { Card } from '@/components/ui/card'
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from '@/components/ui/textarea'
import ImageUpload from '@/components/ImageUpload'
import axios from 'axios'
import { setProducts } from '@/redux/productSlice'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const AdminProduct = () => {
    const { products } = useSelector(store => store.product)
    const [editProduct, setEditProduct] = useState(null);
    const [open, setOpen] = useState(false)
    const [sortOrder,setSortOrder] = useState("");
    const [searchTerm,setSeachTerm]= useState("")
    const accessToken = localStorage.getItem("accessToken")
    const dispatch = useDispatch();

    let filteredProducts = products.filter((product)=>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase())  || 
     product.brand.toLowerCase().includes(searchTerm.toLowerCase())  || 
      product.category.toLowerCase().includes(searchTerm.toLowerCase())  


)

if(sortOrder === 'lowToHigh'){
    filteredProducts = [...filteredProducts].sort((a,b)=> a.productPrice - b.productPrice)
}

if(sortOrder === 'highToLow'){
    filteredProducts = [...filteredProducts].sort((a,b)=> b.productPrice - a.productPrice)
}

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditProduct(prev => ({ ...prev, [name]: value }))
    }

    const handleSave = async (e) => {
        e.preventDefault();
        if (!editProduct) return;

        const formData = new FormData()
        formData.append("productName", editProduct.productName);
        formData.append("productDesc", editProduct.productDesc);
        formData.append("productPrice", editProduct.productPrice);
        formData.append("category", editProduct.category);
        formData.append("brand", editProduct.brand);

        // FIX: Safely filter existing images vs new files
        if (editProduct.productImg && Array.isArray(editProduct.productImg)) {
            const existingImages = editProduct.productImg
                .filter((img) => !(img instanceof File) && img.public_id)
                .map((img) => img.public_id);

            // Sending as JSON string so backend can parse it
            formData.append("existingImages", JSON.stringify(existingImages));

            editProduct.productImg
                .filter((img) => img instanceof File)
                .forEach((file) => {
                    formData.append("files", file);
                });
        }

        try {
            const res = await axios.put(`http://localhost:8000/api/v1/products/update/${editProduct._id}`, formData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            if (res.data.success) {
                toast.success("Product updated successfully");
                const updatedProducts = products.map((p) => p._id === editProduct._id ? res.data.product : p);
                dispatch(setProducts(updatedProducts));
                setOpen(false);
                setEditProduct(null); // Clear state after success
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Failed to update product");
        }
    }

    const deleteProductHandler = async (productId) => {
        try {
            const remainingProducts = products.filter((product) => product._id !== productId)
            const res = await axios.delete(`http://localhost:8000/api/v1/products/delete/${productId}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            if (res.data.success) {
                toast.success(res.data.message)

                dispatch(setProducts(remainingProducts))
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className='pl-[350px] py-20 pr-20 flex flex-col gap-3 min-h-screen bg-gray-100'>
            <div className='flex justify-between'>
                <div className='relative bg-white rounded-lg'>
                    <Input
                     type='text' 
                      value={searchTerm} 
                     onChange={(e)=>setSeachTerm(e.target.value)}
                     placeholder="Search Products...." className='w-[400px] items-center' />
                    <Search
                    
                     className='absolute right-3 top-1.5 text-gray-500' />
                </div>
                <Select onValueChange={(value)=>setSortOrder(value)} >
                    <SelectTrigger className='w-[200px] bg-white'>
                        <SelectValue placeholder='Sort by Price' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='lowToHigh'>Price: Low to High</SelectItem>
                        <SelectItem value='highToLow'>Price: High to Low</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {filteredProducts.map((product) => (
                <Card key={product._id} className='px-4'>
                    <div className='flex items-center justify-between'>
                        <div className='flex gap-2 items-center'>
                            {/* FIX: Safe image access */}
                            <img
                                src={product.productImg?.[0]?.url || 'https://via.placeholder.com'}
                                alt=""
                                className='w-20 h-20 object-cover rounded'
                            />
                            <h1 className='font-bold w-96 text-gray-700'>{product.productName}</h1>
                        </div>
                        <h1 className='font-semibold text-gray-800'>₹{product.productPrice}</h1>
                        <div className='flex gap-3'>
                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <Edit
                                        onClick={() => {
                                            setOpen(true),
                                            setEditProduct(product)
                                        }} // Use a shallow copy


                                        className='text-green-500 cursor-pointer'
                                    />
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Edit Product</DialogTitle>
                                        <DialogDescription>Make changes to your product here.</DialogDescription>
                                    </DialogHeader>

                                    {/* FIX: Only render form fields if editProduct is NOT null */}
                                    {editProduct ? (
                                        <div className="flex flex-col gap-4">
                                            <div className="grid gap-2">
                                                <Label>Product Name</Label>
                                                <Input
                                                    name="productName"
                                                    value={editProduct.productName || ''}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Price</Label>
                                                <Input
                                                    type='number'
                                                    name="productPrice"
                                                    value={editProduct.productPrice || ''}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className='grid grid-cols-2 gap-4'>
                                                <div className='grid gap-2'>
                                                    <Label>Brand</Label>
                                                    <Input
                                                        name="brand"
                                                        value={editProduct.brand || ''}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div className='grid gap-2'>
                                                    <Label>Category</Label>
                                                    <Input
                                                        name="category"
                                                        value={editProduct.category || ''}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className='grid gap-2'>
                                                <Label>Description</Label>
                                                <Textarea
                                                    name='productDesc'
                                                    value={editProduct.productDesc || ''}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            {/* ImageUpload is now safe because editProduct is guaranteed to exist here */}
                                            <ImageUpload productData={editProduct} setProductData={setEditProduct} />
                                        </div>
                                    ) : (
                                        <div className="py-10 text-center">Loading product data...</div>
                                    )}

                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button
                                            type="submit"
                                            onClick={handleSave}
                                            disabled={!editProduct}
                                        >
                                            Save changes
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>

                            </Dialog>



                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Trash2  className='text-red-500 cursor-pointer' />
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your account
                                            from our servers.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteProductHandler(product._id)}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}

export default AdminProduct;
