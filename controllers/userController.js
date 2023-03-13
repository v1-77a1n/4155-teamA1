const model = require('../models/user');
const bcrypt = require('bcrypt');

//renders the signup page
exports.new = (req, res)=>{
    return res.render('./user/new');
};

//handles signup POST request
exports.newUser = (req, res, next) => {
    let user = new model(req.body);
    user.save()
    .then(() => res.redirect('/users/login'))
    .catch(err => {
        if(err.name === 'ValidationError') {
            err.status = 400;
            err.message = "Bad Database Request";
        }

        if(err.name === 'MongoError') {
            err.status = 400;
            err.message = "Bad Database Request";
        }

        next(err);

    });
};

//renders the login page
exports.login = (req, res) => {
    res.render('./user/login');
};

