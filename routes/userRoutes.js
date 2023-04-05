const express = require('express');
const controller = require('../controllers/userController');
const { isGuest, isLoggedIn } = require('../middlewares/auth');
const router = express.Router();


//Routing for signup page
router.get('/new', isGuest, controller.new);

//Routing for signup POST
router.post('/new', isGuest, controller.newUser);

//Routing for login
router.get('/login', isGuest, controller.login);

//Routing for POST to handle login
router.post('/login', isGuest, controller.loggingIn);

//Routing for requesting password reset as Guest
router.get('/req-pass-change', isGuest, controller.requestPasswdLink);

//Routing for sending password reset link
router.post('/req-pass-change', isGuest, controller.sendPasswordReset);

//Route for getting page for reset password !!GUEST!!
router.get('/reset-password', isGuest, controller.resetPassWdPage);

//Routing for post request to reset password as guest
router.post('/reset-password', isGuest, controller.guestResetPasswd);

//Routing for change account settings
router.get('/change-email', isLoggedIn, controller.changeEmail);
router.get('/change-password', isLoggedIn, controller.changePassword);

//Routing for posts requests for change email and change password
router.post('/change-email', isLoggedIn, controller.emailChangeHandler);
router.post('/change-password', isLoggedIn, controller.passwordChangeHandler);

//Handles logging out
router.get('/logout', isLoggedIn, controller.logout);
module.exports = router;
