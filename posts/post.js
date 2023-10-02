const mongoose = require('mongoose');
const Post = require('../models/post');

mongoose.connect('mongodb://localhost:27017/socialmedia');

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const postDB = async () => {
    await Post.deleteMany({});
    for (let i = 0; i < 5; i++) {
        const post = new Post({
            author: '6516a275f12d9ab5250ba9c0',
            image: 'https://source.unsplash.com/collection/190727/1600x900',
            caption: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            likes: 0
        })
        await post.save();
    }
}

postDB().then(() => {
    mongoose.connection.close();
})