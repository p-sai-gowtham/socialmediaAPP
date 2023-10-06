const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const Post = require('./models/post');
const Comment = require('./models/comment');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const {isLoggedIn, validatePost ,storeReturnTo} = require('./middleware')

mongoose.connect('mongodb://localhost:27017/socialmedia');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: 'thisisthebestsecretever!!!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    res.locals.currentUser = req.user;
    next();
});

app.get('/post', isLoggedIn, catchAsync(async (req, res) => {
    const posts = await Post.find({}).populate('author');
    const user = await User.findById(req.user._id);
    res.render('media/home', { posts, user });
}));

app.get('/post/newpost', isLoggedIn, (async (req, res) => {
    res.render('media/newpost');
}));

app.post('/post/newpost', validatePost, (async (req, res) => {
    const { image, caption } = req.body;
    const post = new Post({
        image,
        caption,
        likes: 0
    })
    post.author = req.user._id;
    await post.save();
    res.redirect(`/post/${post._id}`);
}));
 
app.get('/post/:id',  catchAsync(async (req, res,) => {
    const post = await Post.findById(req.params.id).populate({
        path: 'comments',
        populate: {
            path: 'author'
        }
    }).populate('author');;
    if (!post) {
        req.flash('error', 'Cannot find that post!');
        return res.redirect('/post');
    }
    res.render('media/show', {post});
}));


app.get('/post/:id/edit', isLoggedIn, (catchAsync(async (req, res) => {
    const post = await Post.findById(req.params.id);
    res.render('media/edit', { post });
})));

app.put('/post/:id', validatePost, catchAsync(async (req, res) => {
    req.flash('success', 'Successfully updated post!');
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, { ...req.body });
    
    res.redirect(`/post/${post._id}`);
}));

app.delete('/post/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Post.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted post')
    res.redirect('/post');
}));

app.put('/post/:id/like', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const post = await Post.findById(id);
    post.likes.push(req.user._id);
    await post.save();
    res.redirect(`/post`);
}));

app.put('/post/:id/unlike', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const post = await Post.findById(id);
    post.likes.pop(req.user._id);
    await post.save();
    res.redirect(`/post`);
}));

app.post('/post/:id/comment', isLoggedIn, catchAsync(async (req, res) => {
    const post = await Post.findById(req.params.id);
    const comment = new Comment(req.body);
    comment.author = req.user._id;
    post.comments.push(comment);
    await comment.save();
    await post.save();
    req.flash('success', 'Created new comment!');
    res.redirect(`/post/${post._id}`);
}));



app.get('/register', (req, res) => {
    res.render('users/register');
});

app.post('/register', catchAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Social Media!');
            res.redirect('/post');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

app.delete('/post/:id/comment/:commentId', isLoggedIn, catchAsync(async (req, res) => {
    const { id, commentId } = req.params;
    await Post.findByIdAndUpdate(id, { $pull: { reviews: commentId } });
    await Comment.findByIdAndDelete(commentId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/post/${id}`);
}));

app.get('/login', (req, res) => {
    res.render('users/login');
})

app.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = res.locals.returnTo || '/post';
    res.redirect(redirectUrl);
});

app.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', "Goodbye!");
        res.redirect('/post');
    });
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no, something went wrong!';
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log('Serving on port 3000');
});