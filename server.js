if (process.env.NODE_ENV !== 'production') {
    // development mode
    require('dotenv').config({
        path: '.env'
    })
}

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const textCompression = require('compression');
const methodOverride = require('method-override');
const passport = require('passport');
const session = require('express-session');

// routers
const loginRouter = require('./routes/login');
const userRouter = require('./routes/user');
const { allowOnlyIfAuthenticated, allowOnlyAdmins, handleErrors, passEnvToLocals } = require('./middlewares');

const { initializePassport, initializeDB } = require('./utils/authAndDBSetup');
const { adminRouteInitialSetup } = require('./utils/adminSetup');

const app = express();

initializePassport(); // initialize passport using our own utils
initializeDB(); // connect to mongodb using mongoose
const { adminMain, adminRouter } = adminRouteInitialSetup(); // setup the admin panel with connecting it to the db connection 

// -----pre-middlewares : to be run before all requests-----
app.use(textCompression()); // text compression

app.use(session({
    // express session
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        // sameSite is set to lax, to prevent CSRF attack..
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hrs written in milliseconds
        secure: process.env.NODE_ENV === 'production', // secure only on production environment
        signed: true, // signed cookie
    }
}));

// initialize passport and its respective session too, for having the auth management
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method')); // method override for doing other REST requests

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(expressLayouts);
app.set('layout', 'layouts/layout');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passEnvToLocals); // pass environment variables and some globals to locals in ejs files, for every request

app.use(adminMain.options.rootPath, allowOnlyAdmins, adminRouter); // setup admin panel with admin Router

// routers and routes
app.use('/auth', loginRouter); // for login, we have different middlewares, so we call them in the login routes file only 
app.use('/user', allowOnlyIfAuthenticated, userRouter); // for user, the allowOnlyIfAuthenticated middleware is mandatory for all its requests, so we call it here

app.get('/', (req, res) => {
    res.render('index');
});

// ---post-middlewares - to be run after each request---
// custom error handler -- should be put at the last, after every route
// as the next(err) would hit this error handler after the normal routes..
app.use(handleErrors);

app.get('/*', (req, res) => {
    // 404 page is created differently, so that we just return a 404 not found instead of global error messages
    return res.status(404).render('404'); // 404 page not found page
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));

