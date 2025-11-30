import { BaseController } from "../../Base/Base_Class/Base.controller";
import { IMark } from "./teacher.model";
import { markService } from "./teacher.service";

export class markController extends BaseController<IMark> {
    constructor() {
        super(new markService());
    }
}