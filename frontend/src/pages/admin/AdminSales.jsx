import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import axios from 'axios'

import React ,{useState ,useEffect} from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const AdminSales = () => {
  const[stats,setStats] = useState({
    totalUsers:0,
    totalProducts :0,
    totalOrders :0,
    totalSales:0,
    // salesByDate:[] 
    sales:[]


  })

// Add this helper function inside your component
const prepareChartData = (backendSales) => {
  const data = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Find if we have sales for this specific day
    const existingDay = backendSales.find((item) => item.date === dateStr);

    data.push({
      date: dateStr,
      amount: existingDay ? existingDay.amount : 0, // Use 0 if no sales
    });
  }
  return data;
};

  const fetchStats = async( ) =>{
    try {
      const accessToken = localStorage.getItem("accessToken")
      const res = await axios.get(`${import.meta.env.VITE_URL}/api/v1/orders/sales`,{
        headers:{
          Authorization:`Bearer ${accessToken}`
        }
      })
      if(res.data.success){
        setStats(res.data)
      }
    }
    catch(error){
      console.log(error)
    }

  }
  useEffect(() =>{
    fetchStats();
  },[])
  return (
    <div className='pl-[350px] bg-gray-100 py-20 pr-20 mx-auto px-4'>
      <div className='p-6 grid gap-6 lg:grid-cols-4'>
        {/* stats card  */}
        <Card className='bg-pink-500 text-white shadow'>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent className='text-2xl font-bold'>{stats.totalUsers}</CardContent>
        </Card>
         <Card className='bg-pink-500 text-white shadow'>
          <CardHeader>
            <CardTitle>Total Products</CardTitle>
          </CardHeader>
          <CardContent className='text-2xl font-bold'>{stats.totalProducts}</CardContent>
        </Card>
         <Card className='bg-pink-500 text-white shadow'>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent className='text-2xl font-bold'>{stats.totalOrders}</CardContent>
        </Card>
         <Card className='bg-pink-500 text-white shadow'>
          <CardHeader>
            <CardTitle>Total Sales</CardTitle>
          </CardHeader>
          <CardContent className='text-2xl font-bold'>{stats.totalSales}</CardContent>
        </Card>

        {/* sales chart  */}
        <Card className='lg:col-span-4'>
          <CardHeader>
            <CardTitle>Sales (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent style={{height:300}}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={prepareChartData(stats.sales)}>
              <XAxis dataKey="date"/>

              <YAxis/>
              <Tooltip/>
              <Area 
                 
                  type='monotone' 
                  dataKey='amount' 
                  stroke='#F472B6' 
                  fill='#F472B6' 
                  fillOpacity={0.3} 
                />
              </AreaChart>

            </ResponsiveContainer>

          </CardContent>
        </Card>
        
      </div>
      
    </div>
  )
}

export default AdminSales