import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import { ParamsDictionary } from "express-serve-static-core";
import {
  UpdateWriteOpResult,
  UpdateWithAggregationPipeline,
  UpdateQuery,
  Document,
} from "mongoose";
import ICustomRequest from "../interfaces/custom-request-interface";
import User, { ITask, IUser } from "../models/user";
interface IAddTaskReqBody {
  content: string;
  priority: string;
  createdOn: string;
}
interface IEditTaskReqBody extends Partial<ITask> {
  id: string;
}

interface IDeleteTaskReqParam extends ParamsDictionary {
  id: string;
}

export const getTasks: RequestHandler = async (req, res) => {
  try {
    const user = await User.findOne({ _id: (req as ICustomRequest).user.id });
    const tasks = await user?.tasks;
    res.json(tasks);
  } catch (error) {
    res.status(500).send("Failed to fetch tasks");
  }
};

export const addTask: RequestHandler = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res
      .status(442)
      .send(
        "Values are not valid, please check your input fields and try again"
      );

    return;
  }

  const {
    user: { id: _id },
  } = req as ICustomRequest;
  try {
    const body = req.body as IAddTaskReqBody;

    const { tasks } = await User.findOneAndUpdate(
      { _id },
      {
        $push: {
          tasks: { ...body },
        },
      },
      {
        new: true,
        useFindAndModify: false,
      }
    );
    const newTaskId = (tasks[tasks.length - 1] as Document & ITask)._id;

    res.json({ id: newTaskId });
  } catch (error) {
    res.status(500).send("Failed to add task, please try again later");
    return;
  }
};
export const editTask: RequestHandler = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res
      .status(442)
      .send(
        "Values are not valid, please check your input fields and try again"
      );

    return;
  }
  const { user } = req as ICustomRequest;

  const body = req.body as IEditTaskReqBody;
  let result: UpdateWriteOpResult;
  try {
    const filterQuery = { _id: user.id, "tasks._id": body.id };
    let updateQuery: any = { $set: {} };

    if (body.content) updateQuery.$set["tasks.$.content"] = body.content;
    if (body.priority) updateQuery.$set["tasks.$.priority"] = body.priority;

    result = await User.updateOne(filterQuery, updateQuery);
  } catch (error) {
    res.status(500).send("Failed to update task, please try again later");
    return;
  }

  if (result?.n) {
    res.status(200).end();
  } else {
    res.status(404).send("Task not found");
  }
};

export const deleteTask: RequestHandler = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res
      .status(442)
      .send(
        "Values are not valid, please check your input fields and try again"
      );

    return;
  }
  const params = req.params as IDeleteTaskReqParam;
  const { user } = req as ICustomRequest;
  const filterQuery = { _id: user.id };
  const updateQuery: UpdateWithAggregationPipeline | UpdateQuery<IUser> = {
    $pull: { tasks: { _id: params.id } },
  };
  let result: UpdateWriteOpResult;
  try {
    result = await User.updateOne(filterQuery, updateQuery);
  } catch (error) {
    res.status(500).send("Cannot delete task, please try again later");
    return;
  }

  if (!result.nModified) {
    res.status(404).send("Task not found");
  } else {
    res.status(200).end();
  }
};
