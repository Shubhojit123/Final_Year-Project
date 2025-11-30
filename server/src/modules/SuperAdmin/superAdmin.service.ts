import { BaseService } from "../../Base/Base_Class/Base.service";
import { IUser, UserModel } from "../../Base/Base_Model/user.model";
import { CollegeModel, ICollege } from "./superAdmin.model";

export class CollegeService extends BaseService<ICollege>{
    constructor(){
        super(CollegeModel);
    }
}


export class UserService extends BaseService<IUser>{
    constructor(){
        super(UserModel);
    }
}