import { BaseService } from "../../Base/Base_Class/Base.service";
import { IMark, MarkModel } from "./teacher.model";

export class  markService extends BaseService<IMark>{
    constructor() {
        super(MarkModel);
    }
} 