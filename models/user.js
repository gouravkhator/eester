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
});

userSchema.pre('save', async function (next) {
    try {
        if (this.isModified('password')) {
            const hash = await bcrypt.hash(this.password, 10);
            this.password = hash;
            next();
        }
    } catch (err) {
        next(err);
    }
});

userSchema.methods.passwordIsValid = function (guessedPassword) {
    try {
        return bcrypt.compare(guessedPassword, this.password);
    } catch (err) {
        throw err;
    }
};

module.exports = mongoose.model('User', userSchema);
