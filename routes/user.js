const router = require('express').Router();
const { ERROR } = require('../utils/_globals');

const User = require('../models/user');

function authorizeUser(req, res, next) {
    // for any route to the request with /:id,
    // then either an admin or that user who is having same id, can modify or see that request.
    if ((req.user._id.toString() === req.params.id) || (req.user.role === 'admin')) {
        return next();
    } else {
        res.status(401).render('/', { user: req.user, error_msg: ERROR.user_unauthorized });
    }
}

router.get('/settings', (req, res) => {
    res.render('user/settings', { user: req.user });
});

router.get('/:id', authorizeUser, async (req, res) => {
    let user = null;

    try {
        user = await User.findById(req.params.id);
        res.send(user);
    } catch (e) {
        res.render('login/login', {
            user: req.user,
            error_msg: 'We could not find any user with that id! Please login again..',
        });
    }
});

router.put('/:id', authorizeUser, async (req, res) => {
    const updatedDetails = req.body;
    let existingUser = null;

    try {
        existingUser = await User.findById(req.params.id);
        existingUser.name = updatedDetails.name;
        existingUser.email = updatedDetails.email;
        existingUser.password = updatedDetails.password;
        await existingUser.save();
        // TODO: show a flash message that settings are saved successfully
        res.redirect('/user/settings');
    } catch (e) {
        if (existingUser === null) {
            // we could not find that user in our db
            res.render('login/login', {
                user: req.user,
                error_msg: 'We could not find any user with the entered info! Please login again..',
            });
        } else {
            // we could not save the updated details in our db
            res.render('user/settings', {
                user: req.user,
                error_msg: 'We could not update the details, please try again..',
            });
        }
    }
});

router.delete('/:id', authorizeUser, async (req, res) => {
    try {
        await User.deleteOne({ _id: req.params.id });
        res.redirect('/auth/login');
    } catch (e) {
        res.render('login/login', {
            user: req.user,
            error_msg: 'We could not find any user with the authorized id! Please login again to delete..',
        });
    }
});

module.exports = router;
