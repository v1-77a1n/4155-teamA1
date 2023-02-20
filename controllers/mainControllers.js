exports.home = (req, res) => {
    res.render('index');
};

exports.settings = (req, res) => {
    res.render('settings');
}

exports.bookmarks = (req, res) => {
    res.render('bookmarks');
}