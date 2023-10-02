const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Post = require('./post.js');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: String
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', UserSchema);