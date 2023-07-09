import { Router } from "express";
import AppDataSource from "../data_source.js";
import UserController from "../controllers/UserController.js";

const user_router = Router();
const user_controller = new UserController(AppDataSource);

user_router.post("/", user_controller.create);

export default user_router;
