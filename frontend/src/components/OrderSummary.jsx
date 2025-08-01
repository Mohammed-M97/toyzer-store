import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link } from "react-router-dom";
import { MoveRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from './languages/i18n';

const OrderSummary = () => {
    const { t } = useTranslation();
    const { total, subtotal, coupon, isCouponApplied, generateAndApplyCoupon } = useCartStore();

    const savings = subtotal - total;
    const formattedSubtotal = subtotal.toFixed(2);
    const formattedTotal = total.toFixed(2);
    const formattedSavings = savings.toFixed(2);

  return (
    <motion.div
            className='space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <p className='text-xl font-semibold text-gray-300'>{t("Order summary")}</p>

            <div className='space-y-4'>
                <div className='space-y-2'>
                    <dl className='flex items-center justify-between gap-4'>
                        <dt className='text-base font-normal text-gray-300'>{t("Original price")}</dt>
                        <dd className='text-base font-medium text-white'>${formattedSubtotal}</dd>
                    </dl>

                    {/* {savings > 0 && (
                        <dl className='flex items-center justify-between gap-4'>
                            <dt className='text-base font-normal text-gray-300'>Savings</dt>
                            <dd className='text-base font-medium text-gray-300'>-${formattedSavings}</dd>
                        </dl>
                    )}

                    {coupon && isCouponApplied && (
                        <dl className='flex items-center justify-between gap-4'>
                            <dt className='text-base font-normal text-gray-300'>Coupon ({coupon.code})</dt>
                            <dd className='text-base font-medium text-gray-300'>-{coupon.discountPercentage}%</dd>
                        </dl>
                    )} */}
                    <dl className='flex items-center justify-between gap-4 border-t border-gray-600 pt-2'>
                        <dt className='text-base font-bold text-white'>{t("Total")}</dt>
                        <dd className='text-base font-bold text-gray-300'>${formattedTotal}</dd>
                    </dl>
                </div>

                <motion.button
                    className='flex w-full items-center justify-center rounded-lg bg-lavender-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-lavender-600 hover:text-gray-700  focus:outline-none focus:ring-4 focus:ring-lavender-500'
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    /* onClick={handlePayment} */
                >
                    {t("Proceed to Checkout")}
                </motion.button>

                <div className='flex items-center justify-center gap-2'>
                    <span className='text-sm font-normal text-gray-400'>{t("or")}</span>
                    <Link
                        to='/'
                        className='inline-flex items-center gap-2 text-sm font-medium text-gray-300 underline hover:text-gray-200 hover:no-underline'
                    >
                        {t("Continue Shopping")}
                        <MoveRight size={16} />
                    </Link>
                </div>
            </div>
        </motion.div>
  )
}

export default OrderSummary;