const { AppError } = require("../utils/errors.util");

/**
 * If login or signup or verify request comes, then:
 * Allows that request to run, if the user is not authenticated.
 * Else redirect user to home page.
 */
function skipLoginsIfAuthenticated(req, res, next) {
    // /auth/verify endpoint is not opened as GET request for simplicity and not complexifying stuffs
    // it is just opened as POST request..
    if (['/auth/login', '/auth/signup', '/auth/verify'].includes(req.originalUrl)) {
        if (req.isAuthenticated()) {
            return res.redirect('/');
        } else {
            return next();
        }
    }
}

/**
 * Allows the next middleware to run, if the user is authenticated.
 * Else redirects to login page
 */
function allowOnlyIfAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        const err = new AppError({
            statusCode: 403, // 403 forbidden
            message: 'Please login before viewing this page',
            targetUri: '/auth/login',
        });

        return next(err);
    }
}

/**
 * Allows only users with the role as admin.
 */
function allowOnlyAdmins(req, res, next) {
    if (req.user?.role === 'admin') {
        return next();
    } else {
        const err = new AppError({
            statusCode: 403, // 403 forbidden
            message: 'Only admins are allowed to enter the admin page',
            targetUri: '/',
            // here, targetUri cannot be given req.originalUrl,
            // as we have not created any of our ejs page to render for admin
        });

        return next(err);
    }
}

module.exports = {
    allowOnlyIfAuthenticated,
    skipLoginsIfAuthenticated,
    allowOnlyAdmins,
};
