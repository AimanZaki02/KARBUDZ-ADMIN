const Admin = require("../models/AdminModel");

// Middleware to check if the user is logged in
module.exports.isLogin = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            const admin = await Admin.findById(req.session.user_id);
            if (admin) {
                res.locals.user = admin;
                next(); // Move next() inside the if block
            } else {
                res.redirect('/');
            }
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.log(error.message);
        res.redirect('/'); // Redirect in case of an error
    }
}

// Middleware to check if the user is logged out
module.exports.isLogout = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            res.redirect('/dashboard');
        } else {
            next(); // Move next() inside the else block
        }
    } catch (error) {
        console.log(error.message);
        res.redirect('/'); // Redirect in case of an error
    }
}
