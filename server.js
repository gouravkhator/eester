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

const ERROR_CODES = require('./utils/_globals');
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
    req.flash(ERROR_CODES.PASSWORD_INCORRECT, 'Password is incorrect! Please retry again..');
    req.flash(ERROR_CODES.USER_NOT_FOUND, 'User does not exists with that email id..');
    next();
});

app.use(adminMain.options.rootPath, allowOnlyAdmins, adminRouter); // setup admin panel with admin Router

// routers and routes
app.use('/auth', loginRouter);
app.use('/user', allowOnlyIfAuthenticated, userRouter);

app.get('/', (req, res) => {
    res.render('main', { user: req.user });
});

app.get('/*', (req, res) => {
    res.render('404', { user: req.user }); // 404 page not found page
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
