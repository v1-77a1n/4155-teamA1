const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    sender: {type: Schema.Types.ObjectId, required: [true]},
    recipient: {type: Schema.Types.ObjectId, required: [true]},
    subject: {type: String, required: [true, 'cannot be empty']},
    msg: {type: String, required: [true, 'cannot be empty'], max: 10}
});

module.exports = mongoose.model('Message', messageSchema);