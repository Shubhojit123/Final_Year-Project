import { Request, Response } from "express";
import { BaseService } from "./Base.service";
import { ApiResponse } from "./Response";

export class BaseController<T> {
    protected service: BaseService<T>;
    constructor(service: BaseService<T>) {
        this.service = service;
    }

    handleCreate = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.service.create(req.body);
      ApiResponse.success(res, "Created successfully", data, 201);
    } catch (error: any) {
      ApiResponse.error(res, "Error in handleCreate", error.message, 500);
    }
  };


  handelUpdate = async(req:Request,res:Response) =>{
    try {
        const _id = req.params._id || req.query._id || req.body._id;
        if (!_id) {
          ApiResponse.error(res, 'Missing _id parameter', 400);
          return;
        }
        const data = await this.service.updateById(_id, req.body); 
      if (!data) {
        ApiResponse.error(res, 'Record not found', 404);
        return;
      }
      ApiResponse.success(res, 'Updated successfully', data);
    } catch (error:any) {
        ApiResponse.error(res, "Error in handleCreate", error.message, 500);
    }
  }

  handelGetAll = async(req:Request,res:Response) =>{
    try {
        const data = await this.service.getAll();
        ApiResponse.success(res,data);
    } catch (error:any) {
        ApiResponse.error(res, "Error in handleCreate", error.message, 500);
    }
  }

  handelDelete = async(req:Request , res:Response)=>{
    try {
      const _id = req.params._id || req.query._id || req.body._id;
      if (!_id) {
          ApiResponse.error(res, 'Missing _id parameter', 400);
          return;
        }
        await this.service.deletedById(_id);
        ApiResponse.success(res,"Deleted Sucessfully",200)
    } catch (error : any) {
      ApiResponse.error(res, "Error in handleCreate", error.message, 500);
    }
  }

  handelfind = async(req:Request,res:Response)=>{
    try {
      const _id  = req.params._id || req.query._id || req.body._id;
      const data = await this.service.findById(_id);
      if(!data)
      {
        return ApiResponse.error(res,"Not found",401);
      }
       ApiResponse.success(res, "Found", data);
    } catch (error:any) {
      ApiResponse.error(res, "Error in handleCreate", error.message, 500);
    }
  }

}