var MongoClient = require('mongodb').MongoClient;
var Promise = require('es6-promise').Promise;
var url = 'mongodb://developer:pass1215@121.42.32.84:27017/teaching-assistant';

var promise = new Promise(function (resolve, reject) {
    MongoClient.connect(url, function(err, db) {
        if (err === null)
            resolve(db);
        else {
            console.log(err);
            reject(err);
        }
    });
});



module.exports = function(req, res, next) {
    promise.then(function(db) {
        req.db = db;
        next();
    }, function(err) {
        res.status(500).send("500: Internal Server Error").end();
    });
}


var mongoose = require( 'mongoose' );

// Build the connection string
var dbURI = 'mongodb://developer:pass1215@121.42.32.84:27017/teaching-assistant';

// Create the database connection
mongoose.connect(dbURI);

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection open to ' + dbURI);
});

// If the connection throws an error
mongoose.connection.on('error',function (err) {
    console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});