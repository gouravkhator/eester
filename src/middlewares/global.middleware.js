const { AppError } = require('../utils/errors.util');

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
    const getPageFromUri = (targetUri = '/') => {
        return {
            '/': 'index',
            '/auth/login': 'auth/login',
            '/auth/signup': 'auth/signup',
            '/user/dashboard': 'user/dashboard',
            '/user/edit': 'user/edit_user',
            '404': '404'
        }[targetUri];
    };

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

module.exports = {
    passEnvToLocals,
    handleErrors,
}