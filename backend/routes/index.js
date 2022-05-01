const express = require('express');
const router = express.Router();
const applicationsRouter = require('./applicationsRoutes');
const runtimeRouter = require('./runtimeRoutes');
const testRouter = require('./testRoutes');
const userRoutes = require('./userRoutes');
const authController = require("../controllers/authController");

router.use('/user', userRoutes);
router.use('/applications', authController.protect, applicationsRouter);
router.use('/runtime', authController.protect, runtimeRouter);
router.use('/test', authController.protect, testRouter);

module.exports = router;
