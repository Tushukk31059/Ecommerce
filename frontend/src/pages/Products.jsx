import FilterSideBar from '@/components/FilterSideBar'

import React, { useEffect, useState } from 'react'



import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
 
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ProductCard from '@/components/ProductCard'
import { toast } from 'sonner'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { setProducts } from '@/redux/productSlice'




const Products = () => {
  const {products} = useSelector(store=>store.product)
    const [allProducts,setAllProducts] = useState([])
    const [loading,setLoading] = useState(false);
    const[search,setSearch] = useState("");
    const [category,setCategory] = useState("All")
    const [brand,setBrand] = useState("All")
    const [priceRange,setPriceRange] = useState([0,999999])
    const [sortOrder,setSortOrder] = useState('')
    const dispatch = useDispatch()
    const getAllProducts = async() => {
        try{
          setLoading(true)
            const res = await axios.get(`http://localhost:8000/api/v1/products/getallproducts`);
            if(res.data.success){
                setAllProducts(res.data.products)
                //  dispatch(setProducts(res.data.products)) 


            }

        } catch(error){
            console.log(error);
            // toast.error(error.response.data.message) 
            toast.error(error?.response?.data?.message || "Server not reachable")

           
        }
        finally{
          setLoading(false)
        }
    }
    useEffect(() => {
      if(allProducts.length === 0) return ;
      let filtered = [...allProducts]
      if(search.trim() !== ""){
        filtered = filtered.filter(p=>p.productName?.toLowerCase().includes(search.toLowerCase()))

      }

      if(category !== "All"){
        filtered = filtered.filter(p=>p.category===category)
      }

      if(brand !== "All"){
        // filtered = filtered.filter(p=>p.brand===brand) 
        filtered = filtered.filter(
  p => p.brand?.toLowerCase() === brand.toLowerCase()
)

      }
      filtered = filtered.filter(p=>p.productPrice >= priceRange[0] && p.productPrice <= priceRange[1])

      if(sortOrder === "lowToHigh"){
        filtered.sort((a,b)=>a.productPrice -b.productPrice)
      } else if(sortOrder === "highToLow"){
         filtered.sort((a,b)=>b.productPrice -a.productPrice)

      }
      dispatch(setProducts(filtered))
    },[search,category,brand,sortOrder,priceRange,allProducts,dispatch])
    useEffect(() => {
        getAllProducts();
    },[])
    console.log(allProducts)
  return (
    <div className="pt-28 pb-10 min-h-screen">
        <div className='max-w-7xl mx-auto flex gap-7 px-4'>
           
            <FilterSideBar 
            search={search}
            setSearch={setSearch}
            brand={brand}
            setBrand={setBrand}
            category={category}
            setCategory={setCategory}
            
            allProducts={allProducts} priceRange={priceRange}  setPriceRange={setPriceRange}/>
          
            <div className='flex flex-col flex-1'>
                <div className='flex justify-end mb-4'>
                    <Select onValueChange={(value)=>setSortOrder(value)}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Sort by Price" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          
          <SelectItem value="lowToHigh">Price : Low to High</SelectItem>
          <SelectItem value="highToLow">Price : High to Low</SelectItem>
          
        </SelectGroup>
      </SelectContent>
    </Select>
                    
                </div>

              
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-7'>

                    {/* {
                       products.map((product) => {
                            return <ProductCard key={product._id} product={product} loading={loading}/>
                        })
                    } */}
                    {products?.map(product => (
  <ProductCard key={product._id} product={product} loading={loading} />
))}

                </div>
            </div>
            
        </div>

    </div>
  )
}

export default Products


// import FilterSideBar from '@/components/FilterSideBar';
// import React, { useEffect, useState } from 'react';

// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// import ProductCard from '@/components/ProductCard';
// import { toast } from 'sonner';
// import axios from 'axios';

// const Products = () => {
//   const [allProducts, setAllProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const getAllProducts = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(
//         "http://localhost:8000/api/v1/products/getallproducts"
//       );
//       if (res.data.success) {
//         setAllProducts(res.data.products);
//       }
//     } catch (error) {
//       toast.error(error?.response?.data?.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getAllProducts();
//   }, []);

//   return (
//     <div className="pt-28 pb-10 min-h-screen">
//       <div className="max-w-7xl mx-auto flex gap-7 px-4">
//         {/* sidebar */}
//         <FilterSideBar />

//         {/* products section */}
//         <div className="flex flex-col flex-1">
//           <div className="flex justify-end mb-4">
//             <Select>
//               <SelectTrigger className="w-[200px]">
//                 <SelectValue placeholder="Sort by Price" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectGroup>
//                   <SelectItem value="lowToHigh">
//                     Price : Low to High
//                   </SelectItem>
//                   <SelectItem value="highToLow">
//                     Price : High to Low
//                   </SelectItem>
//                 </SelectGroup>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* loading */}
//           {loading && (
//             <p className="text-center text-gray-500 mt-10">
//               Loading products...
//             </p>
//           )}

//           {/* products grid */}
//           {!loading && allProducts.length > 0 && (
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-7">
//               {allProducts.map(product => (
//                 <ProductCard key={product._id} product={product} />
//               ))}
//             </div>
//           )}

//           {/* empty state */}
//           {!loading && allProducts.length === 0 && (
//             <p className="text-center text-gray-500 mt-10">
//               No products found
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Products;
