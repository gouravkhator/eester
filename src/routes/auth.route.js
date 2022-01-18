const router = require('express').Router();

const authController = require('../controllers/auth.controller');
const { skipLoginsIfAuthenticated, allowOnlyIfAuthenticated } = require('../middlewares/auth.middleware');

router.get('/login', skipLoginsIfAuthenticated, (req, res) => {
    return res.render('auth/login');
});

router.get('/signup', skipLoginsIfAuthenticated, (req, res) => {
    return res.render('auth/signup');
});

router.post('/login', skipLoginsIfAuthenticated, authController.login);

router.post('/signup', skipLoginsIfAuthenticated, authController.signup);

router.post('/verify', skipLoginsIfAuthenticated, authController.verifyOTP);

router.post('/logout', allowOnlyIfAuthenticated, authController.logout);

module.exports = router;
