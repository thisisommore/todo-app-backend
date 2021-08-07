import mongoose from "mongoose";

export interface ITask {
  content: string;
  priority: string;
  createdOn: string;
}
export interface IUser {
  username: string;
  password: string;
  tasks: ITask[];
}

const taskSchema = new mongoose.Schema<ITask>({
  content: { type: String, required: true },
  priority: { type: String, required: true },
  createdOn: { type: Date, required: true },
});

const userSchema = new mongoose.Schema<IUser>({
  username: { type: String, required: true },
  password: { type: String, required: true },
  tasks: { type: [taskSchema], required: true },
});

export default mongoose.model<IUser>("User", userSchema);
