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
        immutable: true,
        lowercase: true,
        enum: ['admin', 'general_user'],
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
    } catch (err) {
        next(err);
    }
});

userSchema.pre('deleteOne', function (next){
    // as deleteOne is called on the model and not on instance, so we have _conditions as the object containing all conditions
    if(this._conditions?.role === 'admin'){
        next(new Error('Admin should not be deleted..'));
    }else{
        next();
    }
});

/* ---Schema Methods--- */
userSchema.methods.passwordIsValid = function (guessedPassword) {
    try {
        return bcrypt.compare(guessedPassword, this.password);
    } catch (err) {
        throw err;
    }
};

module.exports = mongoose.model('User', userSchema);
