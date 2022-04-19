const express = require('express');
const router = express.Router();
const ingressRouter = require('./ingressRoutes');
const runtimeRouter = require('./runtimeRoutes');
const testRouter = require('./testRoutes');
const validateRouter = require('./validateRoutes');

router.use('/ingress', ingressRouter);
router.use('/runtime', runtimeRouter);
router.use('/test', testRouter);
router.use('/validate', validateRouter);

module.exports = router;
