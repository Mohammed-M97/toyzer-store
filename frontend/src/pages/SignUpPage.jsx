import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User, ArrowRight, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from '../stores/useUserStore';
import { useTranslation } from "react-i18next";

const SignUpPage = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const { signup, loading } = useUserStore();

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
        signup(formData);
    };

    return (
        <div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
            <motion.div
                className='sm:mx-auto sm:w-full sm:max-w-md'
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h2 className='mt-6 text-center text-3xl font-extrabold text-lavender-700'>{t("Create your account")}</h2>
            </motion.div>

            <motion.div
                className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <div className='bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10'>
                    <form onSubmit={handleSubmit} className='space-y-6'>
                        <div>
                            <label htmlFor='name' className='block text-sm font-medium text-gray-300'>
                                {t("Full name")}
                            </label>
                            <div className='mt-1 relative rounded-md shadow-sm'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <User className='h-5 w-5 text-gray-400' aria-hidden='true' />
                                </div>
                                <input
                                    id='name'
                                    type='text'
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className='block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm
                                     placeholder-gray-400 text-white focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm'
                                    placeholder='Mohammed khaled'
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor='email' className='block text-sm font-medium text-gray-300'>
                                {t("Email address")}
                            </label>
                            <div className='mt-1 relative rounded-md shadow-sm'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <Mail className='h-5 w-5 text-gray-400' aria-hidden='true' />
                                </div>
                                <input
                                    id='email'
                                    type='email'
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className=' block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 
                                    rounded-md shadow-sm
                                     placeholder-gray-400 text-white focus:outline-none focus:ring-gray-500 
                                     focus:border-gray-500 sm:text-sm'
                                    placeholder='you@example.com'
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor='password' className='block text-sm font-medium text-gray-300'>
                                {t("Password")}
                            </label>
                            <div className='mt-1 relative rounded-md shadow-sm'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <Lock className='h-5 w-5 text-gray-400' aria-hidden='true' />
                                </div>
                                <input
                                    id='password'
                                    type='password'
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className=' block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 
                                    rounded-md shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm'
                                    placeholder='••••••••'
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-300'>
                                {t("Confirm Password")}
                            </label>
                            <div className='mt-1 relative rounded-md shadow-sm'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <Lock className='h-5 w-5 text-gray-400' aria-hidden='true' />
                                </div>
                                <input
                                    id='confirmPassword'
                                    type='password'
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className=' block w-full px-3 py-2 pl-10 bg-gray-700 border
                                     border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm'
                                    placeholder='••••••••'
                                />
                            </div>
                        </div>

                        <button
                            type='submit'
                            className='w-full flex justify-center py-2 px-4 border border-transparent 
                            rounded-md shadow-sm text-sm font-medium text-white hover:text-gray-700 bg-lavender-700
                             hover:bg-lavender-600 focus:outline-none focus:ring-2 focus:ring-offset-2
                              focus:ring-lavender-500 transition duration-150 ease-in-out disabled:opacity-50'
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader className='mr-2 h-5 w-5 animate-spin' aria-hidden='true' />
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <UserPlus className='mr-2 h-5 w-5' aria-hidden='true' />
                                    {t("Sign Up")}
                                </>
                            )}
                        </button>
                    </form>

                    <p className='mt-8 text-center text-sm text-gray-400'>
                        {t("Already have an account?")}{" "}
                        <Link to='/login' className='font-medium text-gray-300 hover:text-gray-200'>
                            {t("Login here")} <ArrowRight className='inline h-4 w-4' />
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}

export default SignUpPage;