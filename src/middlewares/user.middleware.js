const { AppError } = require('../utils/errors.util');

function authorizeUser(req, res, next) {
    // for any route to the request with /:id,
    // then either an admin or that user who is having same id, can modify or see that request.
    if ((req.user._id.toString() === req.params.id) || (req.user.role === 'admin')) {
        return next();
    } else {
        return next(new AppError({
            statusCode: 401,
            shortMsg: 'user_unauthorized',
            message: 'You are not authorized to make such requests to the desired page..',
            targetUri: '/',
        }));
    }
}

module.exports = {
    authorizeUser,
};
