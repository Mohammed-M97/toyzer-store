import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { Users, Package, ShoppingCart, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const AnalyticsTab = () => {

  let dailySales =
  [
    {
      _id: "2024-08-19",
      sales: 12,
      revenue: 1450
    },
    {
      _id: "2024-08-20",
      sales: 15,
      revenue: 4678
    },
    {
      _id: "2024-08-21",
      sales: 3,
      revenue: 466
    },
    {
      _id: "2024-08-22",
      sales: 5,
      revenue: 758
    },
  ]
  const [analyticsData, setAnalyticsData] = useState({
    users: 0,
    products: 0,
    totalSales: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dailySalesData, setDailySalesData] = useState([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await axios.get("/analytics");
        console.log(response.data);
        setAnalyticsData(response.data.analyticsData);
        setDailySalesData(dailySales);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <AnalyticsCard
          title='Total Users'
          value={analyticsData.users.toLocaleString()}
          icon={Users}
          color='from-gray-500 to-gray-700'
        />
        <AnalyticsCard
          title='Total Products'
          value={analyticsData.products.toLocaleString()}
          icon={Package}
          color='from-gray-500 to-gray-700'
        />
        <AnalyticsCard
          title='Total Sales'
          value={"35"}
          icon={ShoppingCart}
          color='from-gray-500 to-gray-700'
        />
        <AnalyticsCard
          title='Total Revenue'
          value={`$7,352`}
          icon={DollarSign}
          color='from-gray-500 to-gray-700'
        />
      </div>
      <motion.div
        className='bg-gray-900 rounded-lg p-6 shadow-lg graph-container'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <ResponsiveContainer width='100%' height={400}>
          <LineChart data={dailySalesData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='_id' stroke='#9CA3AF' />
            <YAxis yAxisId='left' stroke='#9CA3AF' />
            <YAxis yAxisId='right' orientation='right' stroke='#9CA3AF' />
            <Tooltip />
            <Legend />
            <Line
              yAxisId='left'
              type='monotone'
              dataKey='sales'
              stroke='#10B981'
              activeDot={{ r: 8 }}
              name='Sales'
            />
            <Line
              yAxisId='right'
              type='monotone'
              dataKey='revenue'
              stroke='#3B82F6'
              activeDot={{ r: 8 }}
              name='Revenue'
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}

export default AnalyticsTab

const AnalyticsCard = ({ title, value, icon: Icon, color }) => (
  <motion.div
    className={`bg-gray-800 rounded-lg p-6 shadow-lg overflow-hidden relative ${color}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className='flex justify-between items-center'>
      <div className='z-10'>
        <p className='text-gray-300 text-sm mb-1 font-semibold'>{title}</p>
        <h3 className='text-white text-3xl font-bold'>{value}</h3>
      </div>
    </div>
    <div className='absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-900 opacity-30' />
    <div className='absolute -bottom-4 -right-4 text-gray-800 opacity-50'>
      <Icon className='h-32 w-32' />
    </div>
  </motion.div>
);