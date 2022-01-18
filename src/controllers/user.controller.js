const User = require('../models/User');
const { AppError } = require('../utils/errors.util');

async function getUserByID(req, res) {
    let user = null;

    try {
        user = await User.findById(req.params.id);
        return res.render('user/dashboard');
    } catch {
        const err = new AppError({
            statusCode: 404,
            targetUri: '/auth/login',
            message: 'We could not find any user with that id! Please login again..',
        });

        return next(err);
    }
}

async function updateUser(req, res) {
    const updatedDetails = req.body;
    let existingUser = null;

    try {
        existingUser = await User.findById(req.params.id);
        existingUser.name = updatedDetails.name;
        existingUser.email = updatedDetails.email;
        existingUser.password = updatedDetails.password;

        await existingUser.save();
        return res.render('user/dashboard', { success_msg: 'Profile has been successfully updated' });
    } catch {
        if (existingUser === null) {
            // we could not find that user in our db
            const err = new AppError({
                statusCode: 404, // as user (resource) not found
                message: 'We could not find any user with the entered info! Please login again..',
                targetUri: '/auth/login',
            });

            return next(err);
        } else {
            // we could not save the updated details in our db
            const err = new AppError({
                statusCode: 409,
                message: 'We could not update the details, please try again..',
                targetUri: '/user/edit',
            });

            return next(err);
        }
    }
}

async function deleteUser(req, res, next) {
    let user = null;

    try {
        user = await User.findById({ _id: req.params.id });
        await user.deleteOne({});

        // user does not directly become null as it is saved in session..
        // it refreshes on reload..
        // so, we need to manually set user to null for one time. It is done to set user in headers also, to null.
        // or else, it will show Logout and Profile links, which are shown when user is not null.
        return res.render('auth/login', { user: null, success_msg: 'Your account has been successfully deleted' });
    } catch (e) {
        if (user === null) {
            // we could not find the user by id
            const err = new AppError({
                statusCode: 404,
                message: 'User not found! Please try again..',
                targetUri: '/',
            });

            return next(err);
        } else {
            const err = new AppError({
                statusCode: 403,
                message: e.message ?? 'We were unable to delete the account! Please try again..',
                targetUri: '/user/dashboard',
            });

            return next(err);
        }
    }
}

module.exports = {
    getUserByID,
    updateUser,
    deleteUser,
};
