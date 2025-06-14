const express = require("express");

const PCMRouter = express.Router();

PCMRouter.get("/Health", (req, res) => {
    res.status(200).json({
        msg:"Pcm router working"
    });
});

module.exports = PCMRouter;