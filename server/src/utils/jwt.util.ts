import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";

export const generateToken = (payload: object, expiresIn: string = "1d") => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
};

export const verifyJwt = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};
