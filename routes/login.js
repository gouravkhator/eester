const router = require('express').Router();
const passport = require('passport');
const { skipLoginsIfAuthenticated, allowOnlyIfAuthenticated } = require('../middlewares');
const User = require('../models/user');

router.get('/login', skipLoginsIfAuthenticated, (req, res) => {
    res.render('login/login', { user: req.user });
});

router.post('/login', skipLoginsIfAuthenticated, (req, res, next) => {
    passport.authenticate('local', function (err, user, info) {
        if (err) { return next(err); }

        if (!user) {
            return res.redirect('/auth/login');
        }

        req.logIn(user, function (err) {
            if (err) { return next(err); }

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
        password: req.body.password
    });

    try {
        await user.save();
        res.redirect('/auth/login'); // allow the login after registering a new account
    } catch {
        res.redirect('/auth/register');
    }
});

router.post('/logout', allowOnlyIfAuthenticated, (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;
