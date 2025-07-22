import { useEffect, useState } from "react";
import { useProductStore } from "../stores/useProductStore";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductCard";
import { useTranslation } from "react-i18next";


const CategoryPage = () => {
    const { t } = useTranslation();
    const { fetchProductsByCategory, products, loading } = useProductStore()
    const { category } = useParams()  // get the category from the URL params using the useParams hook from react-router-dom to fetch products by category from the backend API
    const [categoryName, setCategoryName] = useState("");

    useEffect(() => {
        const categoryMapping = {
            twoYesrs: "category.Newborn to 2 years old",
            animeFigure: "category.Anime Figures",
            boysWorld: "category.Boys world",
            girlsWorld: "category.Girls world",
            educationalGames: "category.Educational games",
            scooter: "category.Scooters",
        };
        setCategoryName(categoryMapping[category] || "");
        fetchProductsByCategory(category)
    }, [fetchProductsByCategory, category])

    return (
        <div className='min-h-screen'>
            <div className='relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
                <motion.h1
                    className='text-center text-4xl sm:text-5xl font-bold text-lavender-700 mb-8'
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    {t(categoryName)} {/* Translate the category name */}
                </motion.h1>

                <motion.div
                    className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    {products?.length === 0 && (
                        <h2 className='text-3xl font-semibold text-gray-300 text-center col-span-full'>
                            {t("No products found")}
                        </h2>
                    )}

                    {products?.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </motion.div>
            </div>
        </div>
    )
}

export default CategoryPage
