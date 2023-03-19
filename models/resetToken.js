//MongoDB collection with TTL index
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt'); //compare URL params to stored hash

const resetTokenSchema = new Schema({
    createdAt: {type: Date, required: [true, 'cannot be empty']},
    token: {type: String, required: [true, 'cannot be empty']},
    email: {type: String, required: [true, 'cannot be empty']}
});

//comparing token in URL to stored token
resetTokenSchema.methods.compareTokens = function(urlToken) {
    let rToken = this;
    return bcrypt.compare(rToken.token, urlToken);
};

module.exports = mongoose.model('RToken', resetTokenSchema);