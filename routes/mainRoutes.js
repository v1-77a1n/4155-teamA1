const express = require('express');
const controller = require('../controllers/mainControllers');
const router = express.Router();

//Routing for home page
router.get('/', controller.home);

//Routing for settings page
router.get('/settings', controller.settings);

//Routing for bookmarks
router.get('/bookmarks', controller.bookmarks);

//Routing for login
router.get('/login', controller.login);

module.exports = router;
