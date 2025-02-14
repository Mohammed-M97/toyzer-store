import { stripe } from '../lib/stripe.js';
import Coupon from '../models/coupon.model.js';

export const createCheckoutSession = async (req, res) => {
    try {
        const { products, couponCode } = req.body;

        if(!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: 'Products array is required' });
        }

        let totalAmount = 0;

        const lineItems = products.map(product => {
            const amount = Math.round(product.price * 100);  // Convert to cents
            totalAmount += amount * product.quantity;

            return {
                price_data: {
                    currency: 'SR',  // Saudi Riyal
                    product_data: {
                        name: product.title,
                        images: [product.image],
                    },
                    unit_amount: amount,
                },
                quantity: 1,
            };
        });

        let coupon = null;
        if(couponCode) {
            coupon = await Coupon.findOne({ code: couponCode, userID: req.user._id, isActive: true });
            if(coupon) {
                totalAmount -= Math.round(totalAmount * coupon.discount / 100);
            }
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/purchase-cancelled`,
            discounts: coupon
            ? [
                {
                    coupon: await createStripeCoupon(coupon.discountPercentage)
                }
            ]
            : [],
            metadata: {
                userId: req.user._id.toString(),
                couponCode: couponCode || null,
            },
        });

        if(totalAmount > 15000) {
            await cresteNewCoupon(req.user._id.toString());
        }
        res.status(200).json({ ud: session.id, totalAmount: totalAmount/100 });
    } catch (error) {
        console.error(" Error in create-checkout-session", error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

async function createStripeCoupon(discountPercentage) {
    const coupon = await stripe.coupons.create({
        precent_off: discountPercentage,
        duration: "once"
    })

    return coupon.id
}
async function cresteNewCoupon(userId) {
    const newCoupon = new Coupon({
        code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        discountPercentage: 10,
        userId: userId,
    })

    await newCoupon.save();
    return newCoupon
}