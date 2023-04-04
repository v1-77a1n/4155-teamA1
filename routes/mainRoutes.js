const express = require('express');
const controller = require('../controllers/mainControllers');
const {isGuest, isLoggedIn} = require('../middlewares/auth');
const router = express.Router();

//Routing for home page
router.get('/', controller.home);

//Routing for settings page
router.get('/settings', isLoggedIn, controller.settings);

//Routing for adding to bookmarks
router.get('/bookmarks-add', isLoggedIn, controller.addToBookmarks);

//Routing for bookmarks
router.get('/bookmarks', isLoggedIn, controller.bookmarks);

module.exports = router;
