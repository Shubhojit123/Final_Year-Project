import { Router } from "express";
import { CollegeController, UserController } from "./superAdmin.controller";

const router = Router();
const CollegeControllerI = new CollegeController();
const UserControllerI = new UserController();

router.post("/create-college", CollegeControllerI.handleCreate);
router.get("/get-all-colleges", CollegeControllerI.handelGetAll);
router.delete("/delete-college", CollegeControllerI.handelfind);
router.put("/update-college", CollegeControllerI.handelUpdate);


router.post("/create-user", UserControllerI.handleCreate);
router.get("/get-all-users", UserControllerI.handelGetAll);
router.delete("/delete-user", UserControllerI.handelfind);
router.put("/update-user", UserControllerI.handelUpdate);

export const superAdminRouter = router;