import { BaseController } from "../../Base/Base_Class/Base.controller";
import { IMark } from "./teacher.model";
import { markService } from "./teacher.service";
import { TeacherAssignModel } from "../Hod/hod.model";
import { UserModel } from "../../Base/Base_Model/user.model";
import { ApiResponse } from "../../Base/Base_Class/Response";
import { USERROLE } from "../../Base/Base_Class/Base.enum";
import mongoose from "mongoose";

export class markController extends BaseController<IMark> {
    constructor() {
        super(new markService());
    }

    getMyAssignments = async (req: any, res: any): Promise<void> => {
        try {
            const rawId = req.user?._id || req.user?.id;
            if (!rawId) {
                ApiResponse.error(res, "Teacher ID not found in session");
                return;
            }
            
            const teacherId = new mongoose.Types.ObjectId(rawId);

            console.log("Fetching assignments for teacher:", teacherId);
            const assignments = await TeacherAssignModel.find({ teacher: teacherId })
                .populate({
                    path: 'subject',
                    populate: { path: 'sem' }
                })
                .populate({
                    path: 'batch',
                    populate: { path: 'department' }
                })
                .lean();
            
            console.log("Found assignments:", assignments.length);
            ApiResponse.success(res, "Assignments fetched", assignments);
        } catch (error: any) {
            console.error("Error in getMyAssignments:", error);
            ApiResponse.error(res, `Server Error: ${error.message}`);
        }
    };

    getStudentsByBatch = async (req: any, res: any): Promise<void> => {
        try {
            const { batch_id } = req.body;
            if (!batch_id) {
                ApiResponse.error(res, "batch_id is required");
                return;
            }
            const students = await UserModel.find({ 
                role: USERROLE.STUDENT, 
                batch: batch_id 
            }).select('-password').lean();
            ApiResponse.success(res, "Students fetched", students);
        } catch (error: any) {
            ApiResponse.error(res, error.message);
        }
    };

    handelGetAll = async (req: any, res: any): Promise<void> => {
        try {
            const teacherId = req.user?._id || req.user?.id;
            const marks = await (this.service as any).model.find({ teacher: teacherId })
                .populate('studentId')
                .populate('subjectId')
                .populate('batch')
                .lean();
            
            ApiResponse.success(res, "Marks fetched", marks);
        } catch (error: any) {
            ApiResponse.error(res, error.message);
        }
    };
}