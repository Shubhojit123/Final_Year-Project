import { BaseService } from "../../Base/Base_Class/Base.service";
import { BatchModel, IBatch, ISem, ISubject, ITeacherAssign, IYear, SemModel, SubjectModel, TeacherAssignModel, YearModel } from "./hod.model";

export class yearService extends BaseService<IYear> {
    constructor(){
        super(YearModel);
    }
}

export class batchService extends BaseService<IBatch> {
    constructor(){
        super(BatchModel);
    }

    async getAll() {
        try {
            const data = await this.model.find({}).populate('year');
            return data;
        } catch (error: any) {
            console.log(error);
            return error;
        }
    }
}

export class semService extends BaseService<ISem> {
    constructor(){
        super(SemModel);
    }
}

export class subjectService extends BaseService<ISubject> {
    constructor(){
        super(SubjectModel);
    }

    async getAll() {
        try {
            const data = await this.model.find({}).populate('sem');
            return data;
        } catch (error: any) {
            console.log(error);
            return error;
        }
    }
}


export class teacherAssignService extends BaseService<ITeacherAssign> {
    constructor(){
        super(TeacherAssignModel);
    }

    async getAll() {
        try {
            const data = await this.model.find({}).populate('teacher subject batch');
            return data;
        } catch (error: any) {
            console.log(error);
            return error;
        }
    }
}