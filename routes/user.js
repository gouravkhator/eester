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

router.get('/dashboard', (req, res) => {
    res.render('user/dashboard', { user: req.user });
});

// keeping the edit page and route for now
// After we implement dynamic edit in the dashboard itself, we can remove this route
router.get('/edit', (req, res) => {
    res.render('user/edit_user', { user: req.user });
});

/* ---Some other api endpoints for nerds--- */
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
        // TODO: show a flash message that profile edits are saved successfully
        res.redirect('/user/dashboard');
    } catch (e) {
        if (existingUser === null) {
            // we could not find that user in our db
            res.render('login/login', {
                user: req.user,
                error_msg: 'We could not find any user with the entered info! Please login again..',
            });
        } else {
            // we could not save the updated details in our db
            res.render('user/edit_user', {
                user: req.user,
                error_msg: 'We could not update the details, please try again..',
            });
        }
    }
});

router.delete('/:id', authorizeUser, async (req, res) => {
    try {
        const user = await User.findById({ _id: req.params.id });
        await user.deleteOne({});
        res.redirect('/auth/login');
        // TODO: show a success message that account is deleted
    } catch (e) {
        res.render('user/dashboard', {
            user: req.user,
            error_msg: 'We could not delete the user with the given id! Please try again..',
        });
    }
});

module.exports = router;
