const router = require('express').Router();

router.get('/settings', (req, res) => {
    res.render('user/settings', {user: req.user});
});

router.get('/:id', (req, res) => {
    res.send(req.params.id);
});

router.put('/:id', (req, res) => {

});

router.delete('/:id', (req, res) => {

});

module.exports = router;
