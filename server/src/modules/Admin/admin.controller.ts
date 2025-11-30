import { BaseController } from "../../Base/Base_Class/Base.controller";
import { IUser } from "../../Base/Base_Model/user.model";
import {IDepartment} from "./admin.model";
import { departmentService, userService } from "./admin.service";

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