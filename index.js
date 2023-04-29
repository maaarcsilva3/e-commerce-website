const express = require ('express');
const mysql = require ('mysql');
const bodyparser = require ('express');
const ejs = require ('ejs');
const path= require('path');
const PORT = 3000;



const app = express();

///express session
const { v4: uuidv4 } = require('uuid');
const session = require('express-session');
app.set('trust proxy', 1 );


app.use(session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));



app.get('/setSession', (req, res) => {
    req.session.foo = 'Hello, world!';
    console.log(req.session.foo)
    res.send('Session set!');
});

  
app.get('/getSession', (req, res) => {
    console.log(req.session.foo + "asdfghjkl");
    const myVar = req.session.foo || 'Session not set!';
    res.send(myVar);
});


//to use routes
const routes=   require ('./routes/auth'); //to use routes

app.use ('/', routes); // use the router for all routes starting with '/'




//templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname , 'views'));

//public folder
app.use('/static', express.static (path.join(__dirname , 'public')));
app.set('/assets', express.static (path.join(__dirname , 'public/assets')));










app.listen(PORT, () => {
    console.log('Server is running at Port' + PORT);
});