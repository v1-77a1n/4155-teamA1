//MongoDB collection with TTL index
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt'); //compare URL params to stored hash

const resetTokenSchema = new Schema({
    createdAt: {type: Date, required: [true, 'cannot be empty']},
    token: {type: String, required: [true, 'cannot be empty']},
    email: {type: String, required: [true, 'cannot be empty']}
});

resetTokenSchema.pre('save', function(next) {
    let rToken = this;
    if(!rToken.isModified('token')) {
        return next();
    } else {
        bcrypt.hash(rToken.token, 10)
        .then((hash) => {
            rToken.token = hash;
            next();
        })
        .catch(err=>next(err));
    }
});

//comparing token in URL to stored token
resetTokenSchema.methods.compareTokens = function(urlToken) {
    let rToken = this;
    return bcrypt.compare(urlToken, rToken.token);
};

module.exports = mongoose.model('RToken', resetTokenSchema);