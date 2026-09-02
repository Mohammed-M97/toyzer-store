import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import { safeRedisGet, safeRedisSet, safeRedisDel, isRedisAvailable } from '../lib/redis.js';

const generateToken = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.JWT_ACCESS_TOKEN, {
        expiresIn: '15m',
    });
    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_TOKEN, {
        expiresIn: '7d',
    });

    return { accessToken, refreshToken };
};

const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

// One helper builds the key everywhere. Previously it was written as
// `refreshToken:<id>` and read back as `refresh_token:<id>`, so the lookup in
// refreshToken() never matched and every refresh returned 401.
const refreshTokenKey = (userId) => `refreshToken:${userId}`;

const storeRefreshToken = async (userId, refreshToken) => {
    await safeRedisSet(refreshTokenKey(userId), refreshToken, REFRESH_TOKEN_TTL_SECONDS);
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

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            const { accessToken, refreshToken } = generateToken(user._id);
            await storeRefreshToken(user._id, refreshToken);

            setCookies(res, accessToken, refreshToken);

            res.status(200).json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                }, message: "Logged in successfully"
            });

        }
        else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.error("Error in login controller", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            try {
                const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);
                await safeRedisDel(refreshTokenKey(decoded.userId));
            } catch (error) {
                // An expired or tampered token still means the client wants out.
                console.warn("Could not revoke refresh token on logout:", error.message);
            }
        }

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const refreshToken = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;

		if (!refreshToken) {
			return res.status(401).json({ message: "No refresh token provided" });
		}

		const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);

		// Redis holds the allow-list that makes refresh tokens revocable. When it
		// is down there is no list to check against, so fall back to trusting the
		// signature alone rather than logging everyone out. Revocation (logout)
		// stops working for the duration of the outage — see docs/DEPLOYMENT.md.
		if (isRedisAvailable()) {
			const storedToken = await safeRedisGet(refreshTokenKey(decoded.userId));

			if (storedToken !== refreshToken) {
				return res.status(401).json({ message: "Invalid refresh token" });
			}
		} else {
			console.warn("Redis unavailable — refreshing on signature only, revocation is not enforced");
		}

		const accessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_ACCESS_TOKEN, { expiresIn: "15m" });

		res.cookie("accessToken", accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 15 * 60 * 1000,
		});

		res.json({ message: "Token refreshed successfully" });
	} catch (error) {
		// jwt.verify throws on an expired or tampered token — that is a 401,
		// not a 500. Returning 500 made the frontend treat it as an outage.
		if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
			res.clearCookie("accessToken");
			res.clearCookie("refreshToken");
			return res.status(401).json({ message: "Invalid or expired refresh token" });
		}

		console.log("Error in refreshToken controller", error.message);
		res.status(500).json({ message: "Server error" });
	}
};

export const getProfile = async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};