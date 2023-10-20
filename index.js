import cors from "cors";
import dotenv from "dotenv";
import express, { json, urlencoded } from "express";
import { connect } from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { Exercise, User } from "./schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
dotenv.config();

connect(process.env["MONGO_URI"], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .catch((error) => {
    console.error(error);
    throw error;
  })
  .then(() => {
    console.log("Connected to mongodb");
  });

app.use(cors());

app.use(urlencoded({ extended: true }));
app.use(json());

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const { from, to, limit } = req.query;
  const { _id } = req.params;
  if (!_id) {
    return res.json({ error: "user required" });
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);

  const maxCount = parseInt(limit, 10);
  const query = { user: _id };
  if (!isNaN(fromDate)) {
    if (!query.date) {
      query.date = {};
    }
    query.date.$gte = from;
  }
  if (!isNaN(toDate)) {
    if (!query.date) {
      query.date = {};
    }
    query.date.$lte = to;
  }

  const logs = await Exercise.find(query)
    .limit(isNaN(maxCount) ? 0 : maxCount)
    .populate("user")
    .lean();
  const exercises = logs.map((log) => {
    return {
      description: log.description,
      duration: log.duration,
      date: log.date.toString(),
      username: log.user.username,
    };
  });
  res.json({ count: exercises.length, log: exercises });
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  const { _id } = req.params;
  const { description, duration: durationRaw, date: dateRaw } = req.body;

  if (!(await User.findById(_id))) {
    return res.json({ error: "user not found" });
  }
  const date = dateRaw ? new Date(dateRaw) : new Date();
  if (date.toString() === "Invalid date") {
    return res.json({ error: "invalid date" });
  }
  const duration = parseInt(durationRaw, 10);
  if (isNaN(duration)) {
    return res.json({ error: "invalid duration" });
  }

  if (!description) {
    return res.json({ error: "empty description" });
  }

  // const exercise = new Exercise({ description, date, duration });
  const exercise = new Exercise({ user: _id, description, date, duration });
  await exercise
    .save()
    .then((data) => {
      console.dir(data.toJSON());
    })
    .catch((err) => {
      console.error(err);
    });
  const log = await Exercise.findById(exercise._id).populate("user").lean();
  res.json(log);
  // res.json({ ...exercise.toJSON(), username: log.user.username });
});

app.get("/api/users", async (req, res) => {
  const users = await User.find().lean().exec();
  res.json(
    users.map((user) => {
      return { _id: user._id, username: user.username };
    })
  );
});

app.post("/api/users", async (req, res) => {
  const { username } = req.body;
  const existing = await User.findOne({ username });
  if (existing) {
    return res.json({ error: "Duplicate user" });
  }

  const user = new User({ username });
  user
    .save()
    .then((data) => {
      console.dir(data.toJSON());
    })
    .catch((err) => {
      console.error(err);
    });
  res.json({ username: user.username, _id: user._id });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
