const express = require('express');
const controller = require('../controllers/userController');
const { isGuest, isLoggedIn } = require('../middlewares/auth');
const { logInLimiter } = require('../middlewares/rateLimiters');
const router = express.Router();


//Routing for signup page
router.get('/new', isGuest, controller.new);

//Routing for signup POST
router.post('/new', isGuest, controller.newUser);

//Routing for login
router.get('/login', isGuest, controller.login);

//Routing for POST to handle login
router.post('/login', logInLimiter, isGuest, controller.loggingIn);

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

//Routing for profile page
router.get('/profile', isLoggedIn, controller.profile);

//Routing for friends page
router.get('/friends', isLoggedIn, controller.friends);

// POST add friend
router.post('/friends', isLoggedIn, controller.addFriend);

// GET request to delete a friend from current user's account
router.get('/delete_friend/:friendId', isLoggedIn, controller.deleteFriend);

//Get send message page
router.get('/send_message', isLoggedIn, controller.sendMessagePage);

//POST for sending and replying to a message
router.post('/send_message', isLoggedIn, controller.sendMessage);

//GET reply message page
router.get('/reply_message', isLoggedIn, controller.reply);

//Routing for messages page
router.get('/messages', isLoggedIn, controller.messages);

//GET individual emssage
router.get('/view_message', isLoggedIn, controller.viewMessage);

//DELETE
router.get('/delete_message', isLoggedIn, controller.deleteMessage);

//Handles logging out
router.get('/logout', isLoggedIn, controller.logout);

module.exports = router;
