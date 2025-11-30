import { BaseController } from "../../Base/Base_Class/Base.controller";
import { USERROLE } from "../../Base/Base_Class/Base.enum";
import { ApiResponse } from "../../Base/Base_Class/Response";
import { UserModel } from "../../Base/Base_Model/user.model";
import { sendEmail } from "../../config/emailSend";
import { decoded, generateToken } from "../../config/jwtConfig";
import { IBatch, ISem, ISubject, ITeacherAssign, IYear } from "./hod.model";
import { batchService, semService, subjectService, teacherAssignService, yearService } from "./hod.service";
import * as xlsx from "xlsx";

export class yearController extends BaseController<IYear> {
    constructor() {
        super(new yearService());
    }
}


export class batchController extends BaseController<IBatch> {
    constructor() {
        super(new batchService());
    }
}

export class semController extends BaseController<ISem> {
    constructor() {
        super(new semService());
    }
}


export class subjectController extends BaseController<ISubject> {
    constructor() {
        super(new subjectService());
    }
}

export class teacherAssignController extends BaseController<ITeacherAssign> {
    constructor() {
        super(new teacherAssignService());
    }
}

interface ExcelStudentRow {
    name: string;
    email: string;
    dob: string;
}
export const studentCreate = async (req: any, res: any) => {
    try {
        if (!req.file) {
            return ApiResponse.error(res, "No file uploaded");
        }
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames?.[0];

        if (!sheetName) {
            return ApiResponse.error(res, "Excel file has no sheets");
        }

        const sheet = workbook.Sheets[sheetName] || {};
        const dataArray = xlsx.utils.sheet_to_json<ExcelStudentRow>(sheet);
        const department_id = req.query.department_id;
        const batch_id = req.query.batch_id;

        if (!department_id || !batch_id) {
            return ApiResponse.error(res, "department_id & batch_id are required");
        }

        if (!dataArray || dataArray.length === 0) {
            return ApiResponse.error(res, "Excel file is empty");
        }
        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[]
        };

        for (const data of dataArray) {
            try {
                if (!data?.name || !data?.email || !data?.dob) {
                    results.failed++;
                    results.errors.push(`Missing fields for: ${data?.email || 'unknown'}`);
                    continue;
                }

                const userData = {
                    username: data.name,
                    email: data.email,
                    password: data.dob,
                    role: USERROLE.STUDENT,
                    department: department_id,
                    batch: batch_id
                };

                await UserModel.create(userData);
                results.success++;

            } catch (err: any) {
                results.failed++;
                results.errors.push(`${data.email}: ${err.message}`);
            }
        }

        if (results.failed > 0) {
            return ApiResponse.success(res,
                `Created ${results.success} students, ${results.failed} failed`,
                results
            );
        }

        return ApiResponse.success(res, `Successfully created ${results.success} students`);

    } catch (error: any) {
        console.error('Student creation error:', error);
        return ApiResponse.error(res, error.message || "Failed to create students");
    }
}
export const inviteTeacher = async (req: any, res: any) => {
    try {
        const { hodName, deptName, to, department_id, username } = req.body;

        const tokenPayLoad = {
            email: to,
            department_id: department_id,
            username: username,
        }
        const token = await generateToken(tokenPayLoad);

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const inviteLink = `${frontendUrl}/teacher/invite?token=${encodeURIComponent(
            token
        )}&hodName=${encodeURIComponent(hodName)}&deptName=${encodeURIComponent(
            deptName
        )}`;


        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teacher Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f9;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                                You're Invited!
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Dear Teacher,
                            </p>
                            
                            <p style="margin: 0 0 25px; color: #555555; font-size: 16px; line-height: 1.6;">
                                You have been invited by <strong style="color: #667eea;">${hodName}</strong> from the <strong style="color: #667eea;">${deptName}</strong> department to join our educational platform.
                            </p>
                            
                            <p style="margin: 0 0 30px; color: #555555; font-size: 16px; line-height: 1.6;">
                                Please click the button below to accept your invitation and get started:
                            </p>
                            
                            <!-- Button -->
                            <table role="presentation" style="margin: 0 auto;">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="${inviteLink}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                                            Accept Invitation
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0; color: #888888; font-size: 14px; line-height: 1.6;">
                                Or copy and paste this link into your browser:
                            </p>
                            <p style="margin: 10px 0 0; word-break: break-all;">
                                <a href="${inviteLink}" style="color: #667eea; text-decoration: none; font-size: 14px;">
                                    ${inviteLink}
                                </a>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0 0 10px; color: #888888; font-size: 14px;">
                                If you have any questions, please contact your department administrator.
                            </p>
                            <p style="margin: 0; color: #aaaaaa; font-size: 12px;">
                                © ${new Date().getFullYear()} Your Institution. All rights reserved.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;

        const emailResponse = await sendEmail(
            to,
            "Invitation to join as Teacher",
            html
        );

        if (!emailResponse) {
            return ApiResponse.error(res, "Failed to send invitation email");
        }

        return ApiResponse.success(res, "Invitation sent successfully");

    } catch (error: any) {
        return ApiResponse.error(res, error.message || "Something went wrong");
    }
};

export const decodeInviteToken = async (req: any, res: any) => {
    try {
        const { token, password } = req.body;
        const tokenData = await decoded(token);
        const teacherData = {
            username: tokenData.username,
            email: tokenData.email,
            password: password,
            role: USERROLE.TEACHER,
            department: tokenData.department_id
        }
        await UserModel.create(teacherData);
        ApiResponse.success(res, "Teacher account created successfully");
    } catch (error: any) {
        console.log(error);
        ApiResponse.error(res, error.message || "Something went wrong");
    }
};

