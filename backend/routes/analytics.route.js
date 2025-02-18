import express from 'express';
import { adminRoute, protectRoute } from '../middleware/auth.middleware.js';
import { getanalyticsDate } from '../controllers/analytics.controllers.js';
import e from 'express';
import { get } from 'mongoose';
const router = express.Router();

router.get("/", protectRoute, adminRoute, async (req, res) => {
    try {
        const analyticsDate = await getanalyticsDate;  // get the total number of users, products, total sales and total revenue

        const endDate = new Date();  
        const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);  // 30 days before the current date

        const dailySalesDate = await getDailySalesData(startDate, endDate);  // get the daily sales for the last 30 days

        res.json({
            analyticsDate,  // return the total number of users, products, total sales and total revenue
            dailySalesDate  // return the daily sales for the last 30 days
        });
    } catch (error) {
        console.log("Error in getAnalyticsData: ", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

export default router;
