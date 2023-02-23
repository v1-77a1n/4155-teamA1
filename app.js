//required modules
const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const mainRoutes = require('./routes/mainRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

let port = 8080;
let host = 'localhost';
app.set('view engine', 'ejs');

app.listen(port, host, ()=> {
    console.log('Server is running on port', port);
})

//Creates session cookie
app.use(session({
    secret: 'apodkmmq-21opJQfweSDF23edsdad',
    resave: false,
    saveUninitialized: false,
    httpOnly: true,
    cookie: {maxAge: 86400}
}));

app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));

//set up routes
app.use('/', mainRoutes);
app.use('/users', userRoutes);
