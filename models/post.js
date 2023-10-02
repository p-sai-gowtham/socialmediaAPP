const mongoose = require('mongoose');
const User = require('./user');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    image: String,
    caption: String,
    likes: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

// PostSchema.post('findOneAndDelete', async function (doc) {
//     if (doc) {
//         await Review.deleteMany({
//             _id: {
//                 $in: doc.reviews
//             }
//         })
//     }
// })

module.exports = mongoose.model('Post', PostSchema);