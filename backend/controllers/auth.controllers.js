import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import { redis } from '../lib/redis.js';

const generateToken = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.JWT_ACCESS_TOKEN, {
        expiresIn: '15m',
    });
    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_TOKEN, {
        expiresIn: '7d',
    });

    return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refreshToken:${userId}`, refreshToken, 'EX', 7 * 24 * 60 * 60); // 7 days
};

const setCookies = (res, accessToken, refreshToken) => {
	res.cookie("accessToken", accessToken, {
		httpOnly: true, // prevent XSS attacks, cross site scripting attack
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
		maxAge: 15 * 60 * 1000, // 15 minutes
	});
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true, // prevent XSS attacks, cross site scripting attack
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
	});
};

export const signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }
        const user = await User.create({ name, email, password });

        // authenticate user 
        const { accessToken, refreshToken } = generateToken(user._id);
        await storeRefreshToken(user._id, refreshToken);

        setCookies(res, accessToken, refreshToken);

        res.status(201).json({ user:{
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        }, message: "User created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message }); 
    }
};

export const login = (req, res) => {
    res.send('login route');
};

export const logout = (req, res) => {
    res.send('logout route');
};