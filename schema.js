import { Schema, model } from "mongoose";

const exerciseSchema = new Schema({
  user: { type: Schema.ObjectId, ref: "User" },
  description: String,
  duration: Number,
  date: Date,
});

const userSchema = new Schema({
  username: { type: String, unique: true },
});

const logSchema = new Schema({
  username: String,
  count: Number,
  log: [{ type: Schema.Types.ObjectId, ref: "Exercise" }],
});

const Exercise = model("Exercise", exerciseSchema);
const User = model("User", userSchema);
const Log = model("Log", logSchema);

export { Exercise, User, Log, exerciseSchema };
