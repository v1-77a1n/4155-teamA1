
exports.new = (req, res)=>{
    return res.render('./user/new');
};

exports.login = (req, res) => {
    res.render('./user/login');
}

