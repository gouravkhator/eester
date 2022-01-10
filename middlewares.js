/**
 * If login or signup request comes, then:
 * Allows that request to run, if the user is not authenticated.
 * Else redirects to home page.
 */
function skipLoginsIfAuthenticated(req, res, next) {
    if (['/auth/login', '/auth/register'].includes(req.originalUrl)) {
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
        return res.redirect('/auth/login');
    }
}

function allowOnlyAdmins(req, res, next){
    // TODO: allow only admins and no other users
    next();
}

module.exports = {
    allowOnlyIfAuthenticated,
    skipLoginsIfAuthenticated,
    allowOnlyAdmins,
};
