const express = require("express");
const cookieParser = require ("cookie-parser");
const router = require("../routes");
const errorHandler = require("./errorHandler");

module.exports = (app) => {
    app.use(express.json({limit: '10kb'}));
    app.use(cookieParser());
    app.use('/api', router);
    app.use(errorHandler);
}
