import { BaseService } from "../../Base/Base_Class/Base.service";
import { IUser, UserModel } from "../../Base/Base_Model/user.model";
import { CollegeModel, ICollege } from "./superAdmin.model";
import * as bcrypt from "bcryptjs";

export class CollegeService extends BaseService<ICollege>{
    constructor(){
        super(CollegeModel);
    }
}


export class UserService extends BaseService<IUser>{
    constructor(){
        super(UserModel);
    }

    override async create(data: Partial<IUser>) {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        return super.create(data);
    }

    override async updateById(_id: string, updateData: Partial<IUser>) {
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }
        return super.updateById(_id, updateData);
    }
}