import { UserModel } from "../../Base/Base_Model/user.model";
import * as bcrypt from "bcryptjs";
import { generateToken, verifyJwt } from "../../utils/jwt.util";
import { DepartmentModel } from "../Admin/admin.model"; // Ensure model is registered
import { CollegeModel } from "../SuperAdmin/superAdmin.model"; // Ensure model is registered
import { sendResetEmail } from "../../utils/email.util";


export class AuthService {
    async login(email: string, password: string) {
        console.log("Login attempt for:", email);
        const user: any = await UserModel.findOne({ email });

        if (!user) {
            console.log("User not found in DB");
            throw new Error("Invalid credentials");
        }

        console.log("User found, checking password...");
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch && password !== user.password) {
            console.log("Password mismatch");
            throw new Error("Invalid credentials");
        }

        // Safe populate — prevent errors if model registration has issues
        let result: any = null;
        try {
            // findOne returns a single object and populates its college
            result = await DepartmentModel.aggregate([
                {
                    $match: {
                        head: user._id
                    }
                },
                {
                    $lookup: {
                        from: "colleges", // ✅ collection name (IMPORTANT)
                        localField: "college",
                        foreignField: "_id",
                        as: "collegeData"
                    }
                },
                {
                    $unwind: {
                        path: "$collegeData",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        slug: 1,
                        collegeId: "$collegeData._id",
                        collegeName: "$collegeData.name"
                    }
                }
            ]); console.log("Metadata populated successfully",);
        } catch (err) {
            console.error("Population failed but continuing login:", err);
        }

        console.log("Login successful for:", email);
        const token = generateToken({ id: user._id, role: user.role, email: user.email });


        const dept = result?.[0] || null;

        return {
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,

                ...(user.role === 'HOD' && dept && {
                    department: {
                        _id: dept._id,
                        name: dept.name,
                        college: {
                            _id: dept.collegeId,
                            name: dept.collegeName,
                        }
                    }
                })
            },
            token
        };
    }

    async register(userData: any) {
        const { email, password, username, role } = userData;

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            throw new Error("Email already registered");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser: any = await UserModel.create({
            username,
            email,
            password: hashedPassword,
            role: role || 'STUDENT'
        });

        // Populate the new user
        await newUser.populate({
            path: 'department',
            populate: { path: 'college' }
        });


        const token = generateToken({ id: newUser._id, role: newUser.role, email: newUser.email });

        return {
            user: {
                id: newUser._id,
                email: newUser.email,
                username: newUser.username,
                role: newUser.role,
                department: newUser.department
            },
            token
        };

    }

    async forgotPassword(email: string, origin: string) {
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw new Error("User with this email does not exist");
        }

        const token = generateToken({ id: user._id, email: user.email }, "15m");
        const resetLink = `${origin || "http://localhost:5173"}/login?token=${token}`;

        console.log("-----------------------------------------");
        console.log(`Password reset requested for: ${email}`);
        console.log(`Reset link: ${resetLink}`);
        console.log("-----------------------------------------");

        await sendResetEmail(email, resetLink);
        return { message: "Password reset link has been sent to your email" };
    }

    async resetPassword(token: string, password: string) {
        const payload = verifyJwt(token) as any;
        if (!payload || !payload.id) {
            throw new Error("Invalid or expired password reset token");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await UserModel.findByIdAndUpdate(
            payload.id,
            { password: hashedPassword },
            { new: true }
        );

        if (!user) {
            throw new Error("User not found");
        }

        return { message: "Password reset successful" };
    }
}
