const { AppError } = require("./utils/errorsUtil");
const { getPageFromUri } = require('./utils/_globals');

/**
 * This middleware passes environment and some global variables to the locals object for ejs files, to get those values.
 * This middleware should run before any other middlewares, for every request.
 */
function passEnvToLocals(req, res, next) {
    res.locals = {
        recaptcha_site_key: process.env.RECAPTCHA_SITE_KEY,
        // req.user is set and unset by passport authentication
        user: req.user, // this passes the current user if any, else undefined
        // in case of undefined, the ejs pages will check user locals value and will render respective actions for non-logged in users.
    };

    next(); // call the next middleware to run for that request
}

function handleErrors(err, req, res, next) {
    if (err instanceof AppError) {
        // if err is our own modified AppError, then get all our attributes
        // for the targetUri, we get the page and render that page with proper error message
        const pageToRender = getPageFromUri(err.targetUri);
        
        return res.status(err.statusCode).render(pageToRender ?? 'index', {
            error_msg: err.message,
        });
    }

    const pageToRender = getPageFromUri(req.originalUrl);

    // if we don't have any page for that url,
    // then we will get pageToRender as undefined, so we can render index.ejs page
    return res.status(500).render(pageToRender ?? 'index', {
        error_msg: 'Server encountered some error. Please try after sometime..',
    });
}

/**
 * If login or signup or verify request comes, then:
 * Allows that request to run, if the user is not authenticated.
 * Else redirect user to home page.
 */
function skipLoginsIfAuthenticated(req, res, next) {
    // /auth/verify endpoint is not opened as GET request for simplicity and not complexifying stuffs
    // it is just opened as POST request..
    if (['/auth/login', '/auth/register', '/auth/verify'].includes(req.originalUrl)) {
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
    passEnvToLocals,
    allowOnlyIfAuthenticated,
    skipLoginsIfAuthenticated,
    allowOnlyAdmins,
    handleErrors,
};
