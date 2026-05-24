import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt.util";
import { ApiResponse } from "../Base/Base_Class/Response";
import { UserModel } from "../Base/Base_Model/user.model";
import { USERROLE } from "../Base/Base_Class/Base.enum";

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers.authorization?.split(" ")[1] || req.headers.authorization;

    if (!token) {
        ApiResponse.error(res, "Access Denied / Unauthorized Request", 401);
        return;
    }

    try {
        const decoded: any = verifyJwt(token);
        if (!decoded) {
            ApiResponse.error(res, "Invalid or Expired Token", 401);
            return;
        }

        const user = await UserModel.findById(decoded.id).select("-password").lean();
        if (!user) {
            ApiResponse.error(res, "DEBUG: User session invalid - please re-login", 401);
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        ApiResponse.error(res, "Authentication Failed", 500, error);
    }
};

export const authorizeRoles = (...roles: USERROLE[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            ApiResponse.error(res, "Forbidden: You do not have permission to access this resource", 403);
            return;
        }
        next();
    };
};
