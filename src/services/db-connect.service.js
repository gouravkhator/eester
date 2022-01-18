const mongoose = require('mongoose');

function connectDB() {
    mongoose.connect(process.env.MONGO_URI,
        { useNewUrlParser: true, useUnifiedTopology: true });

    const dbConnection = mongoose.connection;
    dbConnection.on('error', err => {
        console.error(err);
    });

    dbConnection.once('open', () => console.log('Connected to mongoose'));
}

module.exports = {
    connectDB,
};
