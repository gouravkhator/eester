const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        // whether or not the data comes as upper case or lowercase or mixedcase,
        // it will always save as lowercase if we specify lowercase: true
        validate: [validator.isEmail, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        default: 'general_user',
        immutable: true, // for improving security, and no one can edit the role form webapp or some requests
        // roles will be mutable only in the database end, and not even in admin end, once it is set.
        lowercase: true,
        enum: ['admin', 'general_user'], // enums for having exact roles
    }
});

/* ---Hooks and Middlewares for the schema--- */
userSchema.pre('save', async function (next) {
    try {
        if (this.isModified('password')) {
            const hash = await bcrypt.hash(this.password, 10);
            this.password = hash;
            next();
        }
    } catch {
        next(new Error('Error in saving the details! Please try again..'));
    }
});

// as deleteOne is normally called on the model, but then we can have multiple kinds of conditions
// so to make it simple, we added deleteOne method to the document also
// and check if this refers to Document or to query, and if it is the document, then we can restrict deletion of user with role 'admin'
// to use deleteOne for document, first call find method, then with user instance, we can call deleteOne method
userSchema.pre('deleteOne', { document: true, query: true }, function (next) {
    if (this instanceof mongoose.Document && this.role === 'admin') {
        next(new Error('Admin should not be deleted..'));
    } else {
        next();
    }
});

/* ---Schema Methods--- */
userSchema.methods.passwordIsValid = function (guessedPassword) {
    try {
        return bcrypt.compare(guessedPassword, this.password);
    } catch (err) {
        throw new Error('Password is invalid');
    }
};

module.exports = mongoose.model('User', userSchema);
