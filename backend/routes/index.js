const express = require('express');
const router = express.Router();
const ingressRouter = require('./ingressRoutes');
const runtimeRouter = require('./runtimeRoutes');
const testRouter = require('./testRoutes');
const validateRouter = require('./validateRoutes');
const userRoutes = require('./userRoutes');
const authController = require("../controllers/authController");

router.use('/user', userRoutes);
router.use('/ingress', authController.protect, ingressRouter);
router.use('/runtime', authController.protect, runtimeRouter);
router.use('/test', authController.protect, testRouter);
router.use('/validate', authController.protect, validateRouter);

module.exports = router;
