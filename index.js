import cors from "cors";
import dotenv from "dotenv";
import express, { json, urlencoded } from "express";
import mongoose, { connect } from "mongoose";
import { exerciseSchema } from "./schema.js";

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

const exercise = mongoose.model("Exercise", exerciseSchema);

app.use(cors());

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: false }));

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
