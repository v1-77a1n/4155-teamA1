exports.isGuest = (req, res, next) => {
    if(!req.session.user) {
        return next();
    } else {
        let error = new Error();
        error.status = "";
        error.message = "You are already logged in or you do not have the privilege needed to access this feature.";
        return next(error);
    }
};

exports.isLoggedIn = (req, res, next) => {
    if(req.session.user) {
        return next();
    } else {
        let error = new Error();
        error.status = "";
        error.message = "You need to login first.";
        return next(error);
    }
};

