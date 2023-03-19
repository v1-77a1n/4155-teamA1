//required modules
const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const Mongoose = require('mongoose');
const mainRoutes = require('./routes/mainRoutes');
const userRoutes = require('./routes/userRoutes');
const methodOverride = require('method-override');

const app = express();

const passwd = encodeURIComponent("gyBmKBye8Zq65bM4");
let port = 8080;
let host = 'localhost';
let db = 'mongodb+srv://admin:' + passwd + '@intheloop.ehf95y6.mongodb.net/InTheLoop';
app.set('view engine', 'ejs');

//Connecting to Database
Mongoose.set('strictQuery', false);
Mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
    app.listen(port, host, ()=> {
        console.log('Server is running on port', port);
    });
})
.catch(err=>console.log(err.message));

//Creates session cookie
app.use(session({
    secret: 'apodkmmq-21opJQfweSDF23edsdad',
    resave: false,
    saveUninitialized: false,
    httpOnly: true,
    cookie: {maxAge: 86400}
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user||null;
    next();
});

app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));

//set up routes
app.use('/', mainRoutes);
app.use('/users', userRoutes);

app.use((req, res, next) => {
    let err = new Error('The server cannot locate ' + req.url);
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    console.log(err.stack);
    if (!err.status){
        err.status = 500;
        err.message = ("Internal Server Error");
    }

    res.status(err.status);
    res.render('error', {error: err});
});