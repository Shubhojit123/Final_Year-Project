import * as jwt from "jsonwebtoken";

const SECRET_KEY = "sss";

export const generateToken = (payload: object) => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: "1d" });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET_KEY);
};



export const decoded = (token: string) => {
    try {
        const decoded = jwt.verify(token, SECRET_KEY) as any;
       return decoded;
    } catch (err) {
        return err;
    }
};