import { Router } from "express";
import { body } from "express-validator";
import { signIn } from "../controllers/user-controller";
const userRouter = Router();
userRouter.post(
  "/signin",
  [
    body("username").isLength({ min: 4 }),
    body("password").isLength({ min: 8 }),
  ],
  signIn
);

export default userRouter;
