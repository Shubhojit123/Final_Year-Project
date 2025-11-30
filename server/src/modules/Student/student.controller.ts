import mongoose from "mongoose";
import { ApiResponse } from "../../Base/Base_Class/Response";
import { MarkModel } from "../Teachers/teacher.model";

export const getStudentMarks = async (req: any, res: any) => {
    try {
        const { studentId, semesterId } = req.body;

        const data = await MarkModel.aggregate([
            {
                $match: {
                    studentId: new mongoose.Types.ObjectId(studentId),
                    semester: new mongoose.Types.ObjectId(semesterId)
                }
            },
            {
                $lookup: {
                    from: "subject",
                    localField: "subjectId",
                    foreignField: "_id",
                    as: "subject"
                }
            },
            {
                $unwind: {
                    path: "$subject",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "sem",
                    localField: "semester",
                    foreignField: "_id",
                    as: "semesterInfo"
                }
            },
            {
                $unwind: {
                    path: "$semesterInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    marksObtained: 1,
                    totalMarks: 1,
                    percentage: {
                        $multiply: [
                            { $divide: ["$marksObtained", "$totalMarks"] },
                            100
                        ]
                    },
                    subjectName: "$subject.name",
                    subjectCode: "$subject.code",
                    semesterName: "$semesterInfo.name",
                    createdAt: 1
                }
            }
        ]);

        return ApiResponse.success(res, "Marks fetched successfully",data, 200,`Total Data: ${data.length}` );

    } catch (err: any) {
        return ApiResponse.error(res, err.message);
    }
};