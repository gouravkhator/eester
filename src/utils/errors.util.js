/**
 * A modified AppError to use as the error handling mechanism..
 * It will use statusCode, error message, short msg (to just identify the error and use switch case on short msg for doing certain actions).
 * Lastly, a targetUri is used, to have the target page rendered, on which this error should be displayed. 
 */
class AppError {
    constructor({
        statusCode = 500,
        message = 'Server encountered some error. Please try after sometime..',
        shortMsg = 'server-err',
        targetUri = '/',
    } = {}) {
        this.statusCode = statusCode;
        this.message = message;
        this.shortMsg = shortMsg;
        this.targetUri = targetUri;
    }

    toString() {
        return `STATUS:[${this.statusCode}] | ${this.message}`;
    }
}

module.exports = {
    AppError,
};
