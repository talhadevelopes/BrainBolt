const express = require ("express");
const STEMRouter = require("./STEM/stem")
const GeneralRouter = require("./General/index")


const MainRouter = express.Router();


MainRouter.use("/STEM", STEMRouter);
MainRouter.use("/General", GeneralRouter);

module.exports = MainRouter;
