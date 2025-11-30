import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import mongoose from "mongoose";
import { Ref } from "@typegoose/typegoose/lib/types";
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

    @prop({required:true,ref:()=> 'User' , type: ()=> mongoose.Types.ObjectId})
    public head !: Ref<typeof UserModel>

    @prop({required:true,ref:()=> 'colleges' , type: ()=> mongoose.Types.ObjectId})
    public college !: Ref<typeof CollegeModel>

}


export const DepartmentModel = getModelForClass(IDepartment);