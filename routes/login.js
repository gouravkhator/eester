const router = require('express').Router();
const passport = require('passport');
const { skipLoginsIfAuthenticated, allowOnlyIfAuthenticated } = require('../middlewares');
const User = require('../models/user');

const { AppError } = require('../utils/_globals');
const sendMail = require('../utils/mailsender');

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

router.post('/verify', skipLoginsIfAuthenticated, async (req, res) => {
    const unverifiedUser = req.app.get('user-unverified') ?? null;

    try {
        if (unverifiedUser?._id.length() == 0) {
            throw new AppError({
                statusCode: 400,
                message: 'Please register before requesting for email verification..',
                shortCode: 'no-user-provided',
            });
        }

        const otpEntered = req.body.enteredOTP;

        if (parseInt(otpEntered) === parseInt(req.app.get('verification-otp') ?? -1)) {
            // either get the otp set by server from req.app.get or compare with -1, which will obviously return false
            // as otp set is a positive 6-digit integer..
            await unverifiedUser.save();
            req.app.disable('verification-otp');
            req.app.disable('user-unverified');

            res.redirect('/auth/login'); // allow the login after registering a new account
        } else {
            throw new AppError({
                statusCode: 400, // Bad request
                message: 'Invalid OTP entered.. Please try again..',
                shortCode: 'invalid-otp',
            });
        }
    } catch (e) {
        switch (e.shortCode) {
            case 'invalid-otp':
                req.app.disable('verification-otp');
                return res.render('login/verify_otp');
            case 'no-user-provided':
                req.app.disable('verification-otp');
                return res.redirect('/auth/register');
            default:
                // TODO: set error message
                return res.redirect('/auth/register');
        }
    }
});

router.post('/register', skipLoginsIfAuthenticated, async (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: 'general_user',
    });

    try {
        const otpSetByServer = sendMail('verify', { email: user.email });
        req.app.set('user-unverified', user);
        req.app.set('verification-otp', otpSetByServer);
        res.render('login/verify_otp');
    } catch (e) {
        // TODO: error message setting
        // error could occur from sendMail, or from saving user
        res.redirect('/auth/register');
    }
});

router.post('/logout', allowOnlyIfAuthenticated, (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;
