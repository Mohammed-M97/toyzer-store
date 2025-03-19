import React, { useState } from 'react';
import { ShoppingCart, UserPlus, LogIn, LogOut, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStore } from '../stores/useUserStore';
import { useCartStore } from '../stores/useCartStore';
import { useTranslation } from "react-i18next";
import i18n from './languages/i18n';

const Navbar = () => {
    const { t } = useTranslation();
    const { user, logout } = useUserStore();
    const { cart } = useCartStore();
    const isAdmin = user?.role === 'admin';
    const [currentLanguage, setCurrentLanguage] = useState('en');

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
        setCurrentLanguage(lng);
    };

    return (
        <header className='fixed top-0 left-0 w-full bg-white bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-gray-300'>
            <div className='container mx-auto px-4 py-3'>
                <div className='flex flex-wrap justify-between items-center'>
                    <Link to='/' className='items-center space-x-2 flex'>
                        <img src='/toyzer.png' alt='Toyzer Logo' className='h-10' />
                    </Link>

                    <nav className='flex flex-wrap items-center gap-4'>
                        <Link to={"/"} className='text-gray-700 hover:text-gray-900 transition duration-300 ease-in-out'>{t("Home")}</Link>
                        {user && (
                            <Link to={'/cart'} className='relative group text-gray-700 hover:text-gray-900 transition duration-300 ease-in-out'>
                                <ShoppingCart className='inline-block mr-1 ml-2 group-hover:text-gray-900' size={20} />
                                <span className='hidden sm:inline'>{t("Cart")}</span>
                                {cart.length > 0 && (
                                    <span className='absolute -top-2 -left-2 bg-lavender-700 hover:bg-lavender-600 text-white rounded-full px-2 py-0.5 text-xs group-hover:bg-gray-700 transition duration-300 ease-in-out'>
                                        {cart.length}
                                    </span>
                                )}
                            </Link>
                        )}

                        {isAdmin && (
                            <Link
                                className='bg-lavender-700 hover:bg-lavender-600 text-white hover:text-gray-700 px-3 py-1 rounded-md font-medium transition duration-300 ease-in-out flex items-center'
                                to={"/secret-dashboard"}
                            >
                                <Lock className='inline-block mr-1' size={18} />
                                <span className='hidden sm:inline'>{t("Dashboard")}</span>
                            </Link>
                        )}

                        {user ? (
                            <button
                                className='bg-lavender-700 hover:bg-lavender-600 text-white hover:text-gray-700 py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out'
                                onClick={logout}
                            >
                                <LogOut size={18} />
                                <span className='hidden sm:inline ml-2 mr-2'>{t("Logout")}</span>
                            </button>
                        ) : (
                            <>
                                <Link
                                    to={"/signup"}
                                    className='bg-lavender-700 hover:bg-lavender-600 text-white hover:text-gray-700 py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out'
                                >
                                    <UserPlus className='mr-2 ml-2' size={18} />
                                    {t("Sign Up")}
                                </Link>
                                <Link
                                    to={"/login"}
                                    className='bg-lavender-700 hover:bg-lavender-600 text-white hover:text-gray-700 py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out'
                                >
                                    <LogIn className='mr-2 ml-2' size={18} />
                                    {t("Login")}
                                </Link>
                            </>
                        )}
                        {currentLanguage === 'en' ? (
                            <button onClick={() => changeLanguage('ar')}>AR</button>
                        ) : (
                            <button onClick={() => changeLanguage('en')}>EN</button>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    )
}

export default Navbar;