const router = require('express').Router();
const passport = require('passport');
const { skipLoginsIfAuthenticated, allowOnlyIfAuthenticated } = require('../middlewares');
const User = require('../models/User');

const { AppError } = require('../utils/errorsUtil');
const sendMail = require('../utils/mailsender');

router.get('/login', skipLoginsIfAuthenticated, (req, res) => {
    return res.render('login/login');
});

router.post('/login', skipLoginsIfAuthenticated, (req, res, next) => {
    passport.authenticate('local', function (server_err, user, info) {
        if (server_err) {
            return next(server_err); // some server error
        }

        if (!user) {
            // if user is not setup, means the login was not successful
            // user entered wrong details
            // error_msg is setup in our authAndDBSetup.js file
            // redirect to /auth/login
            const err = new AppError({
                message: info.error_msg,
                statusCode: info.statusCode ?? 404,
                targetUri: '/auth/login',
            });

            return next(err);
        }

        req.logIn(user, function (err) {
            if (err) {
                return next(err); // some login issues at server end, so throw a server error
            }

            return res.redirect('/user/' + user._id);
        });
    })(req, res, next);
});

router.get('/register', skipLoginsIfAuthenticated, (req, res) => {
    return res.render('login/register');
});

router.post('/register', skipLoginsIfAuthenticated, async (req, res, next) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: 'general_user',
    });

    try {
        const existingEntry = await User.findOne({ email: req.body.email });

        if (existingEntry !== null) {
            throw new AppError({
                statusCode: 400,
                message: 'Email already registered! Please login with that mail id..',
                shortMsg: 'email-already-registered',
                targetUri: '/auth/register',
            });
        }

        const otpSetByServer = sendMail('verify', { email: user.email });

        // set the user-unverifed and the otp set by server in the app settings
        // once these settings get consumed, we can remove those settings by calling req.app.disable() method.
        req.app.set('user-unverified', user);
        req.app.set('verification-otp', otpSetByServer);
        return res.render('login/verify_otp', { email: user.email });
    } catch (e) {
        if (e.shortMsg === 'email-already-registered') {
            return next(e); // either user already present
        } else {
            // or mail could not be sent
            const err = new AppError({
                statusCode: 400,
                message: e.message ?? 'Mail could not be sent! Please try again..',
                targetUri: '/auth/register',
            });

            return next(err);
        }
    }
});

router.post('/verify', skipLoginsIfAuthenticated, async (req, res, next) => {
    const unverifiedUser = req.app.get('user-unverified') ?? null;

    try {
        if (unverifiedUser?._id.toString().length === 0) {
            throw new AppError({
                statusCode: 400, // Bad request, user provided is not valid
                message: 'Please register before requesting for email verification..',
                shortMsg: 'invalid-user',
                targetUri: '/auth/register',
            });
        }

        const otpEntered = req.body.enteredOTP;

        // check if otp entered is same as otp set by server
        if (parseInt(otpEntered) === parseInt(req.app.get('verification-otp') ?? -1)) {
            // either get the otp set by server from req.app.get or if not present, then compare with -1, 
            // which will obviously return false, as the otp set by server is a positive 6-digit integer..
            await unverifiedUser.save();
            req.app.disable('verification-otp');
            req.app.disable('user-unverified');

            return res.render('login/login', { success_msg: 'Your account has been successfully created, please login to access the account..' }); // redirect to login page, after registering and verifying a new account
        } else {
            throw new AppError({
                statusCode: 400, // Bad request
                message: 'Invalid OTP entered.. Please try again..',
                shortMsg: 'invalid-otp'
                /*
                Here we cannot have targetUri as /auth/verify, as then we have to apply a get route to /auth/verify.
                This will have issues, as without register page, verify route will be visible.
                We can restrict that route, but it will cause more issues.
                So, we just add a shortMsg here and we deal with that in catch block.
                */
            });
        }
    } catch (e) {
        /*
        Note: don't disable the verification-otp and user-unverified app variables, as they can be consumed in future. 
        If user has provided invalid otp, he will come back to verify page, and we need that unverified user handy.. 
        
        There can be different places where the error might have been thrown:
        
        1. Invalid otp -- thrown when otp check returned false
        2. Invalid user -- when the request is bad, or manipulated..
        3. While save function is called -- It will throw error in mongoose model itself, in pre hook of save. 
        */
        switch (e.shortMsg) {
            case 'invalid-otp':
                return res.status(e.statusCode).render('login/verify_otp', {
                    error_msg: e.message,
                    email: unverifiedUser?.email ?? null,
                });
            case 'invalid-user':
                return next(e);
            default:
                const err = new AppError({
                    statusCode: 409,
                    // 409 conflict : meaning that the request could not be completed, as conflicts are there with state of resource.
                    message: 'Error in creating the account! Please try again..',
                    targetUri: '/auth/register',
                });

                return next(err);
        }
    }
});

router.post('/logout', allowOnlyIfAuthenticated, (req, res) => {
    req.logout();
    return res.redirect('/');
});

module.exports = router;
