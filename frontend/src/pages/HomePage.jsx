import { useEffect } from "react";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useTranslation } from "react-i18next";

const categories = [
    { href: "/jeans", name: "Jeans", imageUrl: "/jeans.jpg" },
    { href: "/t-shirts", name: "T-shirts", imageUrl: "/tshirts.jpg" },
    { href: "/shoes", name: "Shoes", imageUrl: "/shoes.jpg" },
    { href: "/glasses", name: "Glasses", imageUrl: "/glasses.png" },
    { href: "/jackets", name: "Jackets", imageUrl: "/jackets.jpg" },
    { href: "/suits", name: "Suits", imageUrl: "/suits.jpg" },
    { href: "/bags", name: "Bags", imageUrl: "/bags.jpg" },
];

const HomePage = () => {
    const { t } = useTranslation();
    const { fetchFeaturedProducts, products, isLoading } = useProductStore();

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
                        <CategoryItem category={category} key={category.name} />
                    ))}
                </div>

                {!isLoading && products.length > 0 && <FeaturedProducts featuredProducts={products} />}
            </div>
        </div>
    );
};

export default HomePage;