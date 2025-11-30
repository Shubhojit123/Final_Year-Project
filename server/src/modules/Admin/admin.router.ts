import { Router } from 'express';
import { departmentCotroller, userController } from './admin.controller';

const router = Router();
const deptcontroller = new departmentCotroller();
const UserController = new userController()

router.post("/",deptcontroller.handleCreate);
router.post("/all-departments",deptcontroller.handelGetAll);
router.get("/departments",deptcontroller.handelfind);
router.delete("/department",deptcontroller.handelDelete);
router.put("/department-update",deptcontroller.handelUpdate);
router.put("/assign-head",deptcontroller.handelUpdate)


router.post("/create-user",UserController.handleCreate);
router.post("/all-users",UserController.handelGetAll);
router.get("/user",UserController.handelfind);
router.delete("/user/",UserController.handelDelete);
router.put("/user-update",UserController.handelUpdate);



export const adminRouter = router;