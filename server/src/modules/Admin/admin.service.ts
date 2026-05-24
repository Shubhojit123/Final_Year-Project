import { BaseService } from "../../Base/Base_Class/Base.service";
import { IUser, UserModel } from "../../Base/Base_Model/user.model";
import { DepartmentModel, IDepartment } from "./admin.model";
import { ICollege, CollegeModel } from "../SuperAdmin/superAdmin.model";

export class departmentService extends BaseService<IDepartment> {
    constructor(){
        super(DepartmentModel);
    }
}

export class userService extends BaseService<IUser>{
    constructor(){
        super(UserModel);
    }
}

export class collegeService extends BaseService<ICollege>{
    constructor(){
        super(CollegeModel);
    }
}