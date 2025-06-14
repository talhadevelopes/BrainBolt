const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { ApifyClient } = require("apify-client");
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const { GoogleGenerativeAI } = require("@google/generative-ai");

const  MainRouter   = require("./Routes/index");

const UserModel = require("../models/UsersSchema");

const MONGOOSE_URL = process.env.MONGO_URL;

const app = express();
app.use(cors());

app.use(express.json());

app.use("/api/v1", MainRouter);


mongoose
  .connect(MONGOOSE_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Something went wrong", err));

app.listen(3000, () => { 
  console.log("Server is running at port 3000");
});
