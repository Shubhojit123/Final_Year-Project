import { Router } from "express";
import { markController } from "./teacher.controller";

const router = Router();
const teacherControllerI = new markController();

router.post("/mark-create",teacherControllerI.handleCreate);
router.post("/all-marks",teacherControllerI.handelGetAll);
router.get("/mark",teacherControllerI.handelfind);
router.delete("/mark-delete",teacherControllerI.handelDelete);
router.put("/mark-update",teacherControllerI.handelUpdate);

export const teacherRouter = router;