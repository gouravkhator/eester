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
const { allowOnlyIfAuthenticated, allowOnlyAdmins } = require('./middlewares');

const { ERROR } = require('./utils/_globals');
const { initializePassport, initializeDB } = require('./utils/authAndDBSetup');
const { adminRouteInitialSetup } = require('./utils/adminSetup');

const app = express();

initializePassport(); // initialize passport using our own utils
initializeDB(); // connect to mongodb using mongoose
const { adminMain, adminRouter } = adminRouteInitialSetup(); // setup the admin panel with connecting it to the db connection 

// -----middlewares : global for all requests-----
app.use(textCompression()); // text compression
app.use(flash()); // for messages transfer throughout the app

app.use(session({
    // express session
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
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

// to support flash message
app.use((req, res, next) => {
    req.flash('password_incorrect', ERROR.password_incorrect);
    req.flash('user_not_found', ERROR.user_not_found);
    next();
});

app.use(adminMain.options.rootPath, allowOnlyAdmins, adminRouter); // setup admin panel with admin Router

// routers and routes
app.use('/auth', loginRouter);
app.use('/user', allowOnlyIfAuthenticated, userRouter);

app.get('/', (req, res) => {
    res.render('main', { user: req.user });
});

// custom error handler -- should be put at the last, after every route
// as the next calls with err would hit this error handler afterwards..
app.use((err, req, res, next) => {
    res.locals.error_msg = err.message;
    res.status(err.statusCode ?? 500);
    // ? INFO: res.locals does not work with redirect method, we have to use render here
    res.redirect(err.redirectUrl ?? '/');
});

app.get('/*', (req, res) => {
    res.render('404', { user: req.user }); // 404 page not found page
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
