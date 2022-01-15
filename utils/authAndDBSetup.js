const mongoose = require('mongoose');
const passport = require('passport');
// passport strategies
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/User');

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
            // as the status codes for both of this errors in passport auth are different, so we send the status code too from here
            return done(null, false, { error_msg: 'No user found with the entered email id!', statusCode: 404 });
        }

        try {
            if (await user.passwordIsValid(password)) {
                return done(null, user);
            } else {
                return done(null, false, { error_msg: 'Password is incorrect! Please try again..', statusCode: 401 });
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
    mongoose.connect(process.env.MONGO_URI,
        { useNewUrlParser: true, useUnifiedTopology: true });

    const dbConnection = mongoose.connection;
    dbConnection.on('error', err => {
        console.error(err);
    });

    dbConnection.once('open', () => console.log('Connected to mongoose'));
}

module.exports = {
    initializePassport, initializeDB
};
