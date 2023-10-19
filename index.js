import cors from "cors";
import dotenv from "dotenv";
import express, { json, urlencoded } from "express";
import mongoose, { connect, mongo } from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { exerciseSchema, userSchema } from "./schema.js";

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

const Exercise = mongoose.model("Exercise", exerciseSchema);
const User = mongoose.model("User", userSchema);

app.use(cors());

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: false }));

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
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
  // const existing = await User.findOne({ name: username }).exec();
  const existing = await User.findOne({ username });
  if (existing) {
    return res.json({ error: "Duplicate user" });
  }

  const user = new User({ username });
  user
    .save()
    .then((data) => {
      console.dir(user.toJSON());
    })
    .catch((err) => {
      console.error(err);
    });
  res.json({ username: user.username, _id: user._id });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
