const express = require('express');
const controller = require('../controllers/userController');
const router = express.Router();


//Routing for signup page
router.get('/new', controller.new);

//Routing for signup POST
router.post('/new', controller.newUser);

//Routing for login
router.get('/login', controller.login);

module.exports = router;
