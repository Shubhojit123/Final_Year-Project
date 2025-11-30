import { getModelForClass, modelOptions, prop, Ref } from "@typegoose/typegoose";
import { USERROLE } from "../Base_Class/Base.enum";
import mongoose from "mongoose";
import { DepartmentModel } from "../../modules/Admin/admin.model";
import { BatchModel } from "../../modules/Hod/hod.model";

@modelOptions({
    schemaOptions: {
        timestamps: true,
        collection: 'users',
    },
})

export class IUser {
    @prop({ required: true })
    public username!: string;

    @prop({ required: true })
    public email!: string;

    @prop({ required: true })
    public password!: string;    

    @prop({ required: true, enum: Object.values(USERROLE), default: USERROLE.STUDENT })
    role!: USERROLE;

    @prop({ default: null, ref:()=> 'departments', type: ()=> mongoose.Types.ObjectId})
    public department !: Ref<typeof DepartmentModel>

    @prop({required:false,ref:()=>'batch',type:()=>mongoose.Types.ObjectId})
    public batch !: Ref<typeof BatchModel>
}

export const UserModel = getModelForClass(IUser); 