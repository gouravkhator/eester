const ERROR = {
    password_incorrect: 'Password is incorrect! Please try again..',
    user_not_found: 'No user found with those credentials! Please try again..',
    user_notfound_email: 'No user found with the entered email id!',
    user_unauthorized: 'You are unauthorized to view this page!',
};

// TODO: replace new Error() from every place with new AppError(), and also add redirect_url where it should put that error msg 
function AppError({
    statusCode = 500,
    message = 'Server encountered some error. Please try after sometime..',
    shortCode = 'server-err',
} = {}) {
    this.statusCode = statusCode;
    this.shortCode = shortCode;
    this.message = message;

    this.toString = function () {
        return `STATUS:[${this.statusCode}] | ${this.message}`;
    };
}

module.exports = {
    ERROR,
    AppError,
};
