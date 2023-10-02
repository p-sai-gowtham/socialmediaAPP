const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    image: String,
    caption: String,
    likes: Number
});

module.exports = mongoose.model('Post', PostSchema);