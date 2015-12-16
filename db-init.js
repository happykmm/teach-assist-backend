var MongoClient = require('mongodb').MongoClient;
var Promise = require('es6-promise').Promise;
var url = 'mongodb://developer:pass1215@121.42.32.84:27017/teaching-assistant';

var promise = new Promise(function (resolve, reject) {
    MongoClient.connect(url, function(err, db) {
        (err === null) ? resolve(db) : reject(err);
    });
});



module.exports = function(req, res, next) {
    promise.then(function(db) {
        req.db = db;
        next();
    }, function(err) {
        console.log(err);
    });
}