import mongoose from "mongoose";

export const exerciseSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date,
});

export const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
});

export const logSchema = new mongoose.Schema({
  username: String,
  count: Number,
  log: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exercise" }],
});
