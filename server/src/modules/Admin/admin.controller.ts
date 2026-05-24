import { BaseController } from "../../Base/Base_Class/Base.controller";
import { IUser } from "../../Base/Base_Model/user.model";
import {IDepartment} from "./admin.model";
import { ICollege } from "../SuperAdmin/superAdmin.model";
import { departmentService, userService, collegeService } from "./admin.service";

export class departmentCotroller extends BaseController<IDepartment>{
    constructor(){
        super(new departmentService());
    }
}

export class userController extends BaseController<IUser>{
    constructor(){
        super(new userService());
    }
}

export class collegeController extends BaseController<ICollege>{
    constructor(){
        super(new collegeService());
    }
}