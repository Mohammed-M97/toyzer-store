import User from "../models/user.model.js";
import Product from "../models/product.model.js";

export const getanalyticsDate = async() => {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    
};