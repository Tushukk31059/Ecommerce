import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import userLogo from "../../assets/user.png"
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useSelector,useDispatch } from 'react-redux'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from 'sonner'
import axios from 'axios'
import { setUser } from '@/redux/userSlice'
export const UserInfo = () => {
  const navigate = useNavigate();
  const[updateUser,setUpdateUser] = useState(null)
  const[file,setFile]= useState(null);
  const {user} = useSelector(store=>store.user)
  const dispatch = useDispatch();
  const params = useParams()
  const userId = params.id
  const handleChange = (e) => {
setUpdateUser({...updateUser ,[e.target.name]:e.target.value})
}
const handleFileChange =(e) => {
const selectedFile=e.target.files[0];
setFile(selectedFile)
setUpdateUser({...updateUser,profilePic:URL.createObjectURL(selectedFile)})

}
const handleSubmit = async(e) => {
e.preventDefault();
const accessToken = localStorage.getItem("accessToken")
try {
  const formData = new FormData()
  formData.append("firstName",updateUser.firstName)
  formData.append("lastName",updateUser.lastName)
  formData.append("email",updateUser.email)
  formData.append("phoneNo",updateUser.phoneNo)
   formData.append("address",updateUser.address)
     formData.append("city",updateUser.city)
       formData.append("zipCode",updateUser.zipCode)
         formData.append("role",updateUser.role)

         if(file){
          formData.append("file",file)
         }

const res = await axios.put(`http://localhost:8000/api/v1/users/update/${userId}`,formData,{
  headers:{
    Authorization:`Bearer ${accessToken}`,
    "Content-Type":"multipart/form-data" 
  }
})
if(res.data.success){
  toast.success(res.data.message)
  dispatch(setUser(res.data.user))
}
} catch(error){
  console.log(error)
  toast.error("Failed to update profile")
}
}

const getUserDetails =  async() => {
  try {
    const res = await axios.get(`http://localhost:8000/api/v1/users/get-user/${userId}`)
    if(res.data.success){
      setUpdateUser(res.data.user)
    }

  } catch(error){
    console.log(error);
  }
}
useEffect(() => {
  getUserDetails();
},[])
  return (
    <div className='pt-24 pb-10 min-h-screen bg-gray-100'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='flex flex-col  items-center  bg-gray-100'>
          {/* Header Section */}
          <div className='flex items-center justify-between w-full max-w-2xl mb-8'>
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4"/> Back
            </Button>
            <h1 className='font-bold text-2xl text-gray-800'>Update Profile</h1>
            <div className="w-10"></div> {/* Spacer to keep title centered */}
          </div>

          <div className='w-full flex flex-col md:flex-row gap-10 justify-center items-start px-2 max-w-4xl'>
              {/* profile picture  */}
              <div className='flex flex-col items-center sticky top-24'>
              <img 
                src={updateUser?.profilePic || userLogo} 
                alt="profile" 
                className='w-32 h-32 rounded-full object-cover border-4 border-pink-600 shadow-md' 
              />
              <Label className='mt-4 cursor-pointer bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors'>
                Change Picture
                <input type="file" accept='image/*' className='hidden' onChange={handleFileChange}/>
              </Label>
            </div>
              {/* profile form  */}
              <form onSubmit={handleSubmit} action="" className='space-y-4 shadow-lg p-5 rounded-lg bg-white'>
                <div className='grid grid-cols-2 gap-4'>
                  <div><Label className='block text-sm font-medium'>First Name</Label>
                  <Input type='text'  name="firstName" className='w-full border rounded-lg px-3 py-2 mt-1'   placeholder="John" value={updateUser?.firstName} onChange={handleChange}/>
                </div>

                  <div>
                    <Label className='block text-sm font-medium'>Last Name</Label>
                  <Input type='text' name="lastName" className='w-full border rounded-lg px-3 py-2 mt-1'   placeholder="Doe " value={updateUser?.lastName} onChange={handleChange}/>
                </div>

                </div>
                <div>
                  <Label className='block text-sm font-medium'>Email</Label>
                  <Input type='email' name="email" disabled 
                  value={updateUser?.email} onChange={handleChange}
                  className='w-full border rounded-lg px-3 py-2 mt-1 bg-gray-100 cursor-not-allowed'/>
                </div>
                <div>

                  <Label className='block text-sm font-medium'>Phone Number</Label>
                  <Input type='text' name="phoneNo" 
                   placeholder="Enter Your Phone Number"
                   className='w-full border rounded-lg px-3 py-2 mt-1 ' value={updateUser?.phoneNo} onChange={handleChange}/>
                </div>

                <div>

                  <Label className='block text-sm font-medium'>Address</Label>
                  <Input type='text' name="address" 
                   placeholder="Enter Your  Address"
                   className='w-full border rounded-lg px-3 py-2 mt-1 ' value={updateUser?.address} onChange={handleChange}/>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                   <div>

                  <Label className='block text-sm font-medium'>City</Label>
                  <Input type='text' name="city" 
                   placeholder="Enter Your  City"
                   className='w-full border rounded-lg px-3 py-2 mt-1 ' value={updateUser?.city} onChange={handleChange}/>
                </div>
                 <div>

                  <Label className='block text-sm font-medium'>Zip Code</Label>
                  <Input type='text' name="zipCode" 
                   placeholder="Enter Your  Zip Code"
                   className='w-full border rounded-lg px-3 py-2 mt-1 ' value={updateUser?.zipCode} onChange={handleChange}/>
                </div>
                </div>

              <div className='flex gap-3 items-center'>
                <Label className='block text-sm font-medium'>Role</Label>
                <RadioGroup 
                value={updateUser?.role}
                onValueChange={(value)=>setUpdateUser({...updateUser,role:value})}
                 className='flex items-center'>
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='user' id='user'/>
                    <Label htmlFor='user'>User</Label>
                  </div>


                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='admin' id='admin'/>
                    <Label htmlFor='admin'>Admin</Label>
                  </div>
                </RadioGroup>
              </div>
                 
                <Button type='submit' className='w-full mt-4 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 rounded-lg'>
                  Update Profile
                </Button>
              </form>
            </div>
        </div>
      </div>
    </div>
  )
}
