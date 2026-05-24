import mongoose from "mongoose";
import { ApiResponse } from "../../Base/Base_Class/Response";
import { MarkModel } from "../Teachers/teacher.model";

export const getStudentMarks = async (req: any, res: any) => {
    try {
        const { studentId, semesterId } = req.body;

        const query: any = { studentId: new mongoose.Types.ObjectId(studentId) };
        if (semesterId) {
            query.semester = new mongoose.Types.ObjectId(semesterId);
        }

        const data = await MarkModel.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: "subject",
                    localField: "subjectId",
                    foreignField: "_id",
                    as: "subject"
                }
            },
            { $unwind: "$subject" },
            {
                $lookup: {
                    from: "sem",
                    localField: "semester",
                    foreignField: "_id",
                    as: "semesterInfo"
                }
            },
            { $unwind: "$semesterInfo" },
            {
                $project: {
                    _id: 1,
                    ct1: 1,
                    ct2: 1,
                    ct3: 1,
                    marksObtained: 1,
                    totalMarks: 1,
                    grade: 1,
                    percentage: {
                        $multiply: [
                            { $divide: ["$marksObtained", "$totalMarks"] },
                            100
                        ]
                    },
                    subjectName: "$subject.name",
                    subjectCode: "$subject.code",
                    semesterName: "$semesterInfo.name",
                    semesterId: "$semesterInfo._id",
                    createdAt: 1
                }
            }
        ]);

        return ApiResponse.success(res, "Marks fetched successfully",data, 200,`Total Data: ${data.length}` );

    } catch (err: any) {
        return ApiResponse.error(res, err.message);
    }
};