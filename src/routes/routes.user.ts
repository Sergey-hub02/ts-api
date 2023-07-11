import { Router } from "express";
import AppDataSource from "../data_source.js";
import UserController from "../controllers/UserController.js";

const user_router = Router();
const user_controller = new UserController(AppDataSource);

user_router.post("/", user_controller.create);
user_router.get("/", user_controller.get_all);
user_router.get("/:id", user_controller.get_one);
user_router.put("/:id", user_controller.update);
user_router.delete("/:id", user_controller.delete);
user_router.post("/login/", user_controller.login);

export default user_router;
