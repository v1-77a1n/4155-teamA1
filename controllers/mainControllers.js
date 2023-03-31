
const model = require('../models/user');

exports.home = (req, res) => {
    res.render('index');
};

exports.settings = (req, res) => {
    res.render('settings');
};

exports.bookmarks = (req, res) => {
    let id = req.session.user;
    model.findOne({ _id: id }, (err, user) => {
        res.render('bookmarks', {user});
    });    
};

