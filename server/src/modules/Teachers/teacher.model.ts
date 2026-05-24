import { getModelForClass, modelOptions, mongoose, prop, Ref } from "@typegoose/typegoose";
import { UserModel } from "../../Base/Base_Model/user.model";
import { BatchModel, SemModel, SubjectModel } from "../Hod/hod.model";
import { DepartmentModel } from "../Admin/admin.model";


@modelOptions({
    schemaOptions:{
        collection: 'marks',
        timestamps: true
    }
})

export class IMark {
    @prop({ required: true , ref: 'IUser',type:()=>  mongoose.Types.ObjectId })
    studentId!: Ref<typeof UserModel>;

    @prop({ required: true , ref: 'IUser',type:()=>  mongoose.Types.ObjectId })
    teacher!: Ref<typeof UserModel>;

    @prop({ required: true , ref: 'ISubject',type:()=>  mongoose.Types.ObjectId })
    subjectId!: Ref<typeof SubjectModel>;

    @prop({ required: true , ref: 'IDepartment',type:()=>  mongoose.Types.ObjectId })
    department!: Ref<typeof DepartmentModel>;

    @prop({ required: true , ref: 'IBatch',type:()=>  mongoose.Types.ObjectId })
    batch!: Ref<typeof BatchModel>;

    @prop({ required: true, default: 0 })
    ct1!: number;

    @prop({ required: true, default: 0 })
    ct2!: number;

    @prop({ required: true, default: 0 })
    ct3!: number;

    @prop({ required: true })
    marksObtained!: number;

    @prop({ required: true, default: 60 })
    totalMarks!: number;

    @prop({ required: true, ref:'ISem', type:()=>mongoose.Types.ObjectId })
    semester!: Ref<typeof SemModel>;

}

export const MarkModel = getModelForClass(IMark);