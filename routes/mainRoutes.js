const express = require('express');
const controller = require('../controllers/mainControllers');
const { isGuest, isLoggedIn } = require('../middlewares/auth');
const router = express.Router();

//Routing for home page
router.get('/', controller.home);

//Routing for about us page
router.get('/about', controller.about);

//Routing for contact page
router.get('/contact', controller.contact);

//Routing for terms & conditions page
router.get('/terms', controller.terms);

//Routing for settings page
router.get('/settings', isLoggedIn, controller.settings);

//Routing for adding to bookmarks
router.get('/bookmarks-add', isLoggedIn, controller.addToBookmarks);

//remove bookmark
router.get('/bookmarks-del', isLoggedIn, controller.delBookmark);

//add interest
router.post('/', controller.saveInterestToDb);

router.get('/remove-interest', isLoggedIn, controller.removeInterest);

//add dislike
router.post('/dislike', isLoggedIn, controller.saveDislikeToDb);

router.get('/remove-dislike', isLoggedIn, controller.removeDislike);


module.exports = router;
