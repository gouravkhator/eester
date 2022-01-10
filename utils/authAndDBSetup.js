const passport = require('passport');
const mongoose = require('mongoose');
const User = require('../models/user');

const ERROR_CODES = require('./_globals');

// passport strategies
const LocalStrategy = require('passport-local').Strategy;

function initializePassport() {
    const authenticateUser = async (email, password, done) => {
        // search user by email, then check if the user's login credentials are valid or not
        // if yes, then authenticate the user 
        const user = await User.findOne({ email });

        /*
        done callback:

        First param to done is null if there is no issue at server end.
        2nd param to done is false if the user has entered something wrong.
        3rd param is the object containing error message for the user.
        */
        if (user == null) {
            return done(null, false, { error_code: ERROR_CODES.USER_NOT_FOUND });
        }

        try {
            if (await user.passwordIsValid(password)) {
                return done(null, user);
            } else {
                return done(null, false, { error_code: ERROR_CODES.PASSWORD_INCORRECT });
            }
        } catch (e) {
            return done(e);
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));

    passport.serializeUser((user, done) => done(null, user._id));

    passport.deserializeUser(async (_id, done) => {
        return done(null, await User.findById(_id));
    });
}

function initializeDB() {
    mongoose.connect(process.env.DATABASE_URL,
        { useNewUrlParser: true, useUnifiedTopology: true });

    const db = mongoose.connection;
    db.on('error', err => {
        console.error(err);
    });

    db.once('open', () => console.log('Connected to mongoose'));
}

module.exports = {
    initializePassport, initializeDB
};
