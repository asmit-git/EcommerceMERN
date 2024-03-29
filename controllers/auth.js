const User = require('../models/user');
const jwt = require('jsonwebtoken'); //generates sign token
const expressJwt = require('express-jwt'); //authorization check
const { errorHandler } = require('../helpers/dbErrorHandler');
const user = require('../models/user');



exports.signup = (req, res) => {
    console.log('req.body', req.body);
    const user = new User(req.body);
    user.save((err, user) => {
        if (err) {
            return res.status(400).json({
                err: errorHandler(err)
            });
        }
        user.salt = undefined
        user.hashed_password = undefined
        res.json({
            user
        });
    });
};


exports.signin = (req, res) => {
    //find user based on email
    const { email, password } = req.body
    user.findOne({ email }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                err: "Opps! User with that email doesnot exist. Please signup to continue"
            });
        }
        //if user is found make sure the email and password match
        //create authenticate method in user model
        if (!user.authenticate(password)) {
            return res.status(401).json({
                error: "Email and Password doesnot match"
            })
        }

        //generate a signed token with user id and secret
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET)

        //persist the token as 'token' in cookie with expiry date
        res.cookie('token', token, { expire: new Date() + 9999 })

        //return response with user and token to frontend client
        const { _id, name, email, role } = user
        return res.json({ token, user: { _id, email, name, role } });
    })
}

exports.signout = (req, res) => {
    res.clearCookie('token')
    res.json({ message: "Signed out Successfully" });
};


exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    userProperty: "auth",
    algorithms: ['HS256']
});

exports.isAuth = (req, res, next) => {
    let user = req.profile && req.auth && req.profile._id == req.auth._id
    if (!user) {
        return res.status(403).json({
            error: "Access Denied"
        });
    }
    next();
}

exports.isAdmin = (req, res, next) => {
    if (req.profile.role === 0) {
        return res.status(403).json({
            error: 'Admin resource ! Access Denied'
        });
    }
    next();
}