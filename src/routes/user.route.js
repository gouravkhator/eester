const router = require('express').Router();

const userController = require('../controllers/user.controller');
const { authorizeUser } = require('../middlewares/user.middleware');

router.get('/dashboard', (req, res) => {
    return res.render('user/dashboard');
});

// keeping the edit page and route for now
// After we implement dynamic edit in the dashboard itself, we can remove this route
router.get('/edit', (req, res) => {
    return res.render('user/edit_user');
});

/* ---Some other api endpoints for nerds--- */
router.get('/:id', authorizeUser, userController.getUserByID);

router.put('/:id', authorizeUser, userController.updateUser);

router.delete('/:id', authorizeUser, userController.deleteUser);

module.exports = router;
