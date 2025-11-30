import { Router } from 'express';
import { batchController, decodeInviteToken, inviteTeacher, semController, studentCreate, subjectController, teacherAssignController, yearController } from './hod.controller';
import { upload } from '../../config/multer';

const router = Router();
const yearControllerI = new yearController();
const batchControllerI  = new batchController();
const semControllerI = new semController();
const subjectControllerI = new subjectController();
const teacherAssignI = new teacherAssignController();

router.post("/year-create",yearControllerI.handleCreate);
router.post("/all-years",yearControllerI.handelGetAll);
router.get("/year",yearControllerI.handelfind);
router.delete("/year-delete",yearControllerI.handelDelete);
router.put("/year-update",yearControllerI.handelUpdate);


router.post("/batch-create",batchControllerI.handleCreate);
router.post("/all-batchs",batchControllerI.handelGetAll);
router.get("/batch",batchControllerI.handelfind);
router.delete("/batch-delete",batchControllerI.handelDelete);
router.put("/batch-update",batchControllerI.handelUpdate);


router.post("/sem-create",semControllerI.handleCreate);
router.post("/all-sems",semControllerI.handelGetAll);
router.get("/sem",semControllerI.handelfind);
router.delete("/sem-delete",semControllerI.handelDelete);
router.put("/sem-update",semControllerI.handelUpdate);

router.post("/subject-create",subjectControllerI.handleCreate);
router.post("/all-subjects",subjectControllerI.handelGetAll);
router.get("/subject",subjectControllerI.handelfind);
router.delete("/subject-delete",subjectControllerI.handelDelete);
router.put("/subject-update",subjectControllerI.handelUpdate);

router.post("/teacher-assign",teacherAssignI.handleCreate);
router.post("/all-teacher-assigns",teacherAssignI.handelGetAll);
router.get("/teacher-assign",teacherAssignI.handelfind);
router.delete("/teacher-assign-delete",teacherAssignI.handelDelete);
router.put("/teacher-assign-update",teacherAssignI.handelUpdate);

router.post("/student-create",upload.single("file"),studentCreate);
router.post("/invite-teacher",inviteTeacher);
router.post("/verify-invitation",decodeInviteToken);


export const hodRouter = router;