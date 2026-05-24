import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { ApiResponse } from "../../Base/Base_Class/Response";

const authService = new AuthService();

export class AuthController {
    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return ApiResponse.error(res, "Email and password are required", 400);
            }

            const data = await authService.login(email, password);
            return ApiResponse.success(res, "Login successful", data);
        } catch (error: any) {
            return ApiResponse.error(res, error.message || "Login failed", 401);
        }
    }

    async register(req: Request, res: Response) {
        try {
            const { email, password, username } = req.body;
            if (!email || !password || !username) {
                return ApiResponse.error(res, "Email, password and username are required", 400);
            }

            const data = await authService.register(req.body);
            return ApiResponse.success(res, "Registration successful", data, 201);
        } catch (error: any) {
            return ApiResponse.error(res, error.message || "Registration failed", 400);
        }
    }

    async forgotPassword(req: Request, res: Response) {
        try {
            const { email } = req.body;
            if (!email) {
                return ApiResponse.error(res, "Email is required", 400);
            }
            const origin = req.headers.origin as string;
            const data = await authService.forgotPassword(email, origin);
            return ApiResponse.success(res, data.message, data);
        } catch (error: any) {
            return ApiResponse.error(res, error.message || "Something went wrong", 400);
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const { token, password } = req.body;
            if (!token || !password) {
                return ApiResponse.error(res, "Token and password are required", 400);
            }
            const data = await authService.resetPassword(token, password);
            return ApiResponse.success(res, data.message, data);
        } catch (error: any) {
            return ApiResponse.error(res, error.message || "Password reset failed", 400);
        }
    }
}
