import { Application } from "express";
import mongoose from "mongoose";
import { adminRouter } from "./Admin/admin.router";
import { hodRouter } from "./Hod/hod.router";
import { teacherRouter } from "./Teachers/teacher.router";
import { studentRouter } from "./Student/student.router";
import { superAdminRouter } from "./SuperAdmin/super.admin.router";
import { authRouter } from "./Auth/auth.router";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware";
import { USERROLE } from "../Base/Base_Class/Base.enum";

export default function initializeModules(app: Application): any {
    console.log("Registered Models:", mongoose.modelNames());
    
    app.use('/api/auth', authRouter);
    app.use('/api/admin', verifyToken, authorizeRoles(USERROLE.ADMIN, USERROLE.SUPERADMIN), adminRouter);
    app.use('/api/hod', verifyToken, authorizeRoles(USERROLE.HOD, USERROLE.ADMIN, USERROLE.SUPERADMIN), hodRouter);
    app.use('/api/teacher', verifyToken, authorizeRoles(USERROLE.TEACHER, USERROLE.HOD, USERROLE.ADMIN, USERROLE.SUPERADMIN), teacherRouter);
    app.use('/api/student', verifyToken, authorizeRoles(USERROLE.STUDENT, USERROLE.TEACHER, USERROLE.HOD, USERROLE.ADMIN, USERROLE.SUPERADMIN), studentRouter);
    app.use('/api/super-admin', verifyToken, authorizeRoles(USERROLE.SUPERADMIN), superAdminRouter);
}
