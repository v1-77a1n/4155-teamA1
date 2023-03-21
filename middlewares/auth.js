exports.isGuest = (req, res, next) => {
    if(!req.session.user) {
        return next();
    } else {
        req.flash('error', 'You are already logged in or do not have the privilege needed to access this feature.');
        res.redirect('/');
    }
};

exports.isLoggedIn = (req, res, next) => {
    if(req.session.user) {
        return next();
    } else {
        req.flash('error', 'You need to login first.');
        res.redirect('/');
    }
};

