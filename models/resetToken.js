//MongoDB collection with TTL index
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt'); //compare URL params to stored hash

const resetTokenSchema = new Schema({
    createdAt: {type: Date, required: [true, 'cannot be empty']},
    token: {type: String, required: [true, 'cannot be empty']},
    hashed_id: {type: String, required: [true, 'cannot be empty']}
});

module.exports = mongoose.model('RToken', 'resetTokenSchema');