const crypto = require('crypto');
const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const Email = require('../models/email/email');
const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');

exports.signup = asyncHandler(async (req, res) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    await authService.sendJwt(newUser, 201, res);
});


exports.login = asyncHandler(async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(401).json({message: "Please provide email and password"});
    }
    const user = await User.findOne({email}).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return res.status(401).json({message: "Incorrect email or password"});
    }
    await authService.sendJwt(user, 200, res);

});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({status: 'success'});
};

exports.protect = asyncHandler(async (req, res, next) => {
    const {jwtValid, user} = await authService.validateJwt(req.cookies.jwt);
    if(!jwtValid) {
        return res.status(401).json({message: "access forbidden"});
    }
    req.user = user;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({message: "You do not have permission to perform this action"});
        }
        next();
    };
};

exports.forgotPassword = asyncHandler(async (req, res) => {
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        return res.status(404).json({message: "There is no user with this email address"});
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});

    try {
        const resetURL = `http://${req.get('host')}/api/password/reset/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();

        return res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});
        return res.status(500).json({message: "There was an error sending the email. Try again later"});
    }
});

exports.resetPassword = asyncHandler(async (req, res) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {$gt: Date.now()}
    });

    if (!user) {
        return res.status(400).json({message: "Token is invalid or has expired"});
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    await authService.sendJwt(user, 200, res);
});

exports.updatePassword = async (req, res) => {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return res.status(401).json({message: "Your current password is wrong."});
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    await authService.sendJwt(user, 200, res);
};
