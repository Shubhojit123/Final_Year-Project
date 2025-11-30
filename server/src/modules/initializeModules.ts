import type { Application } from "express";
import { adminRouter } from "./Admin/admin.router";
import { hodRouter } from "./Hod/hod.router";
import { teacherRouter } from "./Teachers/teacher.router";
import { studentRouter } from "./Student/student.router";
import { superAdminRouter } from "./SuperAdmin/super.admin.router";

export default function initializeModules(app : Application) : any {
    app.use('/api/admin',adminRouter);
    app.use('/api/hod',hodRouter);
    app.use('/api/teacher',teacherRouter);
    app.use('/api/student',studentRouter);
    app.use('/api/super-admin',superAdminRouter);
}
