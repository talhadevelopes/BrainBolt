const express = require ("express");
const STEMRouter = require("./STEM/stem")
const GeneralRouter = require("./General/index")
const PCMRouter  = require('./PCM/index')


const MainRouter = express.Router();


MainRouter.use("/STEM", STEMRouter);
MainRouter.use("/General", GeneralRouter);
MainRouter.use("/PCM", PCMRouter);

module.exports = MainRouter;
