//User account model for mongoDB
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt'); //for password hash

const userSchema = new Schema({
    firstName: {type: String, required: [true, 'cannot be empty']},
    lastName:{type: String, required: [true, 'cannot be empty']},
    email: {type: String, required: [true, 'cannot be empty'], unique: true},
    password: {type: String, required: [true, 'cannot be empty'], min: 8, max: 64},
    bookmarks: {type: Array}
});

userSchema.pre('save', function(next) {
    let user = this;
    if(!user.isModified('password')) {
        return next();
    } else {
        bcrypt.hash(user.password, 10)
        .then((hash) => {
            user.password = hash;
            next();
        })
        .catch(err=>next(err));
    }
});

//login methods; comparing user input password to stored hash
userSchema.methods.comparePassword = function(loginPasswdInput) {
    let user = this;
    return bcrypt.compare(loginPasswordInput, user.password);
};

module.exports = mongoose.model('User', userSchema);