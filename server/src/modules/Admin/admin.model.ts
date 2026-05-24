import { getModelForClass, modelOptions, prop, Ref } from "@typegoose/typegoose";
import mongoose from "mongoose";
import { UserModel } from "../../Base/Base_Model/user.model"
import { CollegeModel } from "../SuperAdmin/superAdmin.model";


@modelOptions({
    schemaOptions: {
        timestamps: true,
        collection: 'departments',
    },
})

export class IDepartment {
    @prop({required:true})
    public name!: string;

    @prop({required:true})
    public slug!: string;

    @prop({required:true,ref: 'IUser' , type: () => mongoose.Types.ObjectId})
    public head !: Ref<typeof UserModel>

    @prop({required:true,ref: 'ICollege' , type: () => mongoose.Types.ObjectId})
    public college !: Ref<typeof CollegeModel>

}


export const DepartmentModel = getModelForClass(IDepartment);