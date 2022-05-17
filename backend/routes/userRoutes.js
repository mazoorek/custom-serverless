const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router({mergeParams: true});

router.route('/')
    .get(authController.getUser);
router.route('/signup')
    .post(authController.signup);
router.route('/login')
    .post(authController.login);
router.route('/logout')
    .post(authController.logout);
router.route('/password')
    .put(authController.protect, authController.updatePassword);
router.route('/email')
    .put(authController.protect, authController.updateEmail);
router.route('/password/forgot')
    .post(authController.forgotPassword);
router.route('/password/reset/:token')
    .patch(authController.resetPassword);

module.exports = router;
