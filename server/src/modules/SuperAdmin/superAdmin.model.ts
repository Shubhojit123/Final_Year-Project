import { getModelForClass, modelOptions, prop, Ref } from "@typegoose/typegoose";
import mongoose from "mongoose";
import { UserModel } from "../../Base/Base_Model/user.model";

@modelOptions({
    schemaOptions:{
        timestamps:true,
        collection:'colleges',
    }
})

export class ICollege {
    @prop({required:true, unique:true})
    public name !: string; 

    @prop({required:false,ref:'users',type:()=>mongoose.Types.ObjectId})
    public adminId !: Ref<typeof UserModel>
}

export const CollegeModel = getModelForClass(ICollege);