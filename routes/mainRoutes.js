const express = require('express');
const controller = require('../controllers/mainControllers');
const router = express.Router();

//Routing for home page
router.get('/', controller.home);

//Routing for settings page
router.get('/settings', controller.settings);

//Routing for bookmarks
router.get('/bookmarks', controller.bookmarks);

module.exports = router;