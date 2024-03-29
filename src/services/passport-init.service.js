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
        3rd param is the object containing error message and http status code for the user.
        
        As the status codes for both of the below errors in passport auth are different, so we send the status code too from here..
        And while logigng in, we use this status code to be thrown. 
        */
        if (user == null) {
            // user does not exist
            return done(null, false, { error_msg: 'No user found with the entered email id!', statusCode: 404 });
        }

        try {
            if (await user.passwordIsValid(password)) {
                // user's password is invalid
                return done(null, user);
            } else {
                return done(null, false, { error_msg: 'Password is incorrect! Please try again..', statusCode: 401 });
            }
        } catch (e) {
            return done(e); // some other server error
        }
    }

    /*
    by default username field for logins are 'username', but if we use some other fields for login, we specify that name.
    it will be same as the name attribute for that input in login form
    for password, default local strategy will take 'password' as the field, and we also used that in form, 
    so we need not specifically add that in options of local strategy.
    */
    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));

    // serialize user object while logging in, which will return a user id to identify that user throughout the auth session..
    passport.serializeUser((user, done) => done(null, user._id));

    // deserialize user to get info from his unique id, while using user in the session
    passport.deserializeUser(async (_id, done) => {
        return done(null, await User.findById(_id));
    });
}

module.exports = {
    initializePassport,
};
