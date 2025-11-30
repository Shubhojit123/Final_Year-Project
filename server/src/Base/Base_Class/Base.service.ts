import { Model } from "mongoose";
import { error } from "console";

export class BaseService<T> {
    protected model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }
    async create(data: Partial<T>) {
        try {
            const createdDocument = await this.model.create(data as any);
            return createdDocument;
        } catch (error: any) {
            console.log(error)
        }
    }

    async updateById(_id: string, updateData: Partial<T>,) {
        try {
            const data = await this.model.findById(_id);
            if (!data) {
                console.log("Data not found")
                throw error
            }
            const updatedDocument = await this.model.findByIdAndUpdate(_id, updateData, { new: true, runValidators: true, });
            return updatedDocument;
        } catch (error: any) {
            console.log(error);
            return error
        }
    }
    async getAll() {
        try {
            const data = await this.model.find({});
            return data;
        } catch (error: any) {
            console.log(error);
            return error;
        }
    }

    async deletedById(id: any) {
        try {
            await this.model.findByIdAndDelete(id);
        } catch (error: any) {
            console.log(error);
            return
        }
    }
    async findById(id: any) {
        try {
            const data = await this.model.findById(id);
            return data;
        } catch (error) {
            console.log(error)
        }
    }
}