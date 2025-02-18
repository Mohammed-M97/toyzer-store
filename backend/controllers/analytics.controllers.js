import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

export const getanalyticsDate = async () => {  // this function will return the total number of users, products, total sales and total revenue

    const totalUsers = await User.countDocuments();  // countDocuments() is a method provided by mongoose to count the number of documents in a collection
    const totalProducts = await Product.countDocuments();

    const salesData = await Order.aggregate([  // aggregate() is a method provided by mongoose to perform aggregation operations on the database
        {
            $group: {
                _id: null,  // it will group all the documents together
                totalSales: { $sum: 1 },
                totalRevenue: { $sum: "$totalAmount" },
            },
        }
    ]);

    const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

    return {
        users: totalUsers,
        products: totalProducts,
        totalSales,
        totalRevenue
    }
};

export const getDailySalesData = async (startDate, endDate) => {  // this function will return the daily sales for the last 30 days

    try {
        const dailySalesData = await Order.aggregate([  // aggregate() is a method provided by mongoose to perform aggregation operations on the database
            {
                $match: {
                    createdAt: {
                        $gte: startDate,  // $gte is a comparison operator provided by mongoose to check if the value is greater than or equal to the specified value
                        $lte: endDate  // $lte is a comparison operator provided by mongoose to check if the value is less than or equal to the specified value
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sales: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // example of dailySalesData
        // [
        //     { 
        //          _id: '2022-01-01',
        //           sales: 2,
        //           revenue: 100
        //    },
        // ]

        const dateArray = getDateInrange(startDate, endDate);
        console.log(dateArray);  // ['2025-01-01', '2025-01-02', '2025-01-03', ...]

        return dateArray.map(date => {
            const foundData = dailySalesData.find(item => item._id === date);
            return {
                date,
                sales: foundData.sales || 0,
                revenue: foundData.revenue || 0,
            }
        });
    } catch (error) {
        throw error;
    }
}

function getDateInrange(startDate, endDate) {  // this function will return an array of dates between startDate and endDate
    const dates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split('T')[0]);  // toISOString() is a method provided by javascript to convert a date to a string in the format "yyyy-mm-dd"
        currentDate.setDate(currentDate.getDate() + 1);  // setDate() is a method provided by javascript to set the day of the month
    }

    return dates;

}