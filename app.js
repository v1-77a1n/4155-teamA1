//required modules
const express = require('express');
const morgan = require('morgan');
const mainRoutes = require('./routes/mainRoutes');

const app = express();

let port = 8080;
let host = 'localhost';
app.set('view engine', 'ejs');

app.listen(port, host, ()=> {
    console.log('Server is running on port', port);
})

app.use(express.static('public'));
app.use(morgan('tiny'));

//set up routes
app.use('/', mainRoutes);
