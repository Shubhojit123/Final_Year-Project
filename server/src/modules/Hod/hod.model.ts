import { getModelForClass, modelOptions, prop, Ref } from "@typegoose/typegoose";
import mongoose from "mongoose";
import { DepartmentModel } from "../Admin/admin.model";
import { UserModel } from "../../Base/Base_Model/user.model";


@modelOptions({
    schemaOptions:{
        collection: 'year',
        timestamps:true,
    }
})

export class IYear {
    @prop({required:true})
    public name!: string;

    @prop({required:true, ref:()=> 'departments' , type: ()=> mongoose.Types.ObjectId})
    public department !: Ref<typeof DepartmentModel>

}

export const YearModel = getModelForClass(IYear);


@modelOptions({
    schemaOptions:{
        collection:'batchs',
        timestamps:true
    }
})

export class IBatch {
    @prop({required:true})
    public  name !: string

    @prop({required:true,ref:()=>'departments',type:()=>mongoose.Types.ObjectId})
    public department !: Ref<typeof DepartmentModel>

    @prop({required:true,ref:()=>'year',type:()=>mongoose.Types.ObjectId})
    public year !: Ref<typeof YearModel>
}

export const BatchModel =  getModelForClass(IBatch);

@modelOptions({
    schemaOptions:{
        collection:'sem',
        timestamps:true
    }
})

export class  ISem {
    @prop({required:true})
    public name !: string;

    @prop({required:true, ref:()=>'departments', type:()=>mongoose.Types.ObjectId})
    public department !: Ref<typeof DepartmentModel>;

}

export const SemModel = getModelForClass(ISem);


@modelOptions({
    schemaOptions:{
        collection:'subject',
        timestamps:true
    }
})

export class ISubject {
    @prop({required:true})
    public name !: string;

    @prop({required:true})
    public code !: string;

    @prop({required:true, ref:()=>'departments', type:()=>mongoose.Types.ObjectId})
    public department !: Ref<typeof DepartmentModel>;

    @prop({required:true, ref:()=>'sem', type:()=>mongoose.Types.ObjectId})
    public sem !: Ref<typeof SemModel>;
}

export const SubjectModel = getModelForClass(ISubject);


@modelOptions({
    schemaOptions:{
        collection: 'teacherAssign',
        timestamps: true,
    }
})

export class ITeacherAssign {
    @prop({ required: true, ref: () => 'users', type: () => mongoose.Types.ObjectId })
    public teacher !: Ref<typeof  UserModel>;

    @prop({ required: true, ref: () => 'subject', type: () => mongoose.Types.ObjectId })
    public subject !: Ref<typeof SubjectModel>;

    @prop({ required: true, ref: () => 'batch', type: () => mongoose.Types.ObjectId })
    public batch !: Ref<typeof BatchModel>;
}

export const TeacherAssignModel = getModelForClass(ITeacherAssign);