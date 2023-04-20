
const model = require('../models/user');

exports.home = (req, res) => {
    let interestVal = "";
    res.render('index', { interestVal });
};

exports.saveInterestToDb = (req, res, next) => {
    let userInterests = req.body.interest;
    console.log(userInterests);
    let id = req.session.user;
    model.findOneAndUpdate({_id: id}, {$push: {interests: userInterests}})
    .then((user) => {
        req.flash('success', "You've saved your interests!");
        res.redirect('/');
    })
    .catch((err) => {
        req.flash('error', 'There was an issue saving your interest.');
        res.redirect('/');
    })
}

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

exports.delBookmark = (req, res, next) => {
    let title = req.query.title;
    let link = req.query.link;
    console.log(title + " " + link);
    let item = { title, link };
    let id = req.session.user;

    model.findOne({ _id: id }, (err, user) => {
        if (err) { next(err) }

        if (user) {
            model.findOneAndUpdate({ _id: id }, { $pull: { bookmarks: item } }, (err, user) => {
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

exports.about = (req, res) => {
    res.render('about');
};

exports.contact = (req, res) => {
    res.render('contact');
};

exports.terms = (req, res) => {
    res.render('terms');
}