const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    sender: {type: Schema.Types.ObjectId, ref: 'User', required: [true]},
    recipient: {type: Schema.Types.ObjectId, ref: 'User', required: [true]},
    subject: {type: String, required: [true, 'cannot be empty']},
    msg: {type: String, required: [true, 'cannot be empty'], min: 10},
    createdAt: {type: String}
});

messageSchema.pre('save', function(next) {
    let message = this;
    let date = new Date();
    let currDate = date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear();
    message.createdAt = currDate;
    next();
})

module.exports = mongoose.model('Message', messageSchema);