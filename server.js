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
const flash = require('express-flash');
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
app.use(flash()); // for messages transfer throughout the app

app.use(session({
    // express session
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hrs written in milliseconds
        secure: process.env.NODE_ENV === 'production', // secure only on production environment
        signed: true,
    }
}));

// passport initialize and session usage
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
app.use('/auth', loginRouter);
app.use('/user', allowOnlyIfAuthenticated, userRouter);

app.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

// ---post-middlewares - to be run after each request---
// custom error handler -- should be put at the last, after every route
// as the next(err) would hit this error handler after the normal routes..
app.use(handleErrors);

app.get('/*', (req, res) => {
    return res.status(404).render('404'); // 404 page not found page
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));

