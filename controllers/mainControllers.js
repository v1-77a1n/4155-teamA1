
const model = require('../models/user');

exports.home = (req, res) => {
    res.render('index');
};

exports.settings = (req, res) => {
    res.render('settings');
};

exports.addToBookmarks = (req, res, next) => {
    let title = req.query.title;
    let link = req.query.link;
    console.log(title + " " + link);
    let item = { title, link };
    let id = req.session.user;

    model.findOne({ _id: id }, (err, user) => {
        if (err) { next(err) }

        if (user) {
            model.findOneAndUpdate({ _id: id }, { $push: { bookmarks: item } }, (err, user) => {
                if (err) { next(err) }

                if (user) {
                    req.flash('success', 'The event has been added to your bookmarks');
                    res.redirect('/bookmarks');
                } else {
                    req.flash('error', 'There was an error adding this event to your bookmarks.');
                    res.redirect('/');
                }
            })
        } else {
            req.flash('error', 'There was an error adding this event to your bookmarks.');
            res.redirect('/');
        }
    })
}

exports.bookmarks = (req, res) => {
    let id = req.session.user;
    model.findOne({ _id: id }, (err, user) => {
        res.render('bookmarks', { user });
    });
};

exports.about = (req, res) => {
    res.render('about');
};

exports.contact = (req, res) => {
    res.render('contact');
};

exports.terms = (req, res) => {
    res.render('terms');
}
