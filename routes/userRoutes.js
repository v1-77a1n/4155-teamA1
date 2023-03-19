const express = require('express');
const controller = require('../controllers/userController');
const {isGuest, isLoggedIn} = require('../middlewares/auth');
const router = express.Router();


//Routing for signup page
router.get('/new', isGuest, controller.new);

//Routing for signup POST
router.post('/new', isGuest, controller.newUser);

//Routing for login
router.get('/login', isGuest, controller.login);

//Routing for requesting password reset as Guest
router.get('/req-pass-change', isGuest, controller.forgotPassword);

//Routing for sending password reset link
router.post('/req-pass-change', isGuest, controller.sendPasswordRest);

//Routing for change account settings
router.get('/change-email', isLoggedIn, controller.changeEmail);
router.get('/change-password', isLoggedIn, controller.changePassword);

module.exports = router;
