import { Response } from "express";

export class ApiResponse {
    static success(res: Response, message: String, data?: any, statusCode: number = 200,otherData?: any) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            otherData,
            timestamp: new Date().toISOString()
        });
    }

    static error(res: Response, message: string, statusCode: number = 500, error?: any) {
        return res.status(statusCode).json({
            success: false,
            message,
            error:  error ,
            timestamp: new Date().toISOString()
        });
    }
}