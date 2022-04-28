const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const User = require("../models/userModel");

exports.sendJwt = async (user, statusCode, res) => {
    const token = await promisify(jwt.sign)({id: user._id.toString()}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});
    user.password = undefined;
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };

    res.cookie('jwt', token, cookieOptions);
    res.status(statusCode).json(
        {
            id: user._id,
            email: user.email
        }
    );
};

exports.validateJwt = async (token) => {
    if (!token) {
        return {jwtValid: false};
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return {jwtValid: false};
    }

    return {
        user: currentUser,
        jwtValid: !currentUser.changedPasswordAfter(decoded.iat)
    };
}
