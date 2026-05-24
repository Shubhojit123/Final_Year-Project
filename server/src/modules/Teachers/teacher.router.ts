import { Router } from "express";
import { markController } from "./teacher.controller";
import { verifyToken, authorizeRoles } from "../../middlewares/auth.middleware";
import { USERROLE } from "../../Base/Base_Class/Base.enum";
import { semController } from "../Hod/hod.controller";

const router = Router();

const teacherControllerI = new markController();
const semControllerI = new semController();

router.post("/get-my-subjects", teacherControllerI.getMyAssignments);
router.post("/all-marks", teacherControllerI.handelGetAll);

router.post("/mark-create", teacherControllerI.handleCreate);
router.post("/all-sems", semControllerI.handelGetAll);
router.post("/batch-students", teacherControllerI.getStudentsByBatch);
router.get("/mark", teacherControllerI.handelfind);
router.delete("/mark-delete", teacherControllerI.handelDelete);
router.put("/mark-update", teacherControllerI.handelUpdate);

export const teacherRouter = router;