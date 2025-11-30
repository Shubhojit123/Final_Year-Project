import { BaseConnection } from "mongoose";
import { ICollege } from "./superAdmin.model";
import { BaseController } from "../../Base/Base_Class/Base.controller";
import { CollegeService, UserService } from "./superAdmin.service";
import { IUser } from "../../Base/Base_Model/user.model";

export class CollegeController extends BaseController<ICollege> {
    constructor() {
        super(new CollegeService());
    }
}


export class UserController extends BaseController<IUser> {
    constructor(){
        super(new UserService());
    }
}
