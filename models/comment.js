const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user.js');

const commentSchema = new Schema({
    comment: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model("Comment", commentSchema);