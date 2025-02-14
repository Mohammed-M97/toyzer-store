import express from 'express';
import { adminRoute, protectRoute } from '../middleware/auth.middleware.js';
import { getanalyticsDate } from '../controllers/analytics.controllers.js';
const router = express.Router();

router.get("/", protectRoute, adminRoute, async (req, res) => {
    try {
        const analyticsDate = await getanalyticsDate;
    } catch (error) {
        
    }
});

export default router;
