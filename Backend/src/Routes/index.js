const express = require ("express");
const STEMROuter = require("../STEM/stem")


const MainRouter = express.Router();


MainRouter.use("/STEM", STEMROuter);

module.exports = MainRouter;
