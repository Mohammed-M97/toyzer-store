import { useEffect } from "react";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useTranslation } from "react-i18next";

const categories = [

    // New categories
    { href: "/twoYesrs", name: "category.Newborn to 2 years old", imageUrl: "/twoYears.jpg" }, // Updated
  { href: "/animeFigure", name: "category.Anime Figures", imageUrl: "/animeFigure.jpg" }, // Updated
  { href: "/boysWorld", name: "category.Boys world", imageUrl: "/boysWorld.jpg" }, // Updated
  { href: "/girlsWorld", name: "category.Girls world", imageUrl: "/girlsWorld.jpg" }, // Updated
  { href: "/educationalGames", name: "category.Educational games", imageUrl: "/educationalGames.jpg" }, // Updated
  { href: "/scooter", name: "category.Scooters", imageUrl: "/scooter.png" }, // Updated
];

const HomePage = () => {
    const { t } = useTranslation();
    const { fetchFeaturedProducts, products, loading } = useProductStore();

    useEffect(() => {
        fetchFeaturedProducts();
    }, [fetchFeaturedProducts]);

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
    };

    return (
        <div className='relative min-h-screen text-gray-800 overflow-hidden'>
            <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
                <Slider {...sliderSettings}>
                    <div>
                        <img src='/pic1.jpg' alt='Slide 1' className='w-full h-auto' />
                    </div>
                    <div>
                        <img src='/pic2.png' alt='Slide 2' className='w-full h-auto' />
                    </div>
                    <div>
                        <img src='/pic3.jpg' alt='Slide 3' className='w-full h-auto' />
                    </div>
                </Slider>

                <h1 className='text-center text-5xl sm:text-6xl font-bold text-lavender-700 mb-4 mt-9'>
                    {t("Explore Our Categories")}
                </h1>
                <p className='text-center text-xl text-gray-600 mb-12'>
                    {t("Discover the latest trends in eco-friendly fashion")} 🚀
                </p>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {categories.map((category) => (
                        <CategoryItem
                        category={{
                            ...category,
                            name: t(category.name), // Translate category name
                        }}
                        key={category.name}
                    />
                    ))}
                </div>

                {!loading && products.length > 0 && <FeaturedProducts featuredProducts={products} />}
            </div>
        </div>
    );
};

export default HomePage;