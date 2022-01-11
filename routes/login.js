const router = require('express').Router();
const passport = require('passport');
const { skipLoginsIfAuthenticated, allowOnlyIfAuthenticated } = require('../middlewares');
const User = require('../models/user');

const { ERROR } = require('../utils/_globals');

router.get('/login', skipLoginsIfAuthenticated, (req, res) => {
    res.render('login/login', { user: req.user });
});

router.post('/login', skipLoginsIfAuthenticated, (req, res, next) => {
    passport.authenticate('local', function (server_err, user, info) {
        if (server_err) { 
            return next(server_err);
        }

        if (!user) {
            // if user is not setup, means the login was not successful
            // user entered wrong details
            // error_msg is setup in our authAndDBSetup.js file
            // redirect to /auth/login
            const err = new Error(info.error_msg);
            err.statusCode = 404; // as user not found, or with wrong credentials
            err.redirectUrl = '/auth/login';
            return next(err);
        }

        req.logIn(user, function (err) {
            if (err) {
                return next(err); // some login issues at server end
            }

            return res.redirect('/user/' + user._id);
        });
    })(req, res, next);
});

router.get('/register', skipLoginsIfAuthenticated, (req, res) => {
    res.render('login/register', { user: req.user });
});

router.post('/register', skipLoginsIfAuthenticated, async (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: 'general_user',
    });

    try {
        await user.save();
        res.redirect('/auth/login'); // allow the login after registering a new account
    } catch {
        // TODO: error message setting
        res.redirect('/auth/register');
    }
});

router.post('/logout', allowOnlyIfAuthenticated, (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;
