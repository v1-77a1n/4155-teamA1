//User account model for mongoDB
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt'); //for password hash

const userSchema = new Schema({
    username: {type: String, required: [true, 'cannot be empty'], unique: true},
    email: {type: String, required: [true, 'cannot be empty'], unique: true},
    password: {type: String, required: [true, 'cannot be empty'], min: 10, max: 25},
    bookmarks: {type: Array}
});

userSchema.pre('save', function(next) {
    let user = thisl
    if(!user.isModified('password')) {
        return next();
    } else {
        bcrypt.hash(user.password, 10)
        .then((hash) => {
            user.password = hash;
            next();
        })
        .catch(err=next(err));
    }
});

//login methods; comparing user input password to stored hash
userSchema.methods.comparePassword = function(loginPasswdInput) {
    let user = this;
    return bcrypt.compare(loginPasswordInput, user.password);
};

module.exports = mongoose.model('User', userSchema);