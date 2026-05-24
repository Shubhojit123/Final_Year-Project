import { Router } from 'express';
import { departmentCotroller, userController, collegeController } from './admin.controller';
import { verifyToken, authorizeRoles } from "../../middlewares/auth.middleware";
import { USERROLE } from "../../Base/Base_Class/Base.enum";

const router = Router();

router.use(verifyToken);
router.use(authorizeRoles(USERROLE.ADMIN, USERROLE.SUPERADMIN));

const deptcontroller = new departmentCotroller();
const UserController = new userController();
const CollegeController = new collegeController();


router.post("/", deptcontroller.handleCreate);
router.post("/all-departments", deptcontroller.handelGetAll);
router.get("/departments", deptcontroller.handelfind);
router.delete("/department", deptcontroller.handelDelete);
router.put("/department-update", deptcontroller.handelUpdate);
router.put("/assign-head", deptcontroller.handelUpdate)


router.post("/create-user", UserController.handleCreate);
router.post("/all-users", UserController.handelGetAll);
router.get("/user", UserController.handelfind);
router.delete("/user/", UserController.handelDelete);
router.put("/user-update", UserController.handelUpdate);

// Colleges — read-only for Admin
router.get("/all-colleges", CollegeController.handelGetAll);

export const adminRouter = router;