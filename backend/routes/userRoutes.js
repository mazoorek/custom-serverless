const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router({mergeParams: true});

router.route('/signup')
    .post(authController.signup);
router.route('/login')
    .post(authController.login);
router.route('/password/forgot')
    .post(authController.forgotPassword);
router.route('/password/reset/:token')
    .patch(authController.resetPassword);

module.exports = router;
