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