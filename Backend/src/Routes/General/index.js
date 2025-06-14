
const express = require("express");

const GeneralRouter = express.Router();


GeneralRouter.get("/Health", (req, res) => {
    res.status(202).json({
        Msg: "Yes its workign"
    });
});


module.exports = GeneralRouter;
