const express = require('express');
const router = express.Router();
const ingressRouter = require('./ingressRoutes');
const runtimeRouter = require('./runtimeRoutes');
const testRouter = require('./testRoutes');
const validateRouter = require('./validateRoutes');
const signupRouter = require('./signupRoutes');
const loginRoutes = require('./loginRoutes');
const authController = require("../controllers/authController");

router.use('/ingress', ingressRouter);
router.use('/runtime', runtimeRouter);
router.use('/test', testRouter);
router.use('/validate', authController.protect, validateRouter);
router.use('/signup', signupRouter);
router.use('/login', loginRoutes);

module.exports = router;
