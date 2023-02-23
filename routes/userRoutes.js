const express = require('express');
const controller = require('../controllers/userController');
const router = express.Router();



router.get('/new', controller.new);

//Routing for login
router.get('/login', controller.login);

module.exports = router;
