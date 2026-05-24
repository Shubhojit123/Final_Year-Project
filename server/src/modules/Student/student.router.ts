import { Router } from "express";
import { getStudentMarks } from "./student.controller";
import { verifyToken, authorizeRoles } from "../../middlewares/auth.middleware";
import { USERROLE } from "../../Base/Base_Class/Base.enum";
import { semController } from "../Hod/hod.controller";

const router = Router();
const semControllerI = new semController();

router.use(verifyToken);
router.use(authorizeRoles(USERROLE.STUDENT, USERROLE.TEACHER, USERROLE.HOD, USERROLE.ADMIN, USERROLE.SUPERADMIN));


router.post("/results", getStudentMarks);
router.post("/all-sems", semControllerI.handelGetAll);

export const studentRouter = router