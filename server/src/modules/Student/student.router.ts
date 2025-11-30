import { Router } from "express";
import {  getStudentMarks } from "./student.controller";

const router = Router();

router.post("/results", getStudentMarks);

export const studentRouter = router