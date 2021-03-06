import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import jsonwebtoken from "jsonwebtoken";
import { Document } from "mongoose";
import User, { IUser } from "../models/user";
import bcrypt from "bcrypt";

interface ISignInReqBody {
  username: string;
  password: string;
}

export const signIn: RequestHandler = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res
      .status(442)
      .send(
        "Values are not valid, please check your input fields and try again"
      );

    return;
  }
  const { username, password } = req.body as ISignInReqBody;
  let existingUser: (IUser & Document) | null;
  try {
    existingUser = await User.findOne({ username: username });
  } catch (error) {
    res.status(200).send("Signin failed, please try again later");
    return;
  }

  if (existingUser) {
    if (bcrypt.compareSync(password, existingUser.password)) {
      const token = jsonwebtoken.sign(
        { id: existingUser._id },
        process.env.TOKEN_KEY as string
      );
      res.json({
        token,
      });
    } else {
      res.status(401).send("Invalid credentials");
      return;
    }
  } else {
    let newUser: (IUser & Document) | null;

    try {
      const hashedPassword = await bcrypt.hash(password, 12);

      newUser = await User.create({
        username,
        password: hashedPassword,
      });
    } catch (error) {
      res.status(500).send("Failed to create user, please try again");
      return;
    }
    try {
      const token = jsonwebtoken.sign(
        { id: newUser._id },
        process.env.TOKEN_KEY as string
      );
      res.json({
        token,
      });
    } catch (error) {
      res.status(500).send("Token creation failed, please try again later");
    }
  }
};
