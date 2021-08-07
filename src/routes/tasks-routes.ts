import { Router } from "express";
import { body, param } from "express-validator";
import * as tasksController from "../controllers/tasks-controller";
import checkAuth from "../middlewares/check-auth";
const tasksRouter = Router();
tasksRouter.get("/", checkAuth, tasksController.getTasks);

tasksRouter.post(
  "/",
  checkAuth,
  [body("content").isString(), body("priority"), body("createdOn").isISO8601()],
  tasksController.addTask
);

tasksRouter.put(
  "/",
  checkAuth,
  [body("id").isLength({ min: 24, max: 24 })],
  tasksController.editTask
);

tasksRouter.delete(
  "/:id",
  checkAuth,
  [param("id").isLength({ min: 24, max: 24 })],
  tasksController.deleteTask
);
export default tasksRouter;
